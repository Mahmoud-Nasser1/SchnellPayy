import { create } from 'zustand';
import api from '@/lib/api';

const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  loading: true, // Set to true by default to wait for initAuth to finish

  login: (userData, accessToken) => {
    set({
      user: userData,
      token: accessToken,
      isAuthenticated: true,
      loading: false,
    });
  },

  logout: async () => {
    try {
      // API call will automatically include the HTTP-only cookie if withCredentials is true
      await api.post('/auth/logout');
    } catch (error) {
      console.error("Logout API failed, continuing local clear", error);
    }
    
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
    });
  },

  updateAuthUser: (updatedUser) => {
    set({ user: updatedUser });
  },

  initAuth: async () => {
    try {
      // 1. Try to get a new access token. The HTTP-only cookie is sent automatically.
      const rs = await api.post('/auth/refresh-token');
      const newToken = rs.data.token || rs.data.data?.token;
      
      set({ token: newToken });

      // 2. Fetch the current user profile
      const response = await api.get('/users/getMe');
      const fetchedUser = response.data?.data?.user || response.data?.user || response.data;
      
      set({ user: fetchedUser, isAuthenticated: true, loading: false });
    } catch (error) {
      // This will naturally fail if there's no valid HTTP-only cookie present
      console.log("No valid session cookie found. User needs to login.");
      set({ user: null, token: null, isAuthenticated: false, loading: false });
    }
  },

  fetchMe: async () => {
    const token = get().token;
    if (!token) {
        return;
    }
    
    try {
      const response = await api.get('/users/getMe');
      const fetchedUser = response.data?.data?.user || response.data?.user || response.data;
      set({ user: fetchedUser, isAuthenticated: true });
    } catch (error) {
      console.error("Failed to fetch user:", error);
      get().logout();
    }
  }
}));

export default useAuthStore;