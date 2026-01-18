import { Router } from 'express';
import { planController } from '../controllers/plan.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

// Public: List active plans
router.get('/', planController.listPlans.bind(planController));

// Public: Get specific plan
router.get('/:planId', planController.getPlan.bind(planController));

// Admin only: Create plan
router.post(
  '/',
  authenticate,
  authorize('admin'),
  planController.createPlan.bind(planController)
);

// Admin only: Update plan
router.patch(
  '/:planId',
  authenticate,
  authorize('admin'),
  planController.updatePlan.bind(planController)
);

// Admin only: Deactivate plan
router.post(
  '/:planId/deactivate',
  authenticate,
  authorize('admin'),
  planController.deactivatePlan.bind(planController)
);

// Admin only: Activate plan
router.post(
  '/:planId/activate',
  authenticate,
  authorize('admin'),
  planController.activatePlan.bind(planController)
);

export { router as planRoutes };
