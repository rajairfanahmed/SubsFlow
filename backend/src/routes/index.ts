import { Router } from 'express';
import { authRoutes } from './auth.routes';
import { stripeRoutes } from './stripe.routes';
import { webhookRoutes } from './webhook.routes';
import { subscriptionRoutes } from './subscription.routes';
import { contentRoutes } from './content.routes';
import { notificationRoutes } from './notification.routes';
import { analyticsRoutes } from './analytics.routes';
import { userRoutes } from './user.routes';
import { planRoutes } from './plan.routes';
import { healthRoutes } from './health.routes';
import { adminRoutes } from './admin.routes';
import { docsRoutes } from '../docs';

const router = Router();

// Health checks at root level
router.use('/health', healthRoutes);

// API Documentation
router.use('/docs', docsRoutes);

// Mount route modules
router.use('/auth', authRoutes);
router.use('/billing', stripeRoutes);
router.use('/webhooks', webhookRoutes);
router.use('/subscriptions', subscriptionRoutes);
router.use('/content', contentRoutes);
router.use('/notifications', notificationRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/users', userRoutes);
router.use('/plans', planRoutes);
router.use('/admin', adminRoutes);

export { router as apiRoutes };

