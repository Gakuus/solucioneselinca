const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

interface ApiResponse<T = any> {
  status: 'success' | 'error';
  data?: T;
  pagination?: any;
  message?: string;
  errors?: any[];
  code?: string;
}

interface QueuedRequest {
  resolve: (token: string) => void;
  reject: (error: any) => void;
}

class ApiClient {
  private accessToken: string | null = null;
  private isRefreshing = false;
  private failedQueue: QueuedRequest[] = [];

  setAccessToken(token: string | null) {
    this.accessToken = token;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  private processQueue(error: any, token: string | null) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error || !token) {
        reject(error);
      } else {
        resolve(token);
      }
    });
    this.failedQueue = [];
  }

  private buildQueryString(params?: Record<string, any>): string {
    if (!params) return '';
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    const qs = searchParams.toString();
    return qs ? `?${qs}` : '';
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    _retryCount = 0
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include',
      });

      // Handle 401 with automatic token refresh
      if (response.status === 401 && _retryCount === 0) {
        const body = await response.clone().json().catch(() => ({}));
        const code = body?.code;

        // Don't refresh for login/register/refresh-token endpoints
        if (endpoint.includes('/auth/login') || endpoint.includes('/auth/register') || endpoint.includes('/auth/refresh-token')) {
          // Fall through to error handling below
        } else if (code === 'TOKEN_EXPIRED' || code === 'TOKEN_INVALID' || !this.accessToken) {
          // No access token in memory (e.g. right after a page reload): the
          // session is still being restored from the refresh cookie. Try to
          // refresh instead of force-logging-out, which caused spurious logouts.
          return this.handleTokenRefresh(endpoint, options, _retryCount);
        } else {
          // Other 401 (unauthorized, etc.) - force logout
          const { useAuthStore } = await import('../stores/authStore');
          useAuthStore.getState().forceLogout();
          throw { status: 401, message: body?.message || 'Sesión expirada' };
        }
      }

      const data = await response.json();

      if (!response.ok) {
        const message = data?.message || data?.error?.message || 'Error en la solicitud';
        throw {
          status: response.status,
          message,
          errors: data?.errors,
          code: data?.code,
        };
      }

      return data;
    } catch (error: any) {
      if (error.status) {
        throw error;
      }
      throw {
        status: 500,
        message: 'Error de conexión con el servidor',
      };
    }
  }

  private async handleTokenRefresh<T>(
    endpoint: string,
    options: RequestInit,
    retryCount: number
  ): Promise<ApiResponse<T>> {
    if (this.isRefreshing) {
      // Queue this request while refresh is in progress
      return new Promise<ApiResponse<T>>((resolve, reject) => {
        this.failedQueue.push({
          resolve: (token: string) => {
            // Retry with new token
            const headers: Record<string, string> = {
              'Content-Type': 'application/json',
              ...((options.headers as Record<string, string>) || {}),
              Authorization: `Bearer ${token}`,
            };
            fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers, credentials: 'include' })
              .then((r) => r.json())
              .then(resolve)
              .catch(reject);
          },
          reject,
        });
      });
    }

    this.isRefreshing = true;

    try {
      const newToken = await this.refreshAccessToken();
      if (newToken) {
        this.processQueue(null, newToken);
        // Retry original request
        return this.request<T>(endpoint, options, retryCount + 1);
      } else {
        this.processQueue(new Error('Refresh failed'), null);
        const { useAuthStore } = await import('../stores/authStore');
        useAuthStore.getState().forceLogout();
        throw { status: 401, message: 'Sesión expirada. Inicia sesión nuevamente.' };
      }
    } catch (error) {
      this.processQueue(error, null);
      const { useAuthStore } = await import('../stores/authStore');
      useAuthStore.getState().forceLogout();
      throw { status: 401, message: 'Sesión expirada. Inicia sesión nuevamente.' };
    } finally {
      this.isRefreshing = false;
    }
  }

  async get<T>(endpoint: string, options?: { params?: Record<string, any> }): Promise<ApiResponse<T>> {
    const qs = this.buildQueryString(options?.params);
    return this.request<T>(`${endpoint}${qs}`, { method: 'GET' });
  }

  async post<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async patch<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  async refreshAccessToken(): Promise<string | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        const newToken = data.data?.accessToken || null;
        if (newToken) {
          this.accessToken = newToken;
        }
        return newToken;
      }
    } catch {
      // Ignore refresh errors
    }
    return null;
  }
}

export const api = new ApiClient();
