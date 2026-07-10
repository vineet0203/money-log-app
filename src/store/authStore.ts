import { create } from "zustand";
import axios from "axios";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";

interface AuthState {
  isAuthenticated: boolean;
  phoneNumber: string | null;
  isOtpSent: boolean;
  user: any | null;
  token: string | null;
  isProfileComplete: boolean;
  sendOtp: (phone: string) => Promise<{ success: boolean; error?: string }>;
  verifyOtp: (code: string) => Promise<{
    success: boolean;
    isProfileComplete: boolean;
    error?: string;
  }>;
  completeProfile: (
    data: FormData | { name: string; email?: string },
  ) => Promise<{ success: boolean; error?: string }>;
  isInitialized: boolean;
  initAuth: () => Promise<void>;
  logout: () => void;
}

export const getBackendUrl = () => {
  // If you are testing on a PHYSICAL device with Expo Go, use your computer's local Wi-Fi IP:
  return "https://moneylog.com/api";

  // If you are running on an Android Emulator on your computer screen, uncomment this instead:
  // return 'http://10.0.2.2:5001';
};

// Setup global axios instance/interceptor for the auth store
export const authApi = axios.create({
  baseURL: getBackendUrl(),
});

authApi.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let failedQueue: { resolve: (value?: unknown) => void, reject: (reason?: any) => void }[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

authApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, wait in the queue
        try {
          const token = await new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          });
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return authApi(originalRequest);
        } catch (err) {
          return Promise.reject(err);
        }
      }

      originalRequest._retry = true;
      isRefreshing = true;
      
      try {
        const refreshToken = await AsyncStorage.getItem("refreshToken");
        if (!refreshToken) {
          throw new Error("No refresh token");
        }

        const refreshResponse = await axios.post(
          `${getBackendUrl()}/api/auth/refresh-token`,
          { refreshToken },
        );
        
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = refreshResponse.data;

        await AsyncStorage.setItem("accessToken", newAccessToken);
        await AsyncStorage.setItem("refreshToken", newRefreshToken);

        useAuthStore.setState({ token: newAccessToken });

        // Resolve all queued requests with the new token
        processQueue(null, newAccessToken);
        
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return authApi(originalRequest);
        
      } catch (e) {
        processQueue(e, null);
        useAuthStore.getState().logout();
        return Promise.reject(e);
      } finally {
        isRefreshing = false;
      }
    }
    
    if (error.response?.status !== 401) {
      const message =
        error.response?.data?.error ||
        error.response?.data?.details?.[0]?.message ||
        "Network error. Please try again.";
      Toast.show({
        type: "error",
        text1: "Error",
        text2: message,
      });
    }
    return Promise.reject(error);
  },
);

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  phoneNumber: null,
  isOtpSent: false,
  user: null,
  token: null,
  isProfileComplete: false,

  sendOtp: async (phone: string) => {
    try {
      await authApi.post("/api/auth/send-otp", { phone });
      set({ phoneNumber: phone, isOtpSent: true });
      return { success: true };
    } catch (error: any) {
      console.log("Error sending OTP:", error);
      const message =
        error.response?.data?.error ||
        error.response?.data?.details?.[0]?.message ||
        "Network error: Failed to connect to server";
      return { success: false, error: message };
    }
  },

  verifyOtp: async (code: string) => {
    const { phoneNumber } = get();

    try {
      const response = await authApi.post("/api/auth/verify-otp", {
        phone: phoneNumber,
        code,
      });

      const { accessToken, refreshToken, user, isProfileComplete } =
        response.data;

      // Save tokens and user data securely
      await AsyncStorage.setItem("accessToken", accessToken);
      await AsyncStorage.setItem("refreshToken", refreshToken);
      await AsyncStorage.setItem("user", JSON.stringify(user));
      await AsyncStorage.setItem(
        "isProfileComplete",
        isProfileComplete.toString(),
      );

      set({
        isAuthenticated: true,
        user,
        token: accessToken,
        isProfileComplete,
      });
      return { success: true, isProfileComplete };
    } catch (error: any) {
      console.log("Error verifying OTP:", error);
      const message =
        error.response?.data?.error ||
        error.response?.data?.details?.[0]?.message ||
        "Network error: Failed to connect to server";
      return { success: false, isProfileComplete: false, error: message };
    }
  },

  completeProfile: async (data: any) => {
    const { user } = get();
    if (!user) return { success: false, error: "User not logged in" };

    try {
      if (data instanceof FormData) {
        await authApi.put("/api/users/profile", data, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        await authApi.post("/api/auth/complete-profile", data);
      }

      await AsyncStorage.setItem("isProfileComplete", "true");

      const newName = data instanceof FormData ? data._parts.find((p: any) => p[0] === 'name')?.[1] : data.name;

      set((state) => ({ 
        isProfileComplete: true,
        user: state.user ? { ...state.user, name: newName || state.user.name } : null
      }));
      return { success: true };
    } catch (error: any) {
      console.log("Error completing profile:", error);
      const message =
        error.response?.data?.error ||
        error.response?.data?.details?.[0]?.message ||
        "Network error: Failed to connect to server";
      return { success: false, error: message };
    }
  },

  logout: async () => {
    try {
      const pushToken = await AsyncStorage.getItem("pushToken");
      const refreshToken = await AsyncStorage.getItem("refreshToken");
      if (refreshToken || pushToken) {
        await authApi.post("/api/auth/logout", { refreshToken, pushToken });
      }
    } catch (e) {
      console.log("Error during backend logout API call:", e);
    }

    await AsyncStorage.multiRemove([
      "accessToken",
      "refreshToken",
      "pushToken",
      "user",
      "isProfileComplete",
    ]);
    set({
      isAuthenticated: false,
      phoneNumber: null,
      isOtpSent: false,
      user: null,
      token: null,
      isProfileComplete: false,
    });
  },

  isInitialized: false,
  initAuth: async () => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      const storedUserStr = await AsyncStorage.getItem("user");
      const storedProfileCompleteStr =
        await AsyncStorage.getItem("isProfileComplete");

      if (token) {
        // Optimistically set the state from local cache
        if (storedUserStr) {
          set({
            isAuthenticated: true,
            user: JSON.parse(storedUserStr),
            token,
            isProfileComplete: storedProfileCompleteStr === "true",
          });
        }

        try {
          const response = await authApi.get("/api/users/profile");
          const user = response.data;
          const isComplete = !!(user.name && user.email);

          await AsyncStorage.setItem("user", JSON.stringify(user));
          await AsyncStorage.setItem(
            "isProfileComplete",
            isComplete.toString(),
          );

          set({
            isAuthenticated: true,
            user,
            token,
            isProfileComplete: isComplete,
          });
        } catch (error: any) {
          if (error.response?.status === 401) {
            const refreshToken = await AsyncStorage.getItem("refreshToken");
            if (refreshToken) {
              const refreshResponse = await axios.post(
                `${getBackendUrl()}/api/auth/refresh-token`,
                { refreshToken },
              );
              const {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
              } = refreshResponse.data;
              await AsyncStorage.setItem("accessToken", newAccessToken);
              await AsyncStorage.setItem("refreshToken", newRefreshToken);

              const retryResponse = await axios.get(
                `${getBackendUrl()}/api/users/profile`,
                {
                  headers: { Authorization: `Bearer ${newAccessToken}` },
                },
              );
              const user = retryResponse.data;
              const isComplete = !!(user.name && user.email);

              await AsyncStorage.setItem("user", JSON.stringify(user));
              await AsyncStorage.setItem(
                "isProfileComplete",
                isComplete.toString(),
              );

              set({
                isAuthenticated: true,
                user,
                token: newAccessToken,
                isProfileComplete: isComplete,
              });
            } else {
              set({ isAuthenticated: false, user: null, token: null });
              await AsyncStorage.multiRemove([
                "accessToken",
                "refreshToken",
                "pushToken",
                "user",
                "isProfileComplete",
              ]);
            }
          }
        }
      }
    } catch (e) {
      console.log("Failed to initialize auth:", e);
    } finally {
      set({ isInitialized: true });
    }
  },
}));
