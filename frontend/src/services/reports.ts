import { api } from './api';

export interface MaintenanceReport {
  data: any[];
  stats: {
    total: number;
    byStatus: {
      scheduled: number;
      inProgress: number;
      completed: number;
      cancelled: number;
    };
    byCategory: {
      preventive: number;
      corrective: number;
    };
    totalItems: number;
    totalCost: number;
  };
}

export interface MachineReport {
  id: string;
  code: string;
  name: string;
  type: string;
  status: string;
  totalMaintenances: number;
  preventiveCount: number;
  correctiveCount: number;
  totalCost: number;
}

export interface TechnicianReport {
  id: string;
  name: string;
  email: string;
  totalMaintenances: number;
  completedMaintenances: number;
  completionRate: number;
  avgCompletionDays: number;
}

export interface CostReport {
  totalCost: number;
  byCategory: {
    preventive: number;
    corrective: number;
  };
  bySupplier: Record<string, number>;
  itemCount: number;
}

export interface DashboardStats {
  totalMachines: number;
  activeMachines: number;
  totalMaintenances: number;
  completedMaintenances: number;
  pendingMaintenances: number;
  overdueAlerts: number;
  recentMaintenances: any[];
  maintenancesByStatus: Record<string, number>;
}

export interface ReportQueryParams {
  startDate: string;
  endDate: string;
  machineId?: string;
  technicianId?: string;
  maintenanceTypeId?: string;
  category?: string;
}

export const reportsApi = {
  getDashboardStats: async (period: string = 'month'): Promise<DashboardStats> => {
    const response = await api.get('/reports/dashboard', { params: { period } });
    return response.data;
  },

  getMaintenanceReport: async (params: ReportQueryParams): Promise<MaintenanceReport> => {
    const response = await api.get('/reports/maintenance', { params });
    return response.data;
  },

  getMachineReport: async (params: ReportQueryParams): Promise<MachineReport[]> => {
    const response = await api.get('/reports/machine', { params });
    return response.data;
  },

  getTechnicianReport: async (params: ReportQueryParams): Promise<TechnicianReport[]> => {
    const response = await api.get('/reports/technician', { params });
    return response.data;
  },

  getCostReport: async (params: ReportQueryParams): Promise<CostReport> => {
    const response = await api.get('/reports/cost', { params });
    return response.data;
  },

  exportCSV: async (type: string, params: ReportQueryParams): Promise<Blob> => {
    const response = await api.get(`/reports/${type}`, {
      params,
      responseType: 'blob',
    });
    return response.data;
  },
};
