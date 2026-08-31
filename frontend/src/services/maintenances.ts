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
  deletedAt?: string | null;
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
  typeAssignments?: {
    id: string;
    order: number;
    maintenanceType: {
      id: string;
      name: string;
      isPreventive?: boolean;
    };
  }[];
  technician?: {
    id: string;
    name: string;
    email: string;
  };
  technicianAssignments?: {
    id: string;
    order: number;
    technician: {
      id: string;
      name: string;
      email?: string;
      role?: string;
    };
  }[];
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
  maintenanceTypeId?: string;
  maintenanceTypeIds?: string[];
  technicianId?: string;
  technicianIds?: string[];
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
  maintenanceTypeIds?: string[];
  technicianId?: string;
  technicianIds?: string[];
  maintenanceDate?: string;
  currentHours?: number;
  description?: string;
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

export interface MaintenanceQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  machineId?: string;
  technicianId?: string;
  maintenanceTypeId?: string;
  category?: string;
  includeDeleted?: boolean;
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

  restore: async (id: string): Promise<void> => {
    await api.patch(`/maintenances/${id}/restore`);
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

  exportPDF: async (params?: MaintenanceQueryParams): Promise<Blob> => {
    const qs = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          qs.append(key, String(value));
        }
      });
    }
    const response = await fetch(
      `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1'}/maintenances/export-pdf?${qs.toString()}`,
      {
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${api.getAccessToken() || ''}`,
        },
      }
    );
    return response.blob();
  },

  exportExcel: async (params?: MaintenanceQueryParams): Promise<Blob> => {
    const qs = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          qs.append(key, String(value));
        }
      });
    }
    const response = await fetch(
      `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1'}/maintenances/export-xlsx?${qs.toString()}`,
      {
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${api.getAccessToken() || ''}`,
        },
      }
    );
    return response.blob();
  },

  importExcel: async (file: File): Promise<{
    imported: number;
    errors: string[];
  }> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(
      `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1'}/maintenances/import`,
      {
        method: 'POST',
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${api.getAccessToken() || ''}`,
        },
        body: formData,
      }
    );
    const data = await response.json();
    if (!response.ok) {
      throw { status: response.status, message: data?.message || 'Error al importar' };
    }
    return data.data;
  },
};
