import { create } from 'zustand';
import axios from 'axios';
import { Platform } from 'react-native';

interface AuthState {
  isAuthenticated: boolean;
  phoneNumber: string | null;
  isOtpSent: boolean;
  user: any | null;
  token: string | null;
  isProfileComplete: boolean;
  sendOtp: (phone: string) => Promise<boolean>;
  verifyOtp: (code: string) => Promise<{ success: boolean; isProfileComplete: boolean }>;
  completeProfile: (name: string, email?: string) => Promise<boolean>;
  logout: () => void;
}

export const getBackendUrl = () => {
  return 'http://10.192.44.91:5001';
};

const hitBackendWithToken = async (idToken: string) => {
  try {
    const backendUrl = getBackendUrl();
    const response = await axios.post(`${backendUrl}/api/auth/verify-token`, { idToken });
    return { success: true, isProfileComplete: response.data.isProfileComplete, user: response.data.user };
  } catch (error: any) {
    console.error("Backend verification failed:", error?.response?.data || error.message);
    return { success: false, isProfileComplete: false, user: null };
  }
};

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  phoneNumber: null,
  isOtpSent: false,
  user: null,
  token: null,
  isProfileComplete: false,

  sendOtp: async (phone: string) => {
    // MOCKED: Skip Firebase and instantly simulate sending an OTP
    console.log(`[MOCK] Sending fake OTP to ${phone}`);
    await new Promise(resolve => setTimeout(resolve, 500)); // simulate network delay
    set({ phoneNumber: phone, isOtpSent: true });
    return true;
  },

  verifyOtp: async (code: string) => {
    const { phoneNumber } = get();

    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // simulate network delay
      
      // MOCKED: Accept 123456 as the universal success code
      if (code === "123456") {
        console.log(`[MOCK] OTP Verified. Sending mock token to backend...`);
        // Send a special mocked token to our backend
        const mockToken = "mock_token_123";
        const backendSync = await hitBackendWithToken(mockToken);

        if (backendSync.success) {
          set({ 
            isAuthenticated: true, 
            user: backendSync.user, 
            token: mockToken,
            isProfileComplete: backendSync.isProfileComplete 
          });
          return { success: true, isProfileComplete: backendSync.isProfileComplete };
        }
      }
      return { success: false, isProfileComplete: false };
    } catch (error) {
      console.error("Error verifying mock OTP:", error);
      return { success: false, isProfileComplete: false };
    }
  },

  completeProfile: async (name: string, email?: string) => {
    const { user } = get();
    if (!user) return false;

    try {
      const backendUrl = getBackendUrl();
      // Using the mock token for auth header in development
      await axios.post(`${backendUrl}/api/auth/complete-profile`, 
        { name, email },
        { headers: { Authorization: `Bearer mock_token_123` } }
      );
      
      set({ isProfileComplete: true });
      return true;
    } catch (error) {
      console.error("Error completing profile:", error);
      return false;
    }
  },

  logout: () => {
    set({ isAuthenticated: false, phoneNumber: null, isOtpSent: false, user: null, token: null, isProfileComplete: false });
  }
}));
