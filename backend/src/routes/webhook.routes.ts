import { Router } from 'express';
import { stripeWebhookHandler } from '../webhooks/stripe.webhook';

const router = Router();

router.post(
  '/stripe',
  stripeWebhookHandler.handle.bind(stripeWebhookHandler)
);

export { router as webhookRoutes };
