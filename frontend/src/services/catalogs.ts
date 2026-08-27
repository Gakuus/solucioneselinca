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
  getMachineTypes: async (): Promise<MachineType[]> => {
    const response = await api.get<MachineType[]>('/catalogs/machine-types');
    return response.data as MachineType[];
  },

  getMachineTypeById: async (id: string): Promise<MachineType> => {
    const response = await api.get<MachineType>(`/catalogs/machine-types/${id}`);
    return response.data as MachineType;
  },

  createMachineType: async (data: CreateMachineTypeData): Promise<MachineType> => {
    const response = await api.post<MachineType>('/catalogs/machine-types', data);
    return response.data as MachineType;
  },

  updateMachineType: async (id: string, data: Partial<CreateMachineTypeData>): Promise<MachineType> => {
    const response = await api.put<MachineType>(`/catalogs/machine-types/${id}`, data);
    return response.data as MachineType;
  },

  deleteMachineType: async (id: string): Promise<void> => {
    await api.delete(`/catalogs/machine-types/${id}`);
  },

  getMaintenanceTypes: async (): Promise<MaintenanceType[]> => {
    const response = await api.get<MaintenanceType[]>('/catalogs/maintenance-types');
    return response.data as MaintenanceType[];
  },

  getMaintenanceTypeById: async (id: string): Promise<MaintenanceType> => {
    const response = await api.get<MaintenanceType>(`/catalogs/maintenance-types/${id}`);
    return response.data as MaintenanceType;
  },

  createMaintenanceType: async (data: CreateMaintenanceTypeData): Promise<MaintenanceType> => {
    const response = await api.post<MaintenanceType>('/catalogs/maintenance-types', data);
    return response.data as MaintenanceType;
  },

  updateMaintenanceType: async (id: string, data: Partial<CreateMaintenanceTypeData>): Promise<MaintenanceType> => {
    const response = await api.put<MaintenanceType>(`/catalogs/maintenance-types/${id}`, data);
    return response.data as MaintenanceType;
  },

  deleteMaintenanceType: async (id: string): Promise<void> => {
    await api.delete(`/catalogs/maintenance-types/${id}`);
  },
};
