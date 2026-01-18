import { User, Subscription, Payment, IUserDocument } from '../models';
import { NotFoundError, ConflictError, ValidationError, logger } from '../utils';
import { UserRole, UserStatus } from '../types';
import { Types } from 'mongoose';

export interface CreateUserInput {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
  phone?: string;
}

export interface UpdateUserInput {
  name?: string;
  phone?: string;
  role?: UserRole;
  status?: UserStatus;
  avatarUrl?: string;
}

export interface UserSearchOptions {
  search?: string;
  role?: UserRole;
  status?: UserStatus;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface UserWithSubscription extends IUserDocument {
  subscription?: {
    planId: any;
    status: string;
    currentPeriodEnd: Date;
  };
}

export class UserService {
  /**
   * Get user by ID with subscription info
   */
  async getById(userId: string): Promise<UserWithSubscription> {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User');
    }

    // Get active subscription
    const subscription = await Subscription.findOne({
      userId,
      status: { $in: ['active', 'trialing', 'past_due'] }
    }).populate('planId', 'name tierLevel');

    const result = user.toObject();
    if (subscription) {
      (result as any).subscription = {
        planId: subscription.planId,
        status: subscription.status,
        currentPeriodEnd: subscription.currentPeriodEnd,
      };
    }

    return result as UserWithSubscription;
  }

  /**
   * Search and list users (admin)
   */
  async search(options: UserSearchOptions): Promise<{
    users: IUserDocument[];
    total: number;
    page: number;
    pages: number;
  }> {
    const {
      search,
      role,
      status,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = options;

    const query: Record<string, unknown> = {};

    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
      ];
    }
    if (role) query.role = role;
    if (status) query.status = status;

    const skip = (page - 1) * limit;
    const sort: Record<string, 1 | -1> = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [users, total] = await Promise.all([
      User.find(query).sort(sort).skip(skip).limit(limit),
      User.countDocuments(query),
    ]);

    return {
      users,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }

  /**
   * Create user (admin)
   */
  async create(input: CreateUserInput): Promise<IUserDocument> {
    const existingUser = await User.findOne({ email: input.email });
    if (existingUser) {
      throw new ConflictError('Email already registered');
    }

    const user = await User.create({
      email: input.email,
      passwordHash: input.password, // Will be hashed by pre-save hook
      name: input.name,
      role: input.role || 'subscriber',
      phone: input.phone,
      emailVerified: true, // Admin-created users are pre-verified
    });

    logger.info('User created by admin', { userId: user._id });
    return user;
  }

  /**
   * Update user (admin)
   */
  async update(userId: string, input: UpdateUserInput): Promise<IUserDocument> {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User');
    }

    // Prevent changing last admin user's role
    if (input.role && input.role !== 'admin' && user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin', status: 'active' });
      if (adminCount <= 1) {
        throw new ValidationError('Cannot demote the last admin user');
      }
    }

    Object.assign(user, input);
    await user.save();

    logger.info('User updated by admin', { userId, changes: Object.keys(input) });
    return user;
  }

  /**
   * Suspend user (admin)
   */
  async suspend(userId: string): Promise<IUserDocument> {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User');
    }

    if (user.role === 'admin') {
      throw new ValidationError('Cannot suspend admin users');
    }

    user.status = 'suspended';
    await user.save();

    logger.info('User suspended', { userId });
    return user;
  }

  /**
   * Reactivate user (admin)
   */
  async reactivate(userId: string): Promise<IUserDocument> {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User');
    }

    user.status = 'active';
    await user.save();

    logger.info('User reactivated', { userId });
    return user;
  }

  /**
   * Delete user (hard delete - admin only, use with caution)
   */
  async delete(userId: string): Promise<void> {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User');
    }

    if (user.role === 'admin') {
      throw new ValidationError('Cannot delete admin users');
    }

    // Soft delete instead
    user.status = 'deleted';
    user.email = `deleted_${user._id}_${user.email}`;
    await user.save();

    logger.info('User soft deleted', { userId });
  }

  /**
   * Get user statistics
   */
  async getStats(userId: string): Promise<{
    totalPayments: number;
    totalSpent: number;
    subscriptionHistory: number;
  }> {
    const [paymentStats, subscriptionCount] = await Promise.all([
      Payment.aggregate([
        { $match: { userId: new Types.ObjectId(userId), status: 'succeeded' } },
        { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
      ]),
      Subscription.countDocuments({ userId }),
    ]);

    return {
      totalPayments: paymentStats[0]?.count || 0,
      totalSpent: paymentStats[0]?.total || 0,
      subscriptionHistory: subscriptionCount,
    };
  }
}

export const userService = new UserService();
