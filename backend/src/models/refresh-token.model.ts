import { Schema, model, Document, Types } from 'mongoose';

/**
 * RefreshToken model for managing JWT refresh tokens
 * Enables revocation and session tracking
 */
export interface IRefreshTokenDocument extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  token: string;
  expiresAt: Date;
  isRevoked: boolean;
  userAgent?: string;
  ipAddress?: string;
  createdAt: Date;
}

const refreshTokenSchema = new Schema<IRefreshTokenDocument>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true,
  },
  token: {
    type: String,
    required: [true, 'Token is required'],
    unique: true,
    index: true,
  },
  expiresAt: {
    type: Date,
    required: [true, 'Expiry date is required'],
  },
  isRevoked: {
    type: Boolean,
    default: false,
  },
  userAgent: { type: String },
  ipAddress: { type: String },
}, {
  timestamps: true,
});

// TTL Index: Remove expired tokens after expiry
refreshTokenSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);

// Compound index for token validation
refreshTokenSchema.index({ userId: 1, isRevoked: 1 });

export const RefreshToken = model<IRefreshTokenDocument>('RefreshToken', refreshTokenSchema);
