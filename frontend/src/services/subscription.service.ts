import { api } from "./api";
import { Subscription, Plan } from "@/types";

export const subscriptionService = {
  // Get current user's subscription
  getCurrentSubscription: async (): Promise<Subscription | null> => {
    try {
      const { data } = await api.get("/subscriptions/current");
      return data;
    } catch (error) {
      return null;
    }
  },

  // Get all subscriptions (Admin)
  getAllSubscriptions: async (params?: { page?: number; limit?: number; search?: string }) => {
    const { data } = await api.get("/admin/subscriptions", { params });
    return data;
  },

  // Create Stripe Checkout Session
  createCheckoutSession: async (priceId: string) => {
    const { data } = await api.post("/billing/checkout", { priceId });
    return data;
  },

  // Create Customer Portal Session
  createPortalSession: async () => {
    const { data } = await api.post("/billing/portal");
    return data;
  },

  // Cancel Subscription
  cancelSubscription: async (id: string) => {
    const { data } = await api.post(`/subscriptions/${id}/cancel`);
    return data;
  },

  // Refund Payment (Admin)
  refundPayment: async (id: string) => {
    const { data } = await api.post(`/payments/${id}/refund`);
    return data;
  },

  reactivateSubscription: async (subscriptionId: string): Promise<void> => {
      await api.post(`/subscriptions/${subscriptionId}/reactivate`);
  }
};
