import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';
import { getRedisClient } from '../config/redis';
import { ApiResponse } from '../types';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime: number;
  checks: {
    database: { status: string; latency?: number };
    redis: { status: string; latency?: number };
  };
}

export class HealthController {
  /**
   * GET /health
   * Basic health check (for load balancers)
   */
  async healthCheck(req: Request, res: Response): Promise<void> {
    res.status(StatusCodes.OK).json({ 
      status: 'healthy',
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * GET /health/ready
   * Readiness check (includes dependencies)
   */
  async readinessCheck(req: Request, res: Response): Promise<void> {
    const checks = await this.runHealthChecks();
    
    const isHealthy = checks.checks.database.status === 'up' && 
                      checks.checks.redis.status === 'up';
    
    const statusCode = isHealthy ? StatusCodes.OK : StatusCodes.SERVICE_UNAVAILABLE;
    
    const response: ApiResponse = {
      success: isHealthy,
      data: checks,
    };

    res.status(statusCode).json(response);
  }

  /**
   * GET /health/live
   * Liveness check (is the app running)
   */
  async livenessCheck(req: Request, res: Response): Promise<void> {
    res.status(StatusCodes.OK).json({
      status: 'alive',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    });
  }

  /**
   * Run all health checks
   */
  private async runHealthChecks(): Promise<HealthStatus> {
    const [dbCheck, redisCheck] = await Promise.all([
      this.checkDatabase(),
      this.checkRedis(),
    ]);

    const allUp = dbCheck.status === 'up' && redisCheck.status === 'up';

    return {
      status: allUp ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      uptime: process.uptime(),
      checks: {
        database: dbCheck,
        redis: redisCheck,
      },
    };
  }

  /**
   * Check MongoDB connection
   */
  private async checkDatabase(): Promise<{ status: string; latency?: number }> {
    try {
      const start = Date.now();
      await mongoose.connection.db?.admin().ping();
      const latency = Date.now() - start;
      return { status: 'up', latency };
    } catch (error) {
      return { status: 'down' };
    }
  }

  /**
   * Check Redis connection
   */
  private async checkRedis(): Promise<{ status: string; latency?: number }> {
    try {
      const redis = getRedisClient();
      const start = Date.now();
      await redis.ping();
      const latency = Date.now() - start;
      return { status: 'up', latency };
    } catch (error) {
      return { status: 'down' };
    }
  }
}

export const healthController = new HealthController();
