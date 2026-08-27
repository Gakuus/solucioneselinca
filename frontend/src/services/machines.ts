import { api } from './api';

export interface Machine {
  id: string;
  code: string;
  name: string;
  machineTypeId: string;
  brand?: string;
  model?: string;
  year?: number;
  serialNumber?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'IN_MAINTENANCE' | 'DECOMMISSIONED';
  purchaseDate?: string;
  warrantyExpiration?: string;
  location?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  machineType: {
    id: string;
    name: string;
  };
}

export interface MachineType {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  _count?: {
    machines: number;
  };
}

export interface MachineHistory {
  machine: {
    id: string;
    code: string;
    name: string;
  };
  maintenances: Array<{
    id: string;
    status: string;
    scheduledDate: string;
    completedDate?: string;
    maintenanceType: {
      id: string;
      name: string;
    };
    technician?: {
      id: string;
      name: string;
    };
    items: Array<{
      id: string;
      name: string;
      quantity: number;
      unitCost: number;
    }>;
  }>;
}

export interface PaginatedResponse<T> {
  status: string;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateMachineData {
  code: string;
  name: string;
  machineTypeId: string;
  brand?: string;
  model?: string;
  year?: number;
  serialNumber?: string;
  status?: string;
  purchaseDate?: string;
  warrantyExpiration?: string;
  location?: string;
  notes?: string;
}

export interface MachineFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  machineTypeId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const machinesApi = {
  getAll: async (filters?: MachineFilters): Promise<PaginatedResponse<Machine>> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    const response = await api.get(`/machines?${params.toString()}`);
    return response as any;
  },

  getById: async (id: string): Promise<Machine> => {
    const response = await api.get(`/machines/${id}`);
    return response.data;
  },

  create: async (data: CreateMachineData): Promise<Machine> => {
    const response = await api.post('/machines', data);
    return response.data;
  },

  update: async (id: string, data: Partial<CreateMachineData>): Promise<Machine> => {
    const response = await api.put(`/machines/${id}`, data);
    return response.data;
  },

  changeStatus: async (id: string, status: string, reason?: string): Promise<Machine> => {
    const response = await api.patch(`/machines/${id}/status`, { status, reason });
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/machines/${id}`);
  },

  getHistory: async (id: string): Promise<MachineHistory> => {
    const response = await api.get(`/machines/${id}/history`);
    return response.data;
  },

  exportCSV: async (filters?: MachineFilters): Promise<Blob> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    const response = await fetch(
      `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1'}/machines/export?${params.toString()}`,
      {
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth-storage') ? JSON.parse(localStorage.getItem('auth-storage')!).state?.token : ''}`,
        },
      }
    );
    return response.blob();
  },

  getTypes: async (): Promise<MachineType[]> => {
    const response = await api.get('/machines/types');
    return response.data;
  },
};
