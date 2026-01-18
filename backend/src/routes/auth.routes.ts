import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { validateBody, authenticate } from '../middlewares';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  changePasswordSchema,
} from '../validators';

const router = Router();

// Public routes
router.post(
  '/register',
  validateBody(registerSchema),
  authController.register.bind(authController)
);

router.post(
  '/login',
  validateBody(loginSchema),
  authController.login.bind(authController)
);

router.post(
  '/refresh',
  validateBody(refreshTokenSchema),
  authController.refreshToken.bind(authController)
);

router.post(
  '/forgot-password',
  validateBody(forgotPasswordSchema),
  authController.forgotPassword.bind(authController)
);

router.post(
  '/reset-password',
  validateBody(resetPasswordSchema),
  authController.resetPassword.bind(authController)
);

router.post(
  '/verify-email',
  validateBody(verifyEmailSchema),
  authController.verifyEmail.bind(authController)
);

// Protected routes (require authentication)
router.post(
  '/logout',
  authenticate,
  validateBody(refreshTokenSchema),
  authController.logout.bind(authController)
);

router.post(
  '/logout-all',
  authenticate,
  authController.logoutAll.bind(authController)
);

router.post(
  '/change-password',
  authenticate,
  validateBody(changePasswordSchema),
  authController.changePassword.bind(authController)
);

export { router as authRoutes };
