// This file defines the database structure and schema for trip records.
/**
 * Trip.ts — Trip Mongoose model
 *
 * Represents a travel plan created by a user (solo or group).
 *
 * Design decisions:
 * - isDeleted: soft delete — trips have budget entries linked to them;
 *   hard deleting would orphan BudgetEntry records
 * - Pre-save hook: validates endDate > startDate at the DB layer
 *   (Zod validates at request layer too — defence in depth)
 * - status enum: tracks trip lifecycle for UI display
 * - budget: total planned budget — actual spent is calculated from BudgetEntry
 */

import mongoose, { Schema, Document } from 'mongoose';

export interface ITrip extends Document {
  ownerId: mongoose.Types.ObjectId;
  destinationId: mongoose.Types.ObjectId;
  title: string;
  tripType: 'solo' | 'group';
  startDate: Date;
  endDate: Date;
  budget: number;
  totalSpent: number;
  guideId?: mongoose.Types.ObjectId;
  status: 'planning' | 'ongoing' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const TripSchema = new Schema<ITrip>(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'ownerId is required'],
    },
    destinationId: {
      type: Schema.Types.ObjectId,
      ref: 'Destination',
      required: [true, 'destinationId is required'],
    },
    title: {
      type: String,
      required: [true, 'Trip title is required'],
      trim: true,
      minlength: [2, 'Title must be at least 2 characters'],
    },
    tripType: {
      type: String,
      enum: {
        values: ['solo', 'group'],
        message: 'tripType must be solo or group',
      },
      required: [true, 'tripType is required'],
    },
    startDate: {
      type: Date,
      required: [true, 'startDate is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'endDate is required'],
    },
    budget: {
      type: Number,
      required: [true, 'budget is required'],
      min: [0, 'Budget cannot be negative'],
    },
    totalSpent: {
      type: Number,
      default: 0,
      min: [0, 'Total spent cannot be negative'],
    },
    guideId: {
      type: Schema.Types.ObjectId,
      ref: 'GuideProfile',
    },
    status: {
      type: String,
      enum: {
        values: ['planning', 'ongoing', 'completed', 'cancelled'],
        message: 'Invalid trip status',
      },
      default: 'planning',
    },
  },
  { timestamps: true }
);

// ─── Pre-save Hook ────────────────────────────────────────────────────────────
// Validate that end date is after start date
// This runs BEFORE the document is saved to the database
TripSchema.pre('save', function (next) {
  if (this.endDate <= this.startDate) {
    return next(new Error('endDate must be after startDate'));
  }
  next();
});

// ─── Indexes ─────────────────────────────────────────────────────────────────
TripSchema.index({ ownerId: 1 });       // fetch all trips by a user
TripSchema.index({ destinationId: 1 }); // fetch all trips to a destination
TripSchema.index({ tripType: 1 });      // filter solo vs group trips
TripSchema.index({ guideId: 1 });       // query trips assigned to a guide



export default mongoose.model<ITrip>('Trip', TripSchema);
