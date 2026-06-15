import { create } from 'zustand';

interface AuthState {
  isAuthenticated: boolean;
  phoneNumber: string | null;
  login: (phone: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  phoneNumber: null,
  login: async (phone: string) => {
    // Mock API delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    set({ phoneNumber: phone, isAuthenticated: true });
  },
  logout: () => {
    set({ isAuthenticated: false, phoneNumber: null });
  }
}));
