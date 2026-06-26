// This file defines the database structure and schema for destination records.
/**
 * Destination.ts — Destination Mongoose model
 *
 * Stores travel destinations. Data is seeded (not user-generated).
 * 15–20 destinations for MVP, expandable later.
 *
 * Design decisions:
 * - Text index on name + activities powers the search bar
 * - budgetRange stored as string ("₹5,000 – ₹20,000 per day") for display flexibility
 * - images: Cloudinary URLs (empty for seed data, filled via admin panel later)
 * - featured: boolean flag for homepage "featured" section
 * - updatedAt disabled — destinations are managed data, not user-editable
 */

import mongoose, { Schema, Document } from 'mongoose';

export interface IDestination extends Document {
  name: string;
  country: string;
  state?: string;
  description: string;
  bestTimeToVisit?: string;
  budgetRange?: string;
  activities: string[];
  images: string[];
  featured: boolean;
  status: 'pending' | 'approved' | 'rejected';
  submittedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const DestinationSchema = new Schema<IDestination>(
  {
    name: {
      type: String,
      required: [true, 'Destination name is required'],
      trim: true,
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      minlength: [20, 'Description must be at least 20 characters'],
    },
    bestTimeToVisit: {
      type: String,
    },
    budgetRange: {
      type: String,
      // e.g. "₹5,000 – ₹20,000 per day"
    },
    activities: [
      {
        type: String,
        // e.g. ['Beach', 'Water Sports', 'Nightlife']
      },
    ],
    images: [
      {
        type: String,
        // Cloudinary URLs
      },
    ],
    featured: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'approved', 'rejected'],
        message: 'Status must be pending, approved, or rejected',
      },
      default: 'approved',
    },
    submittedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// ─── Indexes ─────────────────────────────────────────────────────────────────
// Text index: powers ?search=goa on GET /destinations
// Case-insensitive text search by default
DestinationSchema.index({ name: 'text', activities: 'text' });

// Country: for filtering by country (future international expansion)
DestinationSchema.index({ country: 1 });

// Featured: for quick homepage "featured destinations" query
DestinationSchema.index({ featured: 1 });

// Status: for filtering approved destinations
DestinationSchema.index({ status: 1 });

// SubmittedBy: query destinations contributed by a guide
DestinationSchema.index({ submittedBy: 1 });

export default mongoose.model<IDestination>('Destination', DestinationSchema);
