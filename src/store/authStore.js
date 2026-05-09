import { create } from 'zustand';
import api from '@/lib/api';

const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false, // Initial loading state could be false since we don't persist tokens on load by default

  login: (userData, accessToken) => {
    set({
      user: userData,
      token: accessToken,
      isAuthenticated: true,
      loading: false,
    });
  },

  logout: () => {
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

  // Example of an action to fetch current user if token exists (e.g. from an interceptor or initial mount if you decide to persist later)
  fetchMe: async () => {
    const token = get().token;
    if (!token) {
        set({ loading: false });
        return;
    }
    
    set({ loading: true });
    try {
      const response = await api.get('/users/getMe');
      const fetchedUser = response.data?.data?.user || response.data?.user || response.data;
      set({ user: fetchedUser, isAuthenticated: true, loading: false });
    } catch (error) {
      console.error("Failed to fetch user:", error);
      get().logout();
    }
  }
}));

export default useAuthStore;