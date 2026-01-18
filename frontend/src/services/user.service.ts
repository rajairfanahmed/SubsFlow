import { api } from './api';
import { User } from '@/types';

export const userService = {
  getProfile: async (): Promise<User> => {
    const response = await api.get<User>('/users/profile');
    return response.data;
  },

  updateProfile: async (payload: Partial<User>): Promise<User> => {
    const response = await api.patch<User>('/users/profile', payload);
    return response.data;
  },

  updatePreferences: async (notifications: { email: boolean; push: boolean }) => {
      const response = await api.patch('/users/preferences', { notifications });
      return response.data;
  }
};
