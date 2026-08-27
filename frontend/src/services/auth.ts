import { api } from './api';

export interface Profile {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface UpdateProfileData {
  name?: string;
  email?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export const authApi = {
  async getProfile(): Promise<Profile> {
    const response = await api.get<Profile>('/auth/profile');
    return response.data as Profile;
  },

  async updateProfile(data: UpdateProfileData): Promise<Profile> {
    const response = await api.put<Profile>('/auth/profile', data);
    return response.data as Profile;
  },

  async changePassword(data: ChangePasswordData): Promise<void> {
    await api.post('/auth/change-password', data);
  },
};
