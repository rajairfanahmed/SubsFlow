import { Schema, model, Document, Types } from 'mongoose';
import bcrypt from 'bcrypt';
import { IUser, UserRole, UserStatus, IUserPreferences } from '../types';

export interface IUserDocument extends Omit<IUser, '_id'>, Document {
  _id: Types.ObjectId;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userPreferencesSchema = new Schema<IUserPreferences>({
  notifications: {
    email: { type: Boolean, default: true },
    renewalReminders: { type: Boolean, default: true },
    productUpdates: { type: Boolean, default: false },
  },
  timezone: { type: String, default: 'UTC' },
}, { _id: false });

const userSchema = new Schema<IUserDocument>({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
    index: true,
  },
  passwordHash: {
    type: String,
    required: [true, 'Password is required'],
    // Note: minlength removed - plain password received, hashed in pre-save hook
    select: false, // Don't include by default in queries
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: 100,
  },
  phone: {
    type: String,
    trim: true,
    match: [/^\+?[1-9]\d{1,14}$/, 'Invalid phone format'],
  },
  avatarUrl: { type: String },
  role: {
    type: String,
    enum: {
      values: ['subscriber', 'content_manager', 'admin'] as UserRole[],
      message: 'Invalid role',
    },
    default: 'subscriber',
  },
  status: {
    type: String,
    enum: {
      values: ['active', 'suspended', 'deleted'] as UserStatus[],
      message: 'Invalid status',
    },
    default: 'active',
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  emailVerificationToken: {
    type: String,
    select: false,
  },
  emailVerificationExpires: { type: Date },
  passwordResetToken: {
    type: String,
    select: false,
  },
  passwordResetExpires: { type: Date },
  twoFactorEnabled: {
    type: Boolean,
    default: false,
  },
  twoFactorSecret: {
    type: String,
    select: false,
  },
  stripeCustomerId: {
    type: String,
    sparse: true,
    index: true,
  },
  preferences: {
    type: userPreferencesSchema,
    default: () => ({}),
  },
  lastLoginAt: { type: Date },
}, {
  timestamps: true,
  toJSON: {
    transform(_doc, ret: Record<string, unknown>) {
      delete ret.passwordHash;
      delete ret.twoFactorSecret;
      delete ret.emailVerificationToken;
      delete ret.passwordResetToken;
      delete ret.__v;
      return ret;
    },
  },
});

// Indexes
userSchema.index({ status: 1, role: 1 });
userSchema.index({ emailVerificationToken: 1 }, { sparse: true });
userSchema.index({ passwordResetToken: 1 }, { sparse: true });
userSchema.index({ stripeCustomerId: 1 }, { unique: true, sparse: true });

// Password comparison method
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('passwordHash')) {
    return next();
  }
  
  // Only hash if it's a plain password (not already hashed)
  if (this.passwordHash.length < 60) {
    const salt = await bcrypt.genSalt(12);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  }
  
  next();
});

export const User = model<IUserDocument>('User', userSchema);
