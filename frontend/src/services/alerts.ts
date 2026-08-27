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
    const response = await api.get('/alerts', { params });
    return response.data;
  },

  getById: async (id: string): Promise<Alert> => {
    const response = await api.get(`/alerts/${id}`);
    return response.data;
  },

  create: async (data: CreateAlertData): Promise<Alert> => {
    const response = await api.post('/alerts', data);
    return response.data;
  },

  markAsRead: async (id: string): Promise<Alert> => {
    const response = await api.patch(`/alerts/${id}/read`);
    return response.data;
  },

  markAllAsRead: async (): Promise<{ message: string }> => {
    const response = await api.patch('/alerts/read-all');
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/alerts/${id}`);
  },

  getStats: async (): Promise<AlertStats> => {
    const response = await api.get('/alerts/stats');
    return response.data;
  },

  checkUpcoming: async (): Promise<{ created: number }> => {
    const response = await api.post('/alerts/check-upcoming');
    return response.data;
  },
};
