import { api } from './api';

export interface Alert {
  id: string;
  machineId: string;
  maintenanceId?: string;
  type: 'UPCOMING' | 'OVERDUE' | 'CUSTOM';
  message: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  isRead: boolean;
  readAt?: string;
  readById?: string;
  deletedAt?: string | null;
  createdAt: string;
  machine?: {
    id: string;
    code: string;
    name: string;
  };
  maintenance?: {
    id: string;
    description: string;
    status: string;
  };
  readBy?: {
    id: string;
    name: string;
  };
}

export interface AlertStats {
  total: number;
  unread: number;
  byType: Record<string, number>;
  bySeverity: Record<string, number>;
}

export interface CreateAlertData {
  machineId: string;
  maintenanceId?: string;
  type: 'UPCOMING' | 'OVERDUE' | 'CUSTOM';
  message: string;
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface AlertQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  severity?: string;
  isRead?: boolean;
  machineId?: string;
  includeDeleted?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const alertsApi = {
  getAll: async (params?: AlertQueryParams): Promise<PaginatedResponse<Alert>> => {
    const response = await api.get<Alert[]>('/alerts', { params });
    return { data: (response.data as Alert[]) || [], pagination: response.pagination };
  },

  getById: async (id: string): Promise<Alert> => {
    const response = await api.get<{ id: string }>(`/alerts/${id}`);
    return response.data as Alert;
  },

  create: async (data: CreateAlertData): Promise<Alert> => {
    const response = await api.post<{ id: string }>('/alerts', data);
    return response.data as Alert;
  },

  markAsRead: async (id: string): Promise<Alert> => {
    const response = await api.patch<{ id: string }>(`/alerts/${id}/read`);
    return response.data as Alert;
  },

  markAllAsRead: async (): Promise<{ message: string }> => {
    const response = await api.patch<{ message: string }>('/alerts/read-all');
    return response.data as { message: string };
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/alerts/${id}`);
  },

  restore: async (id: string): Promise<void> => {
    await api.patch(`/alerts/${id}/restore`);
  },

  getStats: async (): Promise<AlertStats> => {
    const response = await api.get<AlertStats>('/alerts/stats');
    return response.data as AlertStats;
  },

  checkUpcoming: async (): Promise<{ created: number }> => {
    const response = await api.post<{ created: number }>('/alerts/check-upcoming');
    return response.data as { created: number };
  },
};
