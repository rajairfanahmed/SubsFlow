import { Router } from 'express';
import { stripeController } from '../controllers/stripe.controller';
import { authenticate, validateBody } from '../middlewares';
import { 
  createCheckoutSessionSchema, 
  createPortalSessionSchema,
  cancelSubscriptionSchema,
  updateSubscriptionSchema
} from '../validators/stripe.validator';

const router = Router();

// All billing routes require authentication
router.use(authenticate);

router.post(
  '/checkout-session',
  validateBody(createCheckoutSessionSchema),
  stripeController.createCheckoutSession.bind(stripeController)
);

router.post(
  '/portal-session',
  validateBody(createPortalSessionSchema),
  stripeController.createPortalSession.bind(stripeController)
);

router.post(
  '/cancel-subscription',
  validateBody(cancelSubscriptionSchema),
  stripeController.cancelSubscription.bind(stripeController)
);

router.post(
  '/update-subscription',
  validateBody(updateSubscriptionSchema),
  stripeController.updateSubscription.bind(stripeController)
);

export { router as stripeRoutes };
