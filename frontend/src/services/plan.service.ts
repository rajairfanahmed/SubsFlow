import { api } from './api';
import { Plan } from '@/types';

export const planService = {
  getPlans: async (): Promise<Plan[]> => {
    const response = await api.get<{ data: { plans: Plan[] } }>('/plans');
    // Backend returns { success: true, data: { plans: [...] } }
    return response.data.data.plans || [];
  },

  getAllPlans: async (): Promise<Plan[]> => {
    // Admin: get all plans including inactive
    const response = await api.get<{ data: { plans: Plan[] } }>('/admin/plans');
    return response.data.data.plans || [];
  }
};
