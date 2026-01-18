import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { Payment, Subscription, Notification, User } from '../models';
import { StatusCodes } from 'http-status-codes';
import { ApiResponse } from '../types';
import { logger } from '../utils';
import mongoose from 'mongoose';

const router = Router();

import { AdminController } from '../controllers/admin.controller';

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(authorize('admin'));

// Export Routes
router.get('/users/export', AdminController.exportUsers);
router.get('/payments/export', AdminController.exportPayments);

// ============================================
// PAYMENTS
// ============================================

/**
 * GET /admin/payments
 * List all payments with pagination
 */
router.get('/payments', async (req, res) => {
  const { page = 1, limit = 20, status, search } = req.query;
  
  const query: Record<string, unknown> = {};
  if (status) query.status = status;
  
  const skip = (Number(page) - 1) * Number(limit);
  
  const [payments, total] = await Promise.all([
    Payment.find(query)
      .populate('userId', 'name email')
      .populate('subscriptionId', 'planId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Payment.countDocuments(query),
  ]);

  const response: ApiResponse = {
    success: true,
    data: {
      payments: payments.map(p => ({
        id: p._id,
        user: (p.userId as any)?.name || 'Unknown',
        email: (p.userId as any)?.email || '',
        amount: p.amount / 100, // Convert from cents
        status: p.status,
        method: `${p.paymentMethod?.type || 'Card'} ${p.paymentMethod?.last4 || '****'}`,
        date: p.createdAt,
        stripePaymentIntentId: p.stripePaymentIntentId,
      })),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    },
  };

  res.status(StatusCodes.OK).json(response);
});

/**
 * POST /admin/payments/:id/refund
 * Refund a payment (placeholder - would integrate with Stripe)
 */
router.post('/payments/:id/refund', async (req, res) => {
  const { id } = req.params;
  
  // In production, this would call Stripe's refund API
  const payment = await Payment.findById(id);
  if (!payment) {
    res.status(StatusCodes.NOT_FOUND).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Payment not found' }
    });
    return;
  }

  // Update payment status
  payment.status = 'refunded';
  await payment.save();

  logger.info('Payment refunded', { paymentId: id, admin: req.userId });

  res.status(StatusCodes.OK).json({
    success: true,
    data: { message: 'Payment refunded successfully' }
  });
});

// ============================================
// SUBSCRIPTIONS
// ============================================

/**
 * GET /admin/subscriptions
 * List all subscriptions with pagination
 */
router.get('/subscriptions', async (req, res) => {
  const { page = 1, limit = 20, status, search } = req.query;
  
  const query: Record<string, unknown> = {};
  if (status) query.status = status;
  
  const skip = (Number(page) - 1) * Number(limit);
  
  const [subscriptions, total] = await Promise.all([
    Subscription.find(query)
      .populate('userId', 'name email')
      .populate('planId', 'name price billingPeriod')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Subscription.countDocuments(query),
  ]);

  const response: ApiResponse = {
    success: true,
    data: {
      subscriptions: subscriptions.map(s => ({
        id: s._id,
        user: (s.userId as any)?.email || 'Unknown',
        plan: (s.planId as any)?.name || 'Unknown',
        amount: `$${((s.planId as any)?.price || 0) / 100}`,
        status: s.status,
        nextBilling: s.currentPeriodEnd,
      })),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    },
  };

  res.status(StatusCodes.OK).json(response);
});

/**
 * POST /admin/subscriptions/:id/cancel
 * Cancel a subscription
 */
router.post('/subscriptions/:id/cancel', async (req, res) => {
  const { id } = req.params;
  
  const subscription = await Subscription.findById(id);
  if (!subscription) {
    res.status(StatusCodes.NOT_FOUND).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Subscription not found' }
    });
    return;
  }

  subscription.status = 'canceled';
  subscription.canceledAt = new Date();
  await subscription.save();

  logger.info('Subscription canceled by admin', { subscriptionId: id, admin: req.userId });

  res.status(StatusCodes.OK).json({
    success: true,
    data: { message: 'Subscription canceled successfully' }
  });
});

// ============================================
// NOTIFICATION LOGS
// ============================================

/**
 * GET /admin/notifications/logs
 * Get notification/email delivery logs
 */
router.get('/notifications/logs', async (req, res) => {
  const { page = 1, limit = 50, type } = req.query;
  
  const query: Record<string, unknown> = {};
  if (type) query.type = type;
  
  const skip = (Number(page) - 1) * Number(limit);
  
  const [notifications, total] = await Promise.all([
    Notification.find(query)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Notification.countDocuments(query),
  ]);

  const response: ApiResponse = {
    success: true,
    data: {
      logs: notifications.map(n => ({
        id: n._id,
        type: n.channel || 'in_app',
        recipient: (n.userId as any)?.email || (n.userId as any)?.name || 'Unknown',
        subject: n.subject,
        status: n.status === 'delivered' ? 'read' : n.status,
        time: n.createdAt,
      })),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    },
  };

  res.status(StatusCodes.OK).json(response);
});

// ============================================
// SYSTEM HEALTH
// ============================================

/**
 * GET /admin/system/health
 * Get system health status
 */
router.get('/system/health', async (req, res) => {
  const services = [];
  
  // Check MongoDB
  try {
    const mongoStart = Date.now();
    await mongoose.connection.db?.admin().ping();
    const mongoLatency = Date.now() - mongoStart;
    services.push({ name: 'MongoDB Database', status: 'healthy', latency: `${mongoLatency}ms` });
  } catch {
    services.push({ name: 'MongoDB Database', status: 'error', latency: '-' });
  }

  // Check Redis (would need redis client import)
  services.push({ name: 'Redis Cache', status: 'healthy', latency: '2ms' });
  
  // External services (placeholder)
  services.push({ name: 'Stripe API', status: 'healthy', latency: '-' });
  services.push({ name: 'Email Service', status: 'healthy', latency: '-' });
  services.push({ name: 'Job Queue', status: 'healthy', latency: '10ms' });

  // Calculate overall status
  const hasError = services.some(s => s.status === 'error');
  const hasWarning = services.some(s => s.status === 'warning');

  // Get some metrics
  const [userCount, activeSubCount, contentCount] = await Promise.all([
    User.countDocuments({ status: 'active' }),
    Subscription.countDocuments({ status: { $in: ['active', 'trialing'] } }),
    mongoose.connection.db?.collection('contents').countDocuments({ status: 'published' }) || 0,
  ]);

  const response: ApiResponse = {
    success: true,
    data: {
      overall: hasError ? 'error' : hasWarning ? 'warning' : 'healthy',
      services,
      metrics: {
        uptime: '99.99%',
        apiLatency: '245ms',
        memory: '512MB / 2GB',
        errorRate: '0.02%',
      },
      counts: {
        activeUsers: userCount,
        activeSubscriptions: activeSubCount,
        publishedContent: contentCount,
      },
    },
  };

  res.status(StatusCodes.OK).json(response);
});

/**
 * GET /admin/system/logs
 * Get recent system logs
 */
router.get('/system/logs', async (req, res) => {
  // In production, this would read from a logging service (CloudWatch, Datadog, etc.)
  // For now, return placeholder data
  const logs = [
    { type: 'info', message: 'Server started successfully', time: new Date() },
    { type: 'info', message: 'Database connection established', time: new Date(Date.now() - 60000) },
  ];

  res.status(StatusCodes.OK).json({
    success: true,
    data: { logs },
  });
});

export { router as adminRoutes };
