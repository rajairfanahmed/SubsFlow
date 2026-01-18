import jwt from 'jsonwebtoken';
import { config } from '../config';
import { User, IUserDocument, RefreshToken } from '../models';
import { 
  AuthenticationError, 
  ConflictError, 
  NotFoundError, 
  ValidationError,
  logger,
  generateSecureToken,
  calculateExpiry,
} from '../utils';
import { 
  RegisterInput, 
  LoginInput, 
  ForgotPasswordInput,
  ResetPasswordInput,
} from '../validators';
import { JwtPayload, TokenPair } from '../types';
import { notificationService } from './notification.service';

export class AuthService {
  /**
   * Register a new user
   */
  /**
   * Register a new user
   */
  async register(input: RegisterInput): Promise<{ user: IUserDocument }> {
    const { email, password, name, phone } = input;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ConflictError('Email already registered');
    }

    // Generate verification token
    const verificationToken = generateSecureToken();

    // Create user with hashed password
    const user = await User.create({
      email,
      passwordHash: password, // Will be hashed by pre-save hook
      name,
      phone,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: calculateExpiry('24h'),
    });

    // Send welcome email (async, don't block registration)
    notificationService.sendWelcomeNotification(user._id.toString(), verificationToken)
      .catch(err => logger.error('Failed to send welcome email', { userId: user._id, error: err }));

    logger.info('User registered', { userId: user._id, email: user.email });

    return { user };
  }

  /**
   * Login with email and password
   */
  async login(input: LoginInput, userAgent?: string, ipAddress?: string): Promise<{ user: IUserDocument; tokens: TokenPair }> {
    const { email, password } = input;

    // Find user with password
    const user = await User.findOne({ email, status: 'active' }).select('+passwordHash');
    if (!user) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Check email verification if required
    if (config.app.requireEmailVerification && !user.emailVerified) {
        throw new AuthenticationError('Please verify your email address to log in');
    }

    // Update last login
    user.lastLoginAt = new Date();
    await user.save();

    // Generate tokens
    const tokens = await this.generateTokens(user, userAgent, ipAddress);

    logger.info('User logged in', { userId: user._id, email: user.email });

    return { user, tokens };
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<TokenPair> {
    // Verify refresh token
    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as JwtPayload;
    } catch {
      throw new AuthenticationError('Invalid refresh token');
    }

    if (decoded.type !== 'refresh') {
      throw new AuthenticationError('Invalid token type');
    }

    // Check if token exists and not revoked
    const storedToken = await RefreshToken.findOne({
      token: refreshToken,
      userId: decoded.userId,
      isRevoked: false,
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      throw new AuthenticationError('Refresh token expired or revoked');
    }

    // Get user
    const user = await User.findById(decoded.userId);
    if (!user || user.status !== 'active') {
      throw new AuthenticationError('User not found or inactive');
    }

    // Revoke old refresh token (rotation)
    storedToken.isRevoked = true;
    await storedToken.save();

    // Generate new tokens
    const tokens = await this.generateTokens(user);

    logger.info('Token refreshed', { userId: user._id });

    return tokens;
  }

  /**
   * Logout - revoke refresh token
   */
  async logout(refreshToken: string): Promise<void> {
    await RefreshToken.updateOne(
      { token: refreshToken },
      { isRevoked: true }
    );

    logger.info('User logged out');
  }

  /**
   * Logout from all devices
   */
  async logoutAll(userId: string): Promise<void> {
    await RefreshToken.updateMany(
      { userId, isRevoked: false },
      { isRevoked: true }
    );

    logger.info('User logged out from all devices', { userId });
  }

  /**
   * Request password reset
   */
  async forgotPassword(input: ForgotPasswordInput): Promise<void> {
    const { email } = input;

    const user = await User.findOne({ email, status: 'active' });
    if (!user) {
      // Don't reveal if email exists
      return;
    }

    // Generate reset token
    const resetToken = generateSecureToken();
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = calculateExpiry('1h');
    await user.save();

    // Send password reset email (async)
    notificationService.sendPasswordResetNotification(user._id.toString(), resetToken)
      .catch(err => logger.error('Failed to send password reset email', { userId: user._id, error: err }));

    logger.info('Password reset requested', { userId: user._id });
  }

  /**
   * Reset password with token
   */
  async resetPassword(input: ResetPasswordInput): Promise<void> {
    const { token, password } = input;

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() },
      status: 'active',
    }).select('+passwordResetToken');

    if (!user) {
      throw new ValidationError('Invalid or expired reset token');
    }

    // Update password
    user.passwordHash = password; // Will be hashed by pre-save hook
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // Revoke all refresh tokens
    await RefreshToken.updateMany(
      { userId: user._id, isRevoked: false },
      { isRevoked: true }
    );

    logger.info('Password reset completed', { userId: user._id });
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<void> {
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() },
    }).select('+emailVerificationToken');

    if (!user) {
      throw new ValidationError('Invalid or expired verification token');
    }

    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    logger.info('Email verified', { userId: user._id });
  }

  /**
   * Change password (authenticated user)
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await User.findById(userId).select('+passwordHash');
    if (!user) {
      throw new NotFoundError('User');
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw new AuthenticationError('Current password is incorrect');
    }

    // Update password
    user.passwordHash = newPassword; // Will be hashed by pre-save hook
    await user.save();

    // Revoke all refresh tokens
    await RefreshToken.updateMany(
      { userId: user._id, isRevoked: false },
      { isRevoked: true }
    );

    logger.info('Password changed', { userId: user._id });
  }

  /**
   * Generate access and refresh tokens
   */
  private async generateTokens(
    user: IUserDocument,
    userAgent?: string,
    ipAddress?: string
  ): Promise<TokenPair> {
    const accessPayload: JwtPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      type: 'access',
    };

    const refreshPayload: JwtPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      type: 'refresh',
    };

    const accessToken = jwt.sign(
      accessPayload, 
      config.jwt.secret, 
      { expiresIn: config.jwt.expiresIn } as jwt.SignOptions
    );

    const refreshToken = jwt.sign(
      refreshPayload, 
      config.jwt.refreshSecret, 
      { expiresIn: config.jwt.refreshExpiresIn } as jwt.SignOptions
    );

    // Store refresh token
    await RefreshToken.create({
      userId: user._id,
      token: refreshToken,
      expiresAt: calculateExpiry(config.jwt.refreshExpiresIn),
      userAgent,
      ipAddress,
    });

    return { accessToken, refreshToken };
  }

  /**
   * Verify access token
   */
  verifyAccessToken(token: string): JwtPayload {
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
      
      if (decoded.type !== 'access') {
        throw new AuthenticationError('Invalid token type');
      }
      
      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new AuthenticationError('Token expired');
      }
      throw new AuthenticationError('Invalid token');
    }
  }
}

export const authService = new AuthService();
