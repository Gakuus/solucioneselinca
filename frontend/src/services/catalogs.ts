import { api } from './api';

export interface MachineType {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  _count?: {
    machines: number;
  };
}

export interface MaintenanceType {
  id: string;
  name: string;
  description?: string;
  isPreventive: boolean;
  estimatedHours?: number;
  isActive: boolean;
  _count?: {
    maintenances: number;
  };
}

export interface CreateMachineTypeData {
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface CreateMaintenanceTypeData {
  name: string;
  description?: string;
  isPreventive: boolean;
  estimatedHours?: number;
  isActive?: boolean;
}

export const catalogsApi = {
  // Machine Types
  getMachineTypes: async (): Promise<MachineType[]> => {
    const response = await api.get('/catalogs/machine-types');
    return response.data;
  },

  getMachineTypeById: async (id: string): Promise<MachineType> => {
    const response = await api.get(`/catalogs/machine-types/${id}`);
    return response.data;
  },

  createMachineType: async (data: CreateMachineTypeData): Promise<MachineType> => {
    const response = await api.post('/catalogs/machine-types', data);
    return response.data;
  },

  updateMachineType: async (id: string, data: Partial<CreateMachineTypeData>): Promise<MachineType> => {
    const response = await api.put(`/catalogs/machine-types/${id}`, data);
    return response.data;
  },

  deleteMachineType: async (id: string): Promise<void> => {
    await api.delete(`/catalogs/machine-types/${id}`);
  },

  // Maintenance Types
  getMaintenanceTypes: async (): Promise<MaintenanceType[]> => {
    const response = await api.get('/catalogs/maintenance-types');
    return response.data;
  },

  getMaintenanceTypeById: async (id: string): Promise<MaintenanceType> => {
    const response = await api.get(`/catalogs/maintenance-types/${id}`);
    return response.data;
  },

  createMaintenanceType: async (data: CreateMaintenanceTypeData): Promise<MaintenanceType> => {
    const response = await api.post('/catalogs/maintenance-types', data);
    return response.data;
  },

  updateMaintenanceType: async (id: string, data: Partial<CreateMaintenanceTypeData>): Promise<MaintenanceType> => {
    const response = await api.put(`/catalogs/maintenance-types/${id}`, data);
    return response.data;
  },

  deleteMaintenanceType: async (id: string): Promise<void> => {
    await api.delete(`/catalogs/maintenance-types/${id}`);
  },
};
