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

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

export const reportsApi = {
  getDashboardStats: async (period: string = 'month'): Promise<DashboardStats> => {
    const response = await api.get<DashboardStats>('/reports/dashboard', { params: { period } });
    return response.data as DashboardStats;
  },

  getMaintenanceReport: async (params: ReportQueryParams): Promise<MaintenanceReport> => {
    const response = await api.get<MaintenanceReport>('/reports/maintenance', { params });
    return response.data as MaintenanceReport;
  },

  getMachineReport: async (params: ReportQueryParams): Promise<MachineReport[]> => {
    const response = await api.get<MachineReport[]>('/reports/machine', { params });
    return response.data as MachineReport[];
  },

  getTechnicianReport: async (params: ReportQueryParams): Promise<TechnicianReport[]> => {
    const response = await api.get<TechnicianReport[]>('/reports/technician', { params });
    return response.data as TechnicianReport[];
  },

  getCostReport: async (params: ReportQueryParams): Promise<CostReport> => {
    const response = await api.get<CostReport>('/reports/cost', { params });
    return response.data as CostReport;
  },

  exportPDF: async (type: string, params: ReportQueryParams): Promise<Blob> => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    const response = await fetch(
      `${API_BASE_URL}/reports/${type}/export-pdf?${searchParams.toString()}`,
      {
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${api.getAccessToken() || ''}`,
        },
      }
    );
    return response.blob();
  },

  exportExcel: async (type: string, params: ReportQueryParams): Promise<Blob> => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    const response = await fetch(
      `${API_BASE_URL}/reports/${type}/export-xlsx?${searchParams.toString()}`,
      {
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${api.getAccessToken() || ''}`,
        },
      }
    );
    return response.blob();
  },
};
