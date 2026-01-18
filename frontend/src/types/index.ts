export interface User {
  id: string;
  email: string;
  fullName?: string;
  role: 'user' | 'admin';
  avatarUrl?: string;
  subscriptionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Plan {
  id: string;
  name: string;
  slug: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  isActive: boolean;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: 'active' | 'canceled' | 'past_due' | 'incomplete';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  paymentMethodLast4?: string;
  paymentMethodBrand?: string;
}

export interface AuthResponse {
  user: User;
  token: string; // JWT
}

export interface ApiError {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}

export interface Content {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl?: string; // Only if access granted
  accessLevel: 'free' | 'basic' | 'premium';
  isLocked: boolean; // Flag from backend
  publishedAt: string;
  duration?: number;
  tags?: string[];
}
