import { Schema, model, Document, Types } from 'mongoose';

/**
 * ProcessedEvent model for webhook idempotency
 * Tracks which Stripe events have already been processed
 */
export interface IProcessedEventDocument extends Document {
  _id: Types.ObjectId;
  eventId: string;
  eventType: string;
  processedAt: Date;
}

const processedEventSchema = new Schema<IProcessedEventDocument>({
  eventId: {
    type: String,
    required: [true, 'Event ID is required'],
    unique: true,
    index: true,
  },
  eventType: {
    type: String,
    required: [true, 'Event type is required'],
  },
  processedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: false,
});

// TTL Index: Remove after 7 days
processedEventSchema.index(
  { processedAt: 1 },
  { expireAfterSeconds: 7 * 24 * 60 * 60 }
);

export const ProcessedEvent = model<IProcessedEventDocument>('ProcessedEvent', processedEventSchema);
