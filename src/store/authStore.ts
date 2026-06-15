import { create } from 'zustand';

interface AuthState {
  isAuthenticated: boolean;
  phoneNumber: string | null;
  isOtpSent: boolean;
  sendOtp: (phone: string) => Promise<boolean>;
  verifyOtp: (code: string) => Promise<boolean>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  phoneNumber: null,
  isOtpSent: false,
  sendOtp: async (phone: string) => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    // Accept only 9999999999
    if (phone.includes("9999999999")) {
      set({ phoneNumber: phone, isOtpSent: true });
      return true;
    }
    return false;
  },
  verifyOtp: async (code: string) => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    // Accept only 123456
    if (code === "123456") {
      set({ isAuthenticated: true });
      return true;
    }
    return false;
  },
  logout: () => {
    set({ isAuthenticated: false, phoneNumber: null, isOtpSent: false });
  }
}));
