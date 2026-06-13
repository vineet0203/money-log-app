import { create } from 'zustand';

interface AuthState {
  isAuthenticated: boolean;
  phoneNumber: string | null;
  isOtpSent: boolean;
  sendOtp: (phone: string) => Promise<void>;
  verifyOtp: (code: string) => Promise<boolean>;
  logout: () => void;
  resetOtpState: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  phoneNumber: null,
  isOtpSent: false,
  sendOtp: async (phone: string) => {
    // Mock API delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    set({ phoneNumber: phone, isOtpSent: true });
  },
  verifyOtp: async (code: string) => {
    // Mock API delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    // Accept any 6-digit code for testing
    if (code.length === 6) {
      set({ isAuthenticated: true });
      return true;
    }
    return false;
  },
  logout: () => {
    set({ isAuthenticated: false, phoneNumber: null, isOtpSent: false });
  },
  resetOtpState: () => {
    set({ isOtpSent: false, phoneNumber: null });
  }
}));
