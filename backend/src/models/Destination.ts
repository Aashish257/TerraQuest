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
  createdAt: Date;
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
  },
  {
    // Only track createdAt — destinations don't get updated often
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// ─── Indexes ─────────────────────────────────────────────────────────────────
// Text index: powers ?search=goa on GET /destinations
// MongoDB text search is case-insensitive by default
DestinationSchema.index({ name: 'text', activities: 'text' });

// Country: for filtering by country (future international expansion)
DestinationSchema.index({ country: 1 });

// Featured: for quick homepage "featured destinations" query
DestinationSchema.index({ featured: 1 });

export default mongoose.model<IDestination>('Destination', DestinationSchema);
