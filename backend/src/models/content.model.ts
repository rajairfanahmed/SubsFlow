import { Schema, model, Document, Types } from 'mongoose';
import { IContent, ContentType, ContentStatus, IContentEngagement } from '../types';

export interface IContentDocument extends Omit<IContent, '_id'>, Document {
  _id: Types.ObjectId;
}

const engagementSchema = new Schema<IContentEngagement>({
  views: { type: Number, default: 0 },
  completions: { type: Number, default: 0 },
  avgTimeSpent: { type: Number, default: 0 },
  bookmarks: { type: Number, default: 0 },
}, { _id: false });

const contentSchema = new Schema<IContentDocument>({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: 200,
  },
  slug: {
    type: String,
    required: [true, 'Slug is required'],
    unique: true,
    lowercase: true,
    index: true,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: 2000,
  },
  type: {
    type: String,
    required: [true, 'Content type is required'],
    enum: {
      values: ['video', 'article', 'course', 'download'] as ContentType[],
      message: 'Invalid content type',
    },
  },
  status: {
    type: String,
    required: [true, 'Status is required'],
    enum: {
      values: ['draft', 'published', 'archived'] as ContentStatus[],
      message: 'Invalid content status',
    },
    default: 'draft',
    index: true,
  },
  requiredTier: {
    type: Number,
    required: [true, 'Required tier is required'],
    min: 0, // 0 = free/preview content
    max: 10,
    index: true,
  },
  fileUrl: { type: String },
  thumbnailUrl: { type: String },
  duration: { type: Number }, // For video, in seconds
  wordCount: { type: Number }, // For articles
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author is required'],
    index: true,
  },
  tags: [{
    type: String,
    lowercase: true,
  }],
  category: {
    type: String,
    required: [true, 'Category is required'],
    index: true,
  },
  publishedAt: { type: Date },
  engagement: {
    type: engagementSchema,
    default: () => ({}),
  },
  seo: {
    metaTitle: { type: String },
    metaDescription: { type: String },
  },
}, {
  timestamps: true,
  toJSON: {
    transform(_doc, ret: Record<string, unknown>) {
      delete ret.__v;
      return ret;
    },
  },
});

// Indexes
contentSchema.index({ status: 1, publishedAt: -1 });
contentSchema.index({ tags: 1 });
contentSchema.index({ '$**': 'text' }); // Full-text search

export const Content = model<IContentDocument>('Content', contentSchema);
