import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { planService } from '../services/plan.service';
import { ApiResponse } from '../types';

export class PlanController {
  /**
   * GET /plans
   * List all plans
   */
  async listPlans(req: Request, res: Response): Promise<void> {
    const includeInactive = req.query.includeInactive === 'true';
    const plans = await planService.getAll(includeInactive);

    const response: ApiResponse = {
      success: true,
      data: { plans },
    };

    res.status(StatusCodes.OK).json(response);
  }

  /**
   * GET /plans/:planId
   * Get plan by ID
   */
  async getPlan(req: Request, res: Response): Promise<void> {
    const { planId } = req.params;
    
    if (!planId) {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Plan ID required' }
      });
      return;
    }

    const plan = await planService.getById(planId);

    const response: ApiResponse = {
      success: true,
      data: { plan },
    };

    res.status(StatusCodes.OK).json(response);
  }

  /**
   * POST /plans
   * Create plan (admin only)
   */
  async createPlan(req: Request, res: Response): Promise<void> {
    const plan = await planService.create(req.body);

    const response: ApiResponse = {
      success: true,
      data: { plan },
    };

    res.status(StatusCodes.CREATED).json(response);
  }

  /**
   * PATCH /plans/:planId
   * Update plan (admin only)
   */
  async updatePlan(req: Request, res: Response): Promise<void> {
    const { planId } = req.params;
    
    if (!planId) {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Plan ID required' }
      });
      return;
    }

    const plan = await planService.update(planId, req.body);

    const response: ApiResponse = {
      success: true,
      data: { plan },
    };

    res.status(StatusCodes.OK).json(response);
  }

  /**
   * POST /plans/:planId/deactivate
   * Deactivate plan (admin only)
   */
  async deactivatePlan(req: Request, res: Response): Promise<void> {
    const { planId } = req.params;
    
    if (!planId) {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Plan ID required' }
      });
      return;
    }

    const plan = await planService.deactivate(planId);

    const response: ApiResponse = {
      success: true,
      data: { plan, message: 'Plan deactivated' },
    };

    res.status(StatusCodes.OK).json(response);
  }

  /**
   * POST /plans/:planId/activate
   * Activate plan (admin only)
   */
  async activatePlan(req: Request, res: Response): Promise<void> {
    const { planId } = req.params;
    
    if (!planId) {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Plan ID required' }
      });
      return;
    }

    const plan = await planService.activate(planId);

    const response: ApiResponse = {
      success: true,
      data: { plan, message: 'Plan activated' },
    };

    res.status(StatusCodes.OK).json(response);
  }
}

export const planController = new PlanController();
