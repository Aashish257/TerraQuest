// This file defines the database structure and schema for a i plan records.
/**
 * AIPlan.ts — AI-Generated Travel Plan Mongoose model
 *
 * Stores the result of an OpenAI itinerary generation request.
 * Each plan is tied to a user + destination + generation parameters.
 *
 * Design decisions:
 * - generatedPlan stored as String (Markdown text from GPT response)
 *   The frontend renders it with a Markdown renderer
 * - Keeping the full prompt parameters (budget, duration, interests) allows
 *   the user to "regenerate" with tweaked parameters
 * - No soft delete — plans are personal records, users can view their history
 * - createdAt descending index for "my plans" list (newest first)
 */

import mongoose, { Schema, Document } from 'mongoose';

export interface IAIPlan extends Document {
  userId: mongoose.Types.ObjectId;
  destinationId: mongoose.Types.ObjectId;
  budget: number;
  duration: number; // number of days
  interests: string[];
  generatedPlan: string; // Markdown formatted itinerary from OpenAI
  createdAt: Date;
}

const AIPlanSchema = new Schema<IAIPlan>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'userId is required'],
    },
    destinationId: {
      type: Schema.Types.ObjectId,
      ref: 'Destination',
      required: [true, 'destinationId is required'],
    },
    budget: {
      type: Number,
      required: [true, 'budget is required'],
      min: [0, 'Budget cannot be negative'],
    },
    duration: {
      type: Number,
      required: [true, 'duration is required'],
      min: [1, 'Duration must be at least 1 day'],
      max: [30, 'Duration cannot exceed 30 days'],
    },
    interests: [
      {
        type: String,
        // e.g. ['adventure', 'food', 'culture']
      },
    ],
    generatedPlan: {
      type: String,
      required: [true, 'generatedPlan is required'],
      // This is the full Markdown text returned by OpenAI
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// ─── Indexes ─────────────────────────────────────────────────────────────────
AIPlanSchema.index({ userId: 1 });           // fetch all plans by a user
AIPlanSchema.index({ destinationId: 1 });    // fetch all plans for a destination
AIPlanSchema.index({ createdAt: -1 });       // sort newest plans first

export default mongoose.model<IAIPlan>('AIPlan', AIPlanSchema);
