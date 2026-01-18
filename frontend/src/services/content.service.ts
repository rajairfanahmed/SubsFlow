import { api } from './api';
import { Content } from "@/types";

export const contentService = {
  // Get all content (Public/Library)
  getAll: async (params?: { category?: string; search?: string }): Promise<Content[]> => {
    const { data } = await api.get("/content", { params });
    return data;
  },

  // Get single video details
  getVideo: async (id: string): Promise<Content & { videoUrl?: string }> => {
    const { data } = await api.get(`/content/${id}`);
    return data;
  },

  // Check access rights
  checkAccess: async (id: string): Promise<{ hasAccess: boolean }> => {
    try {
      const { data } = await api.get(`/content/${id}/access`);
      return data;
    } catch {
      return { hasAccess: false };
    }
  },

  // Admin: Create content
  create: async (data: Partial<Content>) => {
    const response = await api.post("/admin/content", data);
    return response.data;
  },

  // Admin: Update content
  update: async (id: string, data: Partial<Content>) => {
    const response = await api.patch(`/admin/content/${id}`, data);
    return response.data;
  },

  // Admin: Delete content
  delete: async (id: string) => {
    const response = await api.delete(`/admin/content/${id}`);
    return response.data;
  }
};
