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
  sessionChecked: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  forceLogout: () => void;
  refreshToken: () => Promise<void>;
  checkSession: () => Promise<void>;
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
      sessionChecked: false,

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
            sessionChecked: true,
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
            sessionChecked: true,
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
            sessionChecked: true,
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
          sessionChecked: true,
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

      checkSession: async () => {
        // Called on app start after rehydration. Restores the access token
        // from the refresh cookie (if a session is persisted) BEFORE any
        // page mounts, so requests never go out without a token.
        if (!get().isAuthenticated || !get().user) {
          set({ sessionChecked: true });
          return;
        }
        clearProactiveRefresh();
        try {
          const newToken = await api.refreshAccessToken();
          if (newToken) {
            api.setAccessToken(newToken);
            set({ token: newToken, sessionChecked: true });
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
        // Runs immediately after rehydration completes (guaranteed). Mark the
        // session as not-yet-checked and hand off to checkSession(), which
        // restores the access token from the refresh cookie before the app
        // renders any route. We must not await here because this callback is
        // sync-fired; SessionRestore gates rendering on the sessionChecked flag.
        if (state) {
          useAuthStore.setState({ sessionChecked: false });
          useAuthStore.getState().checkSession();
        }
      },
    }
  )
);
