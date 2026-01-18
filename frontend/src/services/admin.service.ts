import { api } from './api';

export interface DashboardStats {
  totalRevenue: number;
  activeSubscribers: number;
  churnRate: number;
  recentSignups: Array<{
    id: string;
    name: string;
    email: string;
    plan: string;
    joinedAt: string;
  }>;
}

export const adminService = {
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await api.get<{ data: DashboardStats }>('/admin/analytics/dashboard');
    return response.data.data;
  },

  getRevenueChart: async (period: '7d' | '30d' | '1y' = '30d') => {
    const response = await api.get(`/admin/analytics/revenue?period=${period}`);
    return response.data;
  },
  
  getUsers: async (page = 1, limit = 10) => {
      const response = await api.get(`/admin/users?page=${page}&limit=${limit}`);
      return response.data;
  }
};
