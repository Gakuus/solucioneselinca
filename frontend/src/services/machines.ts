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
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'RETIRED';
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
    return response.data;
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

  delete: async (id: string): Promise<void> => {
    await api.delete(`/machines/${id}`);
  },

  getTypes: async (): Promise<MachineType[]> => {
    const response = await api.get('/machines/types');
    return response.data;
  },
};
