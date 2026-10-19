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

let isRefreshing = false;
let failedQueue: any[] = [];

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

// Response interceptor to handle 401s
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/refresh-token')) {
      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axios(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }
      
      originalRequest._retry = true;
      isRefreshing = true;
      
      try {
        const refreshToken = await AsyncStorage.getItem("refreshToken");
        if (refreshToken) {
          const refreshResponse = await axios.post(`${getBackendUrl()}auth/refresh-token`, { refreshToken });
          const { accessToken: newAccessToken, refreshToken: newRefreshToken } = refreshResponse.data;
          
          await AsyncStorage.setItem("accessToken", newAccessToken);
          await AsyncStorage.setItem("refreshToken", newRefreshToken);
          
          useAuthStore.setState({ token: newAccessToken });
          
          processQueue(null, newAccessToken);
          
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return axios(originalRequest);
        } else {
          processQueue(new Error('No refresh token available'), null);
          useAuthStore.getState().logout();
          return Promise.reject(error);
        }
      } catch (e) {
        processQueue(e, null);
        useAuthStore.getState().logout();
        return Promise.reject(e);
      } finally {
        isRefreshing = false;
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
