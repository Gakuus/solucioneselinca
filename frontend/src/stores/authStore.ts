import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '../services/api';
import { authApi, UpdateProfileData, ChangePasswordData } from '../services/auth';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'SUPERVISOR' | 'TECHNICIAN' | 'VIEWER';
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  clearError: () => void;
  updateProfile: (data: UpdateProfileData) => Promise<void>;
  changePassword: (data: ChangePasswordData) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post<{ user: User; accessToken: string }>('/auth/login', { email, password });
          const { user, accessToken } = response.data as { user: User; accessToken: string };

          api.setAccessToken(accessToken);
          set({
            user,
            token: accessToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Error al iniciar sesión',
          });
          throw error;
        }
      },

      register: async (name: string, email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post<{ user: User; accessToken: string }>('/auth/register', { name, email, password });
          const { user, accessToken } = response.data as { user: User; accessToken: string };

          api.setAccessToken(accessToken);
          set({
            user,
            token: accessToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Error al registrar usuario',
          });
          throw error;
        }
      },

      logout: async () => {
        try {
          await api.post('/auth/logout');
        } catch {
          // Ignore logout errors
        } finally {
          api.setAccessToken(null);
          set({
            user: null,
            token: null,
            isAuthenticated: false,
          });
        }
      },

      refreshToken: async () => {
        try {
          const newToken = await api.refreshAccessToken();
          if (newToken) {
            api.setAccessToken(newToken);
            set({ token: newToken });
          } else {
            // Refresh failed, logout
            get().logout();
          }
        } catch {
          get().logout();
        }
      },

      clearError: () => set({ error: null }),

      updateProfile: async (data: UpdateProfileData) => {
        const updated = await authApi.updateProfile(data);
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: {
              ...currentUser,
              name: updated.name,
              email: updated.email,
            },
          });
        }
      },

      changePassword: async (data: ChangePasswordData) => {
        await authApi.changePassword(data);
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        // Restore token in API client on rehydration
        if (state?.token) {
          api.setAccessToken(state.token);
        }
      },
    }
  )
);
