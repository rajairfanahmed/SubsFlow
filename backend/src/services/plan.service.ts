import { Plan, IPlanDocument } from '../models';
import { NotFoundError, ConflictError, logger } from '../utils';
import { PlanInterval } from '../types';

export interface CreatePlanInput {
  name: string;
  slug: string;
  description: string;
  price: number;
  currency?: string;
  interval: PlanInterval;
  intervalCount?: number;
  trialDays?: number;
  features?: Array<{ name: string; included: boolean; limit?: number }>;
  tierLevel: number;
  stripePriceId: string;
  stripeProductId: string;
  sortOrder?: number;
}

export interface UpdatePlanInput {
  name?: string;
  description?: string;
  features?: Array<{ name: string; included: boolean; limit?: number }>;
  isActive?: boolean;
  sortOrder?: number;
}

export class PlanService {
  /**
   * Get all plans (optionally include inactive)
   */
  async getAll(includeInactive: boolean = false): Promise<IPlanDocument[]> {
    const query = includeInactive ? {} : { isActive: true };
    return await Plan.find(query).sort({ sortOrder: 1, tierLevel: 1 });
  }

  /**
   * Get plan by ID
   */
  async getById(planId: string): Promise<IPlanDocument> {
    const plan = await Plan.findById(planId);
    if (!plan) {
      throw new NotFoundError('Plan');
    }
    return plan;
  }

  /**
   * Create plan (admin)
   */
  async create(input: CreatePlanInput): Promise<IPlanDocument> {
    // Check for duplicate slug
    const existingPlan = await Plan.findOne({ slug: input.slug });
    if (existingPlan) {
      throw new ConflictError('Plan with this slug already exists');
    }

    const plan = await Plan.create({
      ...input,
      currency: input.currency || 'usd',
      intervalCount: input.intervalCount || 1,
      trialDays: input.trialDays || 0,
      features: input.features || [],
      isActive: true,
      sortOrder: input.sortOrder || 0,
    });

    logger.info('Plan created', { planId: plan._id, name: plan.name });
    return plan;
  }

  /**
   * Update plan (admin)
   */
  async update(planId: string, input: UpdatePlanInput): Promise<IPlanDocument> {
    const plan = await Plan.findById(planId);
    if (!plan) {
      throw new NotFoundError('Plan');
    }

    Object.assign(plan, input);
    await plan.save();

    logger.info('Plan updated', { planId, changes: Object.keys(input) });
    return plan;
  }

  /**
   * Deactivate plan (admin)
   * Note: Doesn't delete - existing subscriptions may reference it
   */
  async deactivate(planId: string): Promise<IPlanDocument> {
    const plan = await Plan.findById(planId);
    if (!plan) {
      throw new NotFoundError('Plan');
    }

    plan.isActive = false;
    await plan.save();

    logger.info('Plan deactivated', { planId });
    return plan;
  }

  /**
   * Activate plan (admin)
   */
  async activate(planId: string): Promise<IPlanDocument> {
    const plan = await Plan.findById(planId);
    if (!plan) {
      throw new NotFoundError('Plan');
    }

    plan.isActive = true;
    await plan.save();

    logger.info('Plan activated', { planId });
    return plan;
  }
}

export const planService = new PlanService();
