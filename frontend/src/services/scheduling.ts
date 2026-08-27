import { api } from './api';

export interface Schedule {
  id: string;
  machineId: string;
  maintenanceTypeId: string;
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  interval: number;
  startDate: string;
  endDate?: string;
  nextExecution: string;
  lastExecution?: string;
  hoursInterval?: number;
  isActive: boolean;
  description?: string;
  createdAt: string;
  updatedAt: string;
  machine?: {
    id: string;
    code: string;
    name: string;
    status: string;
  };
  maintenanceType?: {
    id: string;
    name: string;
    isPreventive: boolean;
  };
}

export interface CreateScheduleData {
  machineId: string;
  maintenanceTypeId: string;
  technicianId?: string;
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  interval?: number;
  startDate: string;
  endDate?: string;
  nextExecution: string;
  hoursInterval?: number;
  isActive?: boolean;
  description?: string;
}

export interface UpdateScheduleData {
  machineId?: string;
  maintenanceTypeId?: string;
  technicianId?: string;
  frequency?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  interval?: number;
  startDate?: string;
  endDate?: string;
  nextExecution?: string;
  hoursInterval?: number;
  isActive?: boolean;
  description?: string;
}

export interface ScheduleQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  machineId?: string;
  maintenanceTypeId?: string;
  frequency?: string;
  isActive?: boolean;
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

export const schedulingApi = {
  getAll: async (params?: ScheduleQueryParams): Promise<PaginatedResponse<Schedule>> => {
    const response = await api.get('/scheduling', { params });
    return response.data;
  },

  getById: async (id: string): Promise<Schedule> => {
    const response = await api.get(`/scheduling/${id}`);
    return response.data;
  },

  create: async (data: CreateScheduleData): Promise<Schedule> => {
    const response = await api.post('/scheduling', data);
    return response.data;
  },

  update: async (id: string, data: UpdateScheduleData): Promise<Schedule> => {
    const response = await api.put(`/scheduling/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/scheduling/${id}`);
  },

  toggleActive: async (id: string): Promise<Schedule> => {
    const response = await api.patch(`/scheduling/${id}/toggle`);
    return response.data;
  },

  execute: async (id: string): Promise<any> => {
    const response = await api.post(`/scheduling/${id}/execute`);
    return response.data;
  },

  getUpcoming: async (days?: number): Promise<Schedule[]> => {
    const response = await api.get('/scheduling/upcoming', { params: { days } });
    return response.data;
  },
};
