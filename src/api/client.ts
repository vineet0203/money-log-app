import axios from 'axios';
import { getBackendUrl, useAuthStore } from '../store/authStore';

const apiClient = axios.create({
  baseURL: getBackendUrl(),
});

// Request interceptor to automatically attach the token
apiClient.interceptors.request.use(
  (config) => {
    // Retrieve token dynamically from Zustand state
    const token = useAuthStore.getState().token;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
