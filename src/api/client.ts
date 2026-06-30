import axios from 'axios';
import { getBackendUrl, useAuthStore } from '../store/authStore';
import Toast from 'react-native-toast-message';

const apiClient = axios.create({
  baseURL: getBackendUrl(),
});

import AsyncStorage from '@react-native-async-storage/async-storage';

// Request interceptor to automatically attach the token
apiClient.interceptors.request.use(
  async (config) => {
    // Retrieve token dynamically from Zustand state
    let token = useAuthStore.getState().token;
    if (!token) {
      token = await AsyncStorage.getItem("accessToken");
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401s
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = await AsyncStorage.getItem("refreshToken");
        if (refreshToken) {
          const refreshResponse = await axios.post(`${getBackendUrl()}/api/auth/refresh-token`, { refreshToken });
          const { accessToken: newAccessToken, refreshToken: newRefreshToken } = refreshResponse.data;
          
          await AsyncStorage.setItem("accessToken", newAccessToken);
          await AsyncStorage.setItem("refreshToken", newRefreshToken);
          
          useAuthStore.setState({ token: newAccessToken });
          
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return axios(originalRequest);
        } else {
          useAuthStore.getState().logout();
        }
      } catch (e) {
        useAuthStore.getState().logout();
      }
    }
    
    if (error.response?.status !== 401) {
      const message = error.response?.data?.error || error.response?.data?.details?.[0]?.message || 'Network error. Please try again.';
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: message,
      });
    }
    return Promise.reject(error);
  }
);

export default apiClient;
