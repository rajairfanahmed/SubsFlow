import { Router } from 'express';
import { healthController } from '../controllers/health.controller';

const router = Router();

// Basic health check (load balancer)
router.get('/', healthController.healthCheck.bind(healthController));

// Readiness check (with dependencies)
router.get('/ready', healthController.readinessCheck.bind(healthController));

// Liveness check (is app running)
router.get('/live', healthController.livenessCheck.bind(healthController));

export { router as healthRoutes };
