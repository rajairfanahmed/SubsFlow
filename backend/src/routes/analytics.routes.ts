import { Router } from 'express';
import { analyticsController } from '../controllers/analytics.controller';
import { authenticate, optionalAuth, authorize } from '../middlewares/auth.middleware';

const router = Router();

// Public: Track events (optional auth for user association)
router.post('/track', optionalAuth, analyticsController.trackEvent.bind(analyticsController));

// Admin only: Dashboard and reports
router.get(
  '/dashboard',
  authenticate,
  authorize('admin'),
  analyticsController.getDashboard.bind(analyticsController)
);

router.get(
  '/timeseries',
  authenticate,
  authorize('admin'),
  analyticsController.getTimeSeries.bind(analyticsController)
);

router.get(
  '/funnel',
  authenticate,
  authorize('admin'),
  analyticsController.getConversionFunnel.bind(analyticsController)
);

// New endpoints for admin analytics pages
router.get(
  '/events',
  authenticate,
  authorize('admin'),
  analyticsController.getRecentEvents.bind(analyticsController)
);

router.get(
  '/realtime',
  authenticate,
  authorize('admin'),
  analyticsController.getRealtimeMetrics.bind(analyticsController)
);

router.get(
  '/recent-sales',
  authenticate,
  authorize('admin'),
  analyticsController.getRecentSales.bind(analyticsController)
);

export { router as analyticsRoutes };
