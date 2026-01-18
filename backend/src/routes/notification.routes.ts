import { Router } from 'express';
import { notificationController } from '../controllers/notification.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// All notification routes require authentication
router.use(authenticate);

// Get notifications with pagination
router.get('/', notificationController.getNotifications.bind(notificationController));

// Get unread notifications
router.get('/unread', notificationController.getUnread.bind(notificationController));

// Get unread count
router.get('/count', notificationController.getUnreadCount.bind(notificationController));

// Mark all as read
router.patch('/read-all', notificationController.markAllAsRead.bind(notificationController));

// Mark single notification as read
router.patch('/:id/read', notificationController.markAsRead.bind(notificationController));

// Delete notification
router.delete('/:id', notificationController.deleteNotification.bind(notificationController));

export { router as notificationRoutes };
