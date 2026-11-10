import { create } from "zustand";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";

interface AuthState {
  isAuthenticated: boolean;
  phoneNumber: string | null;
  pendingEmail: string | null;
  hasSeenOnboarding: boolean;
  isOtpSent: boolean;
  user: any | null;
  token: string | null;
  isProfileComplete: boolean;
  isInitialized: boolean;
  setHasSeenOnboarding: (seen: boolean) => Promise<void>;

  // New Primary Authentication Methods
  login: (
    email: string,
    password: string
  ) => Promise<{
    success: boolean;
    requiresEmailVerification?: boolean;
    email?: string;
    error?: string;
  }>;
  signup: (data: {
    name: string;
    email: string;
    phone_number: string;
    password: string;
  }) => Promise<{
    success: boolean;
    requiresEmailVerification?: boolean;
    email?: string;
    error?: string;
    conflict?: string;
    fields?: {
      email?: string;
      phone?: string;
    };
  }>;
  verifyEmailOtp: (code: string) => Promise<{ success: boolean; error?: string }>;
  resendEmailOtp: () => Promise<{ success: boolean; error?: string }>;
  forgotPassword: (
    email: string
  ) => Promise<{ success: boolean; message?: string; error?: string }>;
  resetPassword: (
    token: string,
    newPassword: string
  ) => Promise<{ success: boolean; error?: string }>;
  setPendingEmail: (email: string | null) => void;

  // Legacy OTP Flows (Kept for backward compatibility)
  sendOtp: (phone: string) => Promise<{ success: boolean; error?: string }>;
  verifyOtp: (code: string) => Promise<{
    success: boolean;
    isProfileComplete: boolean;
    error?: string;
  }>;
  completeProfile: (
    data: FormData | { name: string; email?: string }
  ) => Promise<{ success: boolean; error?: string }>;

  initAuth: () => Promise<void>;
  logout: () => void;
  deleteAccount: (email: string) => Promise<{ success: boolean; error?: string }>;
}

export const getBackendUrl = () => {
  const url = process.env.EXPO_PUBLIC_API_URL || "http://localhost:5001/api";
  return url.endsWith("/") ? url : url + "/";
};

// Setup global axios instance for the auth store
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
let failedQueue: {
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
}[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
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

    // If request already retried and still got 401, or refresh endpoint itself failed
    if (
      (error.response?.status === 401 && originalRequest?._retry) ||
      (originalRequest?.url?.includes("/auth/refresh-token") &&
        (error.response?.status === 401 || error.response?.status === 400))
    ) {
      useAuthStore.getState().logout();
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest?._retry) {
      if (isRefreshing) {
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
          `${getBackendUrl()}auth/refresh-token`,
          { refreshToken }
        );

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
          refreshResponse.data;

        await AsyncStorage.setItem("accessToken", newAccessToken);
        await AsyncStorage.setItem("refreshToken", newRefreshToken);

        useAuthStore.setState({ token: newAccessToken });

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

    // Suppress intrusive global toast popups for auth pages so inline form errors render cleanly
    const isAuthRoute =
      originalRequest?.url?.includes("/auth/login") ||
      originalRequest?.url?.includes("/auth/signup") ||
      originalRequest?.url?.includes("/auth/verify-email-otp") ||
      originalRequest?.url?.includes("/auth/resend-email-otp") ||
      originalRequest?.url?.includes("/auth/forgot-password") ||
      originalRequest?.url?.includes("/auth/reset-password") ||
      originalRequest?.url?.includes("/auth/refresh-token") ||
      error.response?.status === 401;

    if (!isAuthRoute) {
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
  }
);

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  phoneNumber: null,
  pendingEmail: null,
  hasSeenOnboarding: false,
  isOtpSent: false,
  user: null,
  token: null,
  isProfileComplete: true,
  isInitialized: false,

  setHasSeenOnboarding: async (seen: boolean) => {
    if (seen) {
      await AsyncStorage.setItem("hasSeenOnboarding", "true");
    } else {
      await AsyncStorage.removeItem("hasSeenOnboarding");
    }
    set({ hasSeenOnboarding: seen });
  },

  setPendingEmail: (email: string | null) => {
    if (email) {
      AsyncStorage.setItem("pendingEmail", email);
    } else {
      AsyncStorage.removeItem("pendingEmail");
    }
    set({ pendingEmail: email });
  },

  // 1. Email & Password Login
  login: async (email: string, password: string) => {
    try {
      const response = await authApi.post("auth/login", { email, password });
      const { accessToken, refreshToken, user } = response.data;

      await AsyncStorage.setItem("accessToken", accessToken);
      await AsyncStorage.setItem("refreshToken", refreshToken);
      await AsyncStorage.setItem("user", JSON.stringify(user));
      await AsyncStorage.setItem("isProfileComplete", "true");
      await AsyncStorage.removeItem("pendingEmail");

      set({
        isAuthenticated: true,
        user,
        token: accessToken,
        pendingEmail: null,
        phoneNumber: user.phone_number || null,
        isProfileComplete: true,
      });

      return { success: true };
    } catch (error: any) {
      const requiresVerification =
        error.response?.data?.requiresEmailVerification ||
        error.response?.status === 403;

      if (requiresVerification) {
        const targetEmail = error.response?.data?.email || email;
        await AsyncStorage.setItem("pendingEmail", targetEmail);
        set({ pendingEmail: targetEmail });

        return {
          success: false,
          requiresEmailVerification: true,
          email: targetEmail,
          error:
            error.response?.data?.error ||
            "Please verify your email address to log in.",
        };
      }

      const message =
        error.response?.data?.error ||
        error.response?.data?.details?.[0]?.message ||
        "Login failed. Please check your credentials.";

      return { success: false, error: message };
    }
  },

  // 2. Full Account Registration
  signup: async (data: {
    name: string;
    email: string;
    phone_number: string;
    password: string;
  }) => {
    try {
      const payload = {
        name: data.name,
        email: data.email,
        password: data.password,
        phone: data.phone_number,
        phone_number: data.phone_number,
      };
      const response = await authApi.post("auth/signup", payload);
      const targetEmail = response.data?.email || data.email;

      await AsyncStorage.setItem("pendingEmail", targetEmail);
      set({ pendingEmail: targetEmail });

      return {
        success: true,
        requiresEmailVerification: true,
        email: targetEmail,
      };
    } catch (error: any) {
      const data = error.response?.data;
      const message =
        data?.error ||
        data?.message ||
        data?.details?.[0]?.message ||
        "Registration failed. Please try again.";
      return {
        success: false,
        error: message,
        fields: data?.fields,
        conflict: data?.conflict,
      };
    }
  },

  // 3. Verify Email 6-Digit OTP
  verifyEmailOtp: async (code: string) => {
    const { pendingEmail } = get();
    const emailToVerify =
      pendingEmail || (await AsyncStorage.getItem("pendingEmail"));

    if (!emailToVerify) {
      return { success: false, error: "No pending email verification found." };
    }

    try {
      const response = await authApi.post("auth/verify-email-otp", {
        email: emailToVerify.trim().toLowerCase(),
        otp: code.trim(),
        code: code.trim(),
      });

      const { accessToken, refreshToken, user } = response.data;

      await AsyncStorage.setItem("accessToken", accessToken);
      await AsyncStorage.setItem("refreshToken", refreshToken);
      await AsyncStorage.setItem("user", JSON.stringify(user));
      await AsyncStorage.setItem("isProfileComplete", "true");
      await AsyncStorage.removeItem("pendingEmail");

      set({
        isAuthenticated: true,
        user,
        token: accessToken,
        pendingEmail: null,
        phoneNumber: user.phone_number || null,
        isProfileComplete: true,
      });

      return { success: true };
    } catch (error: any) {
      const message =
        error.response?.data?.error ||
        error.response?.data?.details?.[0]?.message ||
        "Invalid or expired verification code.";
      return { success: false, error: message };
    }
  },

  // 4. Resend 6-Digit Email OTP
  resendEmailOtp: async () => {
    const { pendingEmail } = get();
    const emailToVerify =
      pendingEmail || (await AsyncStorage.getItem("pendingEmail"));

    if (!emailToVerify) {
      return { success: false, error: "No pending email verification found." };
    }

    try {
      await authApi.post("auth/resend-email-otp", { email: emailToVerify });
      return { success: true };
    } catch (error: any) {
      const message =
        error.response?.data?.error ||
        error.response?.data?.details?.[0]?.message ||
        "Failed to resend verification code.";
      return { success: false, error: message };
    }
  },

  // 5. Forgot Password Request
  forgotPassword: async (email: string) => {
    try {
      const response = await authApi.post("auth/forgot-password", { email });
      return {
        success: true,
        message:
          response.data?.message ||
          "If an account exists with that email, reset instructions have been sent.",
      };
    } catch (error: any) {
      const message =
        error.response?.data?.error ||
        error.response?.data?.details?.[0]?.message ||
        "Failed to request password reset.";
      return { success: false, error: message };
    }
  },

  // 6. Reset Password Confirmation
  resetPassword: async (token: string, newPassword: string) => {
    try {
      await authApi.post("auth/reset-password", {
        token: token.trim(),
        newPassword,
      });
      return { success: true };
    } catch (error: any) {
      const message =
        error.response?.data?.error ||
        error.response?.data?.details?.[0]?.message ||
        "Failed to reset password. The link or code may have expired.";
      return { success: false, error: message };
    }
  },

  // --- Legacy Compatibility Methods ---
  sendOtp: async (phone: string) => {
    try {
      await authApi.post("auth/send-otp", { phone });
      set({ phoneNumber: phone, isOtpSent: true });
      return { success: true };
    } catch (error: any) {
      const message =
        error.response?.data?.error ||
        error.response?.data?.details?.[0]?.message ||
        "Failed to send OTP";
      return { success: false, error: message };
    }
  },

  verifyOtp: async (code: string) => {
    const { phoneNumber } = get();
    try {
      const response = await authApi.post("auth/verify-otp", {
        phone: phoneNumber,
        code,
      });
      const { accessToken, refreshToken, user, isProfileComplete } =
        response.data;

      await AsyncStorage.setItem("accessToken", accessToken);
      await AsyncStorage.setItem("refreshToken", refreshToken);
      await AsyncStorage.setItem("user", JSON.stringify(user));
      await AsyncStorage.setItem("isProfileComplete", "true");

      set({
        isAuthenticated: true,
        user,
        token: accessToken,
        isProfileComplete: true,
      });
      return { success: true, isProfileComplete: true };
    } catch (error: any) {
      const message =
        error.response?.data?.error ||
        error.response?.data?.details?.[0]?.message ||
        "Failed to verify OTP";
      return { success: false, isProfileComplete: false, error: message };
    }
  },

  completeProfile: async (data: any) => {
    try {
      if (data instanceof FormData) {
        await authApi.put("users/profile", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await authApi.put("users/profile", data);
      }
      return { success: true };
    } catch (error: any) {
      const message =
        error.response?.data?.error ||
        error.response?.data?.details?.[0]?.message ||
        "Failed to update profile";
      return { success: false, error: message };
    }
  },

  logout: async () => {
    try {
      const pushToken = await AsyncStorage.getItem("pushToken");
      const refreshToken = await AsyncStorage.getItem("refreshToken");
      if (refreshToken || pushToken) {
        await authApi.post("auth/logout", { refreshToken, pushToken });
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
      "pendingEmail",
    ]);

    set({
      isAuthenticated: false,
      phoneNumber: null,
      pendingEmail: null,
      isOtpSent: false,
      user: null,
      token: null,
      isProfileComplete: false,
    });
  },

  deleteAccount: async (email: string) => {
    try {
      await authApi.delete("users/account", { data: { email } });

      await AsyncStorage.multiRemove([
        "accessToken",
        "refreshToken",
        "pushToken",
        "user",
        "isProfileComplete",
        "pendingEmail",
      ]);

      set({
        isAuthenticated: false,
        phoneNumber: null,
        pendingEmail: null,
        isOtpSent: false,
        user: null,
        token: null,
        isProfileComplete: false,
      });

      return { success: true };
    } catch (error: any) {
      console.log("Error deleting account:", error);
      const message =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Failed to delete account";
      return { success: false, error: message };
    }
  },

  initAuth: async () => {
    try {
      let currentToken = await AsyncStorage.getItem("accessToken");
      const storedUserStr = await AsyncStorage.getItem("user");
      const storedPendingEmail = await AsyncStorage.getItem("pendingEmail");
      const storedHasSeenOnboarding = await AsyncStorage.getItem("hasSeenOnboarding");

      if (storedHasSeenOnboarding === "true") {
        set({ hasSeenOnboarding: true });
      }

      if (storedPendingEmail) {
        set({ pendingEmail: storedPendingEmail });
      }

      if (!currentToken) {
        set({ isInitialized: true });
        return;
      }

      if (storedUserStr) {
        const parsedUser = JSON.parse(storedUserStr);
        set({
          isAuthenticated: true,
          user: parsedUser,
          token: currentToken,
          phoneNumber: parsedUser.phone_number || null,
          isProfileComplete: true,
        });
      }

      let profileResponse;
      try {
        profileResponse = await axios.get(`${getBackendUrl()}users/profile`, {
          headers: { Authorization: `Bearer ${currentToken}` },
        });
      } catch (error: any) {
        if (error.response?.status === 401) {
          const refreshToken = await AsyncStorage.getItem("refreshToken");
          if (!refreshToken) {
            await AsyncStorage.multiRemove([
              "accessToken",
              "refreshToken",
              "pushToken",
              "user",
              "isProfileComplete",
              "pendingEmail",
            ]);
            set({ isAuthenticated: false, user: null, token: null });
            return;
          }

          try {
            const refreshResponse = await axios.post(
              `${getBackendUrl()}auth/refresh-token`,
              { refreshToken }
            );
            const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
              refreshResponse.data;

            await AsyncStorage.setItem("accessToken", newAccessToken);
            await AsyncStorage.setItem("refreshToken", newRefreshToken);
            currentToken = newAccessToken;

            profileResponse = await axios.get(
              `${getBackendUrl()}users/profile`,
              { headers: { Authorization: `Bearer ${newAccessToken}` } }
            );
          } catch (refreshError) {
            console.log("Refresh token invalid, logging out:", refreshError);
            await AsyncStorage.multiRemove([
              "accessToken",
              "refreshToken",
              "pushToken",
              "user",
              "isProfileComplete",
              "pendingEmail",
            ]);
            set({ isAuthenticated: false, user: null, token: null });
            return;
          }
        } else {
          console.log(
            "Network error during initAuth, using cached data:",
            error.message
          );
          return;
        }
      }

      const user = profileResponse.data;
      await AsyncStorage.setItem("user", JSON.stringify(user));

      set({
        isAuthenticated: true,
        user,
        token: currentToken,
        phoneNumber: user.phone_number || null,
        isProfileComplete: true,
      });
    } catch (e) {
      console.log("Failed to initialize auth:", e);
    } finally {
      set({ isInitialized: true });
    }
  },
}));
