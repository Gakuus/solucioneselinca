import { api } from './api';

export interface SystemConfigItem {
  key: string;
  value: any;
  description: string | null;
}

export const configApi = {
  getAll: async (): Promise<SystemConfigItem[]> => {
    const response = await api.get<SystemConfigItem[]>('/config');
    return response.data as SystemConfigItem[];
  },

  getByKey: async (key: string): Promise<SystemConfigItem> => {
    const response = await api.get<SystemConfigItem>(`/config/${key}`);
    return response.data as SystemConfigItem;
  },

  update: async (key: string, value: unknown): Promise<SystemConfigItem> => {
    const response = await api.put<SystemConfigItem>(`/config/${key}`, { value });
    return response.data as SystemConfigItem;
  },
};
