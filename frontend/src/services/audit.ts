import { api } from './api';

export interface AuditLog {
  id: string;
  userId?: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT';
  entityType: string;
  entityId?: string;
  oldValues?: any;
  newValues?: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface AuditStats {
  total: number;
  byAction: Record<string, number>;
  byEntityType: Record<string, number>;
}

export interface AuditQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  action?: string;
  entityType?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
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

export const auditApi = {
  getAll: async (params?: AuditQueryParams): Promise<PaginatedResponse<AuditLog>> => {
    const response = await api.get<AuditLog[]>('/audit', { params });
    return { data: (response.data as AuditLog[]) || [], pagination: response.pagination };
  },

  getById: async (id: string): Promise<AuditLog> => {
    const response = await api.get<{ id: string }>(`/audit/${id}`);
    return response.data as AuditLog;
  },

  getStats: async (): Promise<AuditStats> => {
    const response = await api.get<AuditStats>('/audit/stats');
    return response.data as AuditStats;
  },

  getRecentActivity: async (limit?: number): Promise<AuditLog[]> => {
    const response = await api.get<AuditLog[]>('/audit/recent', { params: { limit } });
    return response.data as AuditLog[];
  },
};
