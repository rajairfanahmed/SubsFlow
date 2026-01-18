import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

// ============================================
// User Profile Routes (authenticated users)
// ============================================
router.get('/me', authenticate, userController.getMyProfile.bind(userController));
router.patch('/me', authenticate, userController.updateMyProfile.bind(userController));
router.get('/me/stats', authenticate, userController.getMyStats.bind(userController));

// ============================================
// Admin Routes (require admin role)
// ============================================

// List/search users
router.get('/', authenticate, authorize('admin'), userController.listUsers.bind(userController));

// Get specific user
router.get('/:userId', authenticate, authorize('admin'), userController.getUser.bind(userController));

// Get user stats
router.get('/:userId/stats', authenticate, authorize('admin'), userController.getUserStats.bind(userController));

// Create user
router.post('/', authenticate, authorize('admin'), userController.createUser.bind(userController));

// Update user
router.patch('/:userId', authenticate, authorize('admin'), userController.updateUser.bind(userController));

// Suspend user
router.post('/:userId/suspend', authenticate, authorize('admin'), userController.suspendUser.bind(userController));

// Reactivate user
router.post('/:userId/reactivate', authenticate, authorize('admin'), userController.reactivateUser.bind(userController));

// Delete user
router.delete('/:userId', authenticate, authorize('admin'), userController.deleteUser.bind(userController));

export { router as userRoutes };
