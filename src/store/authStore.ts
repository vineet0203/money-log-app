import { create } from "zustand";
import axios from "axios";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

interface AuthState {
  isAuthenticated: boolean;
  phoneNumber: string | null;
  isOtpSent: boolean;
  user: any | null;
  token: string | null;
  isProfileComplete: boolean;
  sendOtp: (phone: string) => Promise<{ success: boolean; error?: string }>;
  verifyOtp: (
    code: string,
  ) => Promise<{
    success: boolean;
    isProfileComplete: boolean;
    error?: string;
  }>;
  completeProfile: (
    data: FormData | { name: string; email?: string }
  ) => Promise<{ success: boolean; error?: string }>;
  isInitialized: boolean;
  initAuth: () => Promise<void>;
  logout: () => void;
}

export const getBackendUrl = () => {
  // If you are testing on a PHYSICAL device with Expo Go, use your computer's local Wi-Fi IP:
  return 'http://10.192.44.91:5001';

  // If you are running on an Android Emulator on your computer screen, uncomment this instead:
  // return 'http://10.0.2.2:5001';
};

// Setup global axios instance/interceptor for the auth store
export const authApi = axios.create({
  baseURL: getBackendUrl(),
});

authApi.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// We can add a response interceptor here later to handle 401s and refresh tokens automatically

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
      console.error("Error sending OTP:", error);
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

      // Save tokens securely
      await SecureStore.setItemAsync("accessToken", accessToken);
      await SecureStore.setItemAsync("refreshToken", refreshToken);

      set({
        isAuthenticated: true,
        user,
        token: accessToken,
        isProfileComplete,
      });
      return { success: true, isProfileComplete };
    } catch (error: any) {
      console.error("Error verifying OTP:", error);
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
      
      set({ isProfileComplete: true });
      return { success: true };
    } catch (error: any) {
      console.error("Error completing profile:", error);
      const message =
        error.response?.data?.error ||
        error.response?.data?.details?.[0]?.message ||
        "Network error: Failed to connect to server";
      return { success: false, error: message };
    }
  },

  logout: async () => {
    await SecureStore.deleteItemAsync("accessToken");
    await SecureStore.deleteItemAsync("refreshToken");
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
      const token = await SecureStore.getItemAsync("accessToken");
      if (token) {
        try {
          const response = await authApi.get("/api/users/profile");
          const user = response.data;
          set({
            isAuthenticated: true,
            user,
            token,
            isProfileComplete: !!(user.name && user.email),
          });
        } catch (error: any) {
          if (error.response?.status === 401) {
            const refreshToken = await SecureStore.getItemAsync("refreshToken");
            if (refreshToken) {
              const refreshResponse = await axios.post(`${getBackendUrl()}/api/auth/refresh-token`, { refreshToken });
              const { accessToken: newAccessToken, refreshToken: newRefreshToken } = refreshResponse.data;
              await SecureStore.setItemAsync("accessToken", newAccessToken);
              await SecureStore.setItemAsync("refreshToken", newRefreshToken);
              
              const retryResponse = await axios.get(`${getBackendUrl()}/api/users/profile`, {
                headers: { Authorization: `Bearer ${newAccessToken}` }
              });
              const user = retryResponse.data;
              set({
                isAuthenticated: true,
                user,
                token: newAccessToken,
                isProfileComplete: !!(user.name && user.email),
              });
            }
          }
        }
      }
    } catch (e) {
      console.log('Failed to initialize auth:', e);
    } finally {
      set({ isInitialized: true });
    }
  }
}));
