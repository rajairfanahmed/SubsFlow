import { Router } from 'express';
import { subscriptionController } from '../controllers/subscription.controller';
import { authenticate, optionalAuth } from '../middlewares';

const router = Router();

// Public: Get available plans
router.get('/plans', subscriptionController.getPlans.bind(subscriptionController));

// Protected: Get user's subscription
router.get('/me', authenticate, subscriptionController.getMySubscription.bind(subscriptionController));

// Protected: Check content access
router.get('/access/:contentId', authenticate, subscriptionController.checkContentAccess.bind(subscriptionController));

export { router as subscriptionRoutes };
