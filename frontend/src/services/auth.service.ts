import { api } from './api';
import { AuthResponse } from '@/types';

// Define payloads locally if they are specific to request bodies
export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export const authService = {
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const response = await api.post<{ data: AuthResponse }>('/auth/login', payload);
    // Backend returns { success: true, data: { user: {...}, token: "..." } }
    return response.data.data;
  },

  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const response = await api.post<{ data: AuthResponse }>('/auth/register', payload);
    return response.data.data;
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  },

  getMe: async () => {
      const response = await api.get<{ data: { user: any } }>('/auth/me');
      return response.data.data.user;
  },

};
