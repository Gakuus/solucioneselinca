import { api } from './api';

export interface DashboardStats {
  machines: {
    total: number;
    active: number;
    maintenance: number;
  };
  maintenances: {
    total: number;
    pending: number;
    completed: number;
  };
  users: {
    total: number;
    active: number;
  };
  alerts: {
    total: number;
    unread: number;
  };
}

export interface RecentMaintenance {
  id: string;
  status: string;
  scheduledDate: string;
  completedDate?: string;
  machine: {
    id: string;
    code: string;
    name: string;
  };
  maintenanceType: {
    id: string;
    name: string;
  };
  technician?: {
    id: string;
    name: string;
  };
}

export interface RecentMachine {
  id: string;
  code: string;
  name: string;
  status: string;
  brand?: string;
  createdAt: string;
  machineType: {
    id: string;
    name: string;
  };
}

export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },

  getRecentMaintenances: async (): Promise<RecentMaintenance[]> => {
    const response = await api.get('/dashboard/recent-maintenances');
    return response.data;
  },

  getRecentMachines: async (): Promise<RecentMachine[]> => {
    const response = await api.get('/dashboard/recent-machines');
    return response.data;
  },
};
