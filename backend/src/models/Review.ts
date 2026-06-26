// This file defines the database structure and schema for review records.
/**
 * Review.ts — Review Mongoose model
 *
 * Polymorphic review system — one model handles both destination and guide reviews.
 * Uses targetType + targetId pattern (similar to GitHub's "reactable" pattern).
 *
 * Design decisions:
 * - Polymorphic reference (targetId + targetType) instead of separate
 *   DestinationReview and GuideReview models — keeps the codebase DRY
 * - Compound index { targetId, targetType } — the most common query pattern:
 *   "get all reviews for destination X" or "get all reviews for guide Y"
 * - No soft delete — reviews have low risk of needing recovery, keep it simple
 * - rating min/max enforced at both Mongoose level AND Zod validator level
 *
 * After a review is created, a post-save hook should update GuideProfile.rating.
 * That logic lives in the review controller/service to keep the model clean.
 */

import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  userId: mongoose.Types.ObjectId;
  targetId: mongoose.Types.ObjectId;
  targetType: 'destination' | 'guide';
  rating: number; // 1–5
  comment: string;
  createdAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'userId is required'],
    },
    targetId: {
      type: Schema.Types.ObjectId,
      required: [true, 'targetId is required'],
      // No ref here because it could point to Destination or GuideProfile
    },
    targetType: {
      type: String,
      enum: {
        values: ['destination', 'guide'],
        message: 'targetType must be destination or guide',
      },
      required: [true, 'targetType is required'],
    },
    rating: {
      type: Number,
      required: [true, 'rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    comment: {
      type: String,
      required: [true, 'comment is required'],
      minlength: [10, 'Comment must be at least 10 characters'],
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// ─── Indexes ─────────────────────────────────────────────────────────────────
// Compound index for the primary query: all reviews for a destination or guide
ReviewSchema.index({ targetId: 1, targetType: 1 });
// For fetching all reviews by a specific user
ReviewSchema.index({ userId: 1 });

export default mongoose.model<IReview>('Review', ReviewSchema);
