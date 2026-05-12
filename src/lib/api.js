import axios from 'axios';
import useAuthStore from '@/store/authStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token from Zustand store
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Response interceptor to handle token expiration or global errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Don't retry if the failed request was a login, refresh, or 2FA validation
      if (
        originalRequest.url === "/auth/login" ||
        originalRequest.url === "/auth/refresh-token" ||
        originalRequest.url === "/auth/2fa/validate"
      ) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // The HTTP-only cookie will be sent automatically with this request
        const rs = await api.post('/auth/refresh-token');
        const newToken = rs.data.token || rs.data.data?.token; // Adjust based on your API response structure
        
        // Update token in Zustand
        const currentUser = useAuthStore.getState().user;
        useAuthStore.getState().login(currentUser, newToken);
        
        // Update header for future requests
        api.defaults.headers.common['Authorization'] = 'Bearer ' + newToken;
        
        processQueue(null, newToken);
        
        // Retry the original request
        originalRequest.headers['Authorization'] = 'Bearer ' + newToken;
        return api(originalRequest);
      } catch (_error) {
        processQueue(_error, null);
        
        // Clear token in Zustand and optionally redirect to login
        useAuthStore.getState().logout();
        
        // If we are not already on the login page, redirect
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(_error);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;