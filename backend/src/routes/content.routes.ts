import { Router } from 'express';
import { contentController } from '../controllers/content.controller';
import { 
  authenticate, 
  optionalAuth, 
  authorize 
} from '../middlewares/auth.middleware';
import { 
  requireContentAccess, 
  requireActiveSubscription 
} from '../middlewares/content-access.middleware';

const router = Router();

// Public: List published content
router.get(
  '/',
  optionalAuth,
  contentController.listContent.bind(contentController)
);

// Protected: Get user's access history
router.get(
  '/history',
  authenticate,
  contentController.getHistory.bind(contentController)
);

// Protected: Get single content (with access check)
router.get(
  '/:contentId',
  optionalAuth,
  requireContentAccess('contentId'),
  contentController.getContent.bind(contentController)
);

// Protected: Mark content as complete
router.post(
  '/:contentId/complete',
  authenticate,
  requireContentAccess('contentId'),
  contentController.markComplete.bind(contentController)
);

// Admin/Content Manager: Get content analytics
router.get(
  '/:contentId/analytics',
  authenticate,
  authorize('admin', 'content_manager'),
  contentController.getAnalytics.bind(contentController)
);

export { router as contentRoutes };
