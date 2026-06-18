/**
 * GuideProfile.ts — Guide Profile Mongoose model
 *
 * Extends the base User with guide-specific information.
 * Relationship: GuideProfile has a 1:1 relationship with User (userId is unique).
 *
 * Design decisions:
 * - Separate collection instead of embedding in User — keeps User lean,
 *   and allows querying guides independently with filters (rating, location)
 * - rating and totalReviews are denormalised here for fast listing queries
 *   (alternative: computing on-the-fly from Reviews collection is too slow)
 * - rating is updated whenever a new review is submitted (see Review model)
 */

import mongoose, { Schema, Document } from 'mongoose';

export interface IGuideProfile extends Document {
  userId: mongoose.Types.ObjectId;
  experience: number; // years of experience
  languages: string[];
  expertise: string[]; // e.g. ['Trekking', 'Photography', 'Wildlife']
  location: string;
  bio: string;
  rating: number; // 0–5, updated on each review
  totalReviews: number;
  createdAt: Date;
}

const GuideProfileSchema = new Schema<IGuideProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User', // foreign key to User collection
      required: [true, 'userId is required'],
      unique: true, // one guide profile per user
    },
    experience: {
      type: Number,
      default: 0,
      min: [0, 'Experience cannot be negative'],
    },
    languages: [
      {
        type: String,
        // e.g. ['English', 'Hindi', 'Kannada']
      },
    ],
    expertise: [
      {
        type: String,
        // e.g. ['Trekking', 'Photography', 'Wildlife']
      },
    ],
    location: {
      type: String,
    },
    bio: {
      type: String,
      maxlength: [1000, 'Bio cannot exceed 1000 characters'],
    },
    rating: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be below 0'],
      max: [5, 'Rating cannot exceed 5'],
    },
    totalReviews: {
      type: Number,
      default: 0,
      min: [0, 'Total reviews cannot be negative'],
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// ─── Indexes ─────────────────────────────────────────────────────────────────
// Note: userId unique index is already created by `unique: true` in the field definition
// Location: filter guides by city/region
GuideProfileSchema.index({ location: 1 });
// Rating: sort guides by highest rated
GuideProfileSchema.index({ rating: -1 });

export default mongoose.model<IGuideProfile>('GuideProfile', GuideProfileSchema);
