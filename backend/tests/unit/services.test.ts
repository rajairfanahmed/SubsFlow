import { createTestUser, createTestPlan } from '../factories';
import { userService } from '../../src/services/user.service';
import { planService } from '../../src/services/plan.service';

describe('UserService', () => {
  describe('getById', () => {
    it('should return user by ID', async () => {
      const user = await createTestUser({ name: 'John Doe' });
      
      const result = await userService.getById(user._id.toString());
      
      expect(result).toBeDefined();
      expect(result.name).toBe('John Doe');
      expect(result.email).toBe(user.email);
    });

    it('should throw NotFoundError for non-existent user', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      
      await expect(userService.getById(fakeId)).rejects.toThrow('User not found');
    });
  });

  describe('search', () => {
    it('should search users by email', async () => {
      await createTestUser({ email: 'john@example.com', name: 'John' });
      await createTestUser({ email: 'jane@example.com', name: 'Jane' });
      
      const result = await userService.search({ search: 'john' });
      
      expect(result.users).toHaveLength(1);
      expect(result.users[0]?.email).toBe('john@example.com');
    });

    it('should filter by role', async () => {
      await createTestUser({ role: 'admin' });
      await createTestUser({ role: 'subscriber' });
      
      const result = await userService.search({ role: 'admin' });
      
      expect(result.users).toHaveLength(1);
      expect(result.users[0]?.role).toBe('admin');
    });

    it('should paginate results', async () => {
      for (let i = 0; i < 5; i++) {
        await createTestUser();
      }
      
      const result = await userService.search({ page: 1, limit: 2 });
      
      expect(result.users).toHaveLength(2);
      expect(result.total).toBe(5);
      expect(result.pages).toBe(3);
    });
  });
});

describe('PlanService', () => {
  describe('getAll', () => {
    it('should return only active plans by default', async () => {
      await createTestPlan({ isActive: true, name: 'Active Plan' });
      await createTestPlan({ isActive: false, name: 'Inactive Plan' });
      
      const plans = await planService.getAll();
      
      expect(plans).toHaveLength(1);
      expect(plans[0]?.name).toBe('Active Plan');
    });

    it('should return all plans when includeInactive is true', async () => {
      await createTestPlan({ isActive: true });
      await createTestPlan({ isActive: false });
      
      const plans = await planService.getAll(true);
      
      expect(plans).toHaveLength(2);
    });
  });

  describe('create', () => {
    it('should create a new plan', async () => {
      const planData = {
        name: 'Premium',
        slug: 'premium',
        description: 'Premium plan',
        price: 1999,
        interval: 'month' as const,
        tierLevel: 2,
        stripePriceId: 'price_xyz',
        stripeProductId: 'prod_xyz',
      };
      
      const plan = await planService.create(planData);
      
      expect(plan.name).toBe('Premium');
      expect(plan.price).toBe(1999);
      expect(plan.isActive).toBe(true);
    });

    it('should throw ConflictError for duplicate slug', async () => {
      await createTestPlan({ slug: 'unique-slug' });
      
      await expect(
        planService.create({
          name: 'Duplicate',
          slug: 'unique-slug',
          description: 'Test',
          price: 999,
          interval: 'month',
          tierLevel: 1,
          stripePriceId: 'price_abc',
          stripeProductId: 'prod_abc',
        })
      ).rejects.toThrow('Plan with this slug already exists');
    });
  });
});
