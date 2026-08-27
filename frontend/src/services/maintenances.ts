import { api } from './api';

export interface Maintenance {
  id: string;
  machineId: string;
  maintenanceTypeId: string;
  technicianId: string;
  receivedDate: string;
  maintenanceDate?: string;
  currentHours: number;
  description: string;
  observations?: string;
  hoursUntilNext?: number;
  nextMaintenanceDate?: string;
  estimatedNextDate?: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  completedAt?: string;
  cancelledAt?: string;
  cancelReason?: string;
  createdAt: string;
  updatedAt: string;
  machine?: {
    id: string;
    code: string;
    name: string;
    brand?: string;
    model?: string;
  };
  maintenanceType?: {
    id: string;
    name: string;
    isPreventive: boolean;
  };
  technician?: {
    id: string;
    name: string;
    email: string;
  };
  items?: MaintenanceItem[];
}

export interface MaintenanceItem {
  id: string;
  maintenanceId: string;
  name: string;
  quantity: number;
  unitCost?: number;
  supplier?: string;
  category?: string;
}

export interface CreateMaintenanceData {
  machineId: string;
  maintenanceTypeId: string;
  technicianId: string;
  receivedDate: string;
  currentHours: number;
  description: string;
  observations?: string;
  hoursUntilNext?: number;
  nextMaintenanceDate?: string;
  estimatedNextDate?: string;
  items?: {
    name: string;
    quantity?: number;
    unitCost?: number;
    supplier?: string;
    category?: string;
  }[];
}

export interface UpdateMaintenanceData {
  maintenanceTypeId?: string;
  technicianId?: string;
  maintenanceDate?: string;
  currentHours?: number;
  description?: string;
  observations?: string;
  hoursUntilNext?: number;
  nextMaintenanceDate?: string;
  estimatedNextDate?: string;
}

export interface MaintenanceQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  machineId?: string;
  technicianId?: string;
  maintenanceTypeId?: string;
  category?: string;
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

export interface MaintenanceStats {
  total: number;
  scheduled: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  upcoming: number;
  overdue: number;
}

export const maintenancesApi = {
  getAll: async (params?: MaintenanceQueryParams): Promise<PaginatedResponse<Maintenance>> => {
    const response = await api.get('/maintenances', { params });
    return response as any;
  },

  getById: async (id: string): Promise<Maintenance> => {
    const response = await api.get<Maintenance>(`/maintenances/${id}`);
    return response.data as Maintenance;
  },

  create: async (data: CreateMaintenanceData): Promise<Maintenance> => {
    const response = await api.post<Maintenance>('/maintenances', data);
    return response.data as Maintenance;
  },

  update: async (id: string, data: UpdateMaintenanceData): Promise<Maintenance> => {
    const response = await api.put<Maintenance>(`/maintenances/${id}`, data);
    return response.data as Maintenance;
  },

  changeStatus: async (
    id: string,
    status: string,
    reason?: string,
    completedHours?: number,
    observations?: string
  ): Promise<Maintenance> => {
    const response = await api.patch<Maintenance>(`/maintenances/${id}/status`, {
      status,
      reason,
      completedHours,
      observations,
    });
    return response.data as Maintenance;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/maintenances/${id}`);
  },

  getStats: async (): Promise<MaintenanceStats> => {
    const response = await api.get<MaintenanceStats>('/maintenances/stats');
    return response.data as MaintenanceStats;
  },

  getCalendar: async (year: number, month: number): Promise<Maintenance[]> => {
    const response = await api.get<Maintenance[]>('/maintenances/calendar', {
      params: { year, month },
    });
    return response.data as Maintenance[];
  },

  addItem: async (maintenanceId: string, data: {
    name: string;
    quantity?: number;
    unitCost?: number;
    supplier?: string;
    category?: string;
  }): Promise<MaintenanceItem> => {
    const response = await api.post<MaintenanceItem>(`/maintenances/${maintenanceId}/items`, data);
    return response.data as MaintenanceItem;
  },

  updateItem: async (maintenanceId: string, itemId: string, data: Partial<{
    name: string;
    quantity: number;
    unitCost: number;
    supplier: string;
    category: string;
  }>): Promise<MaintenanceItem> => {
    const response = await api.put<MaintenanceItem>(`/maintenances/${maintenanceId}/items/${itemId}`, data);
    return response.data as MaintenanceItem;
  },

  deleteItem: async (maintenanceId: string, itemId: string): Promise<void> => {
    await api.delete(`/maintenances/${maintenanceId}/items/${itemId}`);
  },
};
