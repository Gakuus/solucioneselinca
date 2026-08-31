import { api } from './api';

export type SparePartCategory =
  | 'FILTER'
  | 'LUBRICANT'
  | 'HYDRAULIC'
  | 'ELECTRICAL'
  | 'MECHANICAL'
  | 'TIRE'
  | 'CHEMICAL'
  | 'OTHER';

export type SparePartUnit = 'UNIT' | 'LITER' | 'KILOGRAM' | 'GALLON' | 'METER' | 'PACK';

export type SparePartMovementType = 'IN' | 'OUT' | 'ADJUST';

export interface SparePart {
  id: string;
  code: string;
  name: string;
  category: SparePartCategory;
  unit: SparePartUnit;
  quantity: number;
  minStock: number;
  unitCost?: number | null;
  supplier?: string | null;
  location?: string | null;
  machineTypeId?: string | null;
  description?: string | null;
  isActive: boolean;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  machineType?: {
    id: string;
    name: string;
  } | null;
  movements?: SparePartMovement[];
}

export interface SparePartMovement {
  id: string;
  sparePartId: string;
  type: SparePartMovementType;
  quantity: number;
  unitCost?: number | null;
  notes?: string | null;
  userId?: string | null;
  createdAt: string;
  user?: {
    id: string;
    name: string;
  } | null;
}

export interface PaginatedSpareParts {
  status: string;
  data: SparePart[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateSparePartData {
  code: string;
  name: string;
  category: SparePartCategory;
  unit: SparePartUnit;
  quantity?: number;
  minStock?: number;
  unitCost?: number | null;
  supplier?: string | null;
  location?: string | null;
  machineTypeId?: string | null;
  description?: string | null;
}

export interface SparePartFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: SparePartCategory;
  machineTypeId?: string;
  lowStock?: boolean;
  includeDeleted?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface AddMovementData {
  type: SparePartMovementType;
  quantity: number;
  unitCost?: number | null;
  notes?: string | null;
}

export const sparePartsApi = {
  getAll: async (filters?: SparePartFilters): Promise<PaginatedSpareParts> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    const response = await api.get(`/spare-parts?${params.toString()}`);
    return response as any;
  },

  getById: async (id: string): Promise<SparePart> => {
    const response = await api.get<SparePart>(`/spare-parts/${id}`);
    return response.data as SparePart;
  },

  create: async (data: CreateSparePartData): Promise<SparePart> => {
    const response = await api.post<SparePart>('/spare-parts', data);
    return response.data as SparePart;
  },

  update: async (id: string, data: Partial<CreateSparePartData>): Promise<SparePart> => {
    const response = await api.put<SparePart>(`/spare-parts/${id}`, data);
    return response.data as SparePart;
  },

  addMovement: async (id: string, data: AddMovementData): Promise<SparePartMovement> => {
    const response = await api.post<SparePartMovement>(`/spare-parts/${id}/movements`, data);
    return response.data as SparePartMovement;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/spare-parts/${id}`);
  },

  restore: async (id: string): Promise<void> => {
    await api.patch(`/spare-parts/${id}/restore`);
  },
};
