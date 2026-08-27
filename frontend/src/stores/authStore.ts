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
  forceLogout: () => void;
  refreshToken: () => Promise<void>;
  clearError: () => void;
  updateProfile: (data: UpdateProfileData) => Promise<void>;
  changePassword: (data: ChangePasswordData) => Promise<void>;
}

// Decode JWT to get expiry (no verification, just for timing)
function getTokenExpiry(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

// Proactive refresh timer
let refreshTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleProactiveRefresh(token: string, refreshFn: () => Promise<void>) {
  clearProactiveRefresh();
  const expiry = getTokenExpiry(token);
  if (!expiry) return;

  // Refresh 60 seconds before expiry
  const refreshAt = expiry - Date.now() - 60_000;
  if (refreshAt <= 0) {
    // Already expired, refresh immediately
    refreshFn();
    return;
  }

  refreshTimer = setTimeout(async () => {
    await refreshFn();
  }, refreshAt);
}

function clearProactiveRefresh() {
  if (refreshTimer) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }
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

          // Schedule proactive refresh
          scheduleProactiveRefresh(accessToken, get().refreshToken);
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

          scheduleProactiveRefresh(accessToken, get().refreshToken);
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Error al registrar usuario',
          });
          throw error;
        }
      },

      logout: async () => {
        clearProactiveRefresh();
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

      forceLogout: () => {
        clearProactiveRefresh();
        api.setAccessToken(null);
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },

      refreshToken: async () => {
        try {
          const newToken = await api.refreshAccessToken();
          if (newToken) {
            api.setAccessToken(newToken);
            set({ token: newToken });
            scheduleProactiveRefresh(newToken, get().refreshToken);
          } else {
            get().forceLogout();
          }
        } catch {
          get().forceLogout();
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
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        // On page reload, try to get a fresh access token from the refresh cookie
        if (state?.isAuthenticated && state?.user) {
          api.refreshAccessToken().then((newToken) => {
            if (newToken) {
              api.setAccessToken(newToken);
              useAuthStore.setState({ token: newToken });
              scheduleProactiveRefresh(newToken, useAuthStore.getState().refreshToken);
            } else {
              // Refresh cookie expired or invalid - force logout
              useAuthStore.getState().forceLogout();
            }
          });
        }
      },
    }
  )
);
