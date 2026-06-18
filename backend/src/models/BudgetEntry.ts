/**
 * BudgetEntry.ts — Budget Entry Mongoose model
 *
 * Individual expense records linked to a trip.
 * Budget tracking = Trip.budget (planned) minus sum of BudgetEntries (actual spent).
 *
 * Design decisions:
 * - category enum: fixed categories make it easy to build a pie chart breakdown
 *   in the frontend without free-form text parsing
 * - amount min: 0.01 — prevents zero-amount entries that add clutter
 * - No soft delete here: budget entries are atomic records.
 *   Users can hard-delete entries they added by mistake
 * - updatedAt disabled — entries are immutable (delete and re-add if wrong)
 */

import mongoose, { Schema, Document } from 'mongoose';

export type BudgetCategory = 'Food' | 'Stay' | 'Transport' | 'Activities' | 'Other';

export interface IBudgetEntry extends Document {
  tripId: mongoose.Types.ObjectId;
  category: BudgetCategory;
  amount: number;
  description?: string;
  createdAt: Date;
}

const BudgetEntrySchema = new Schema<IBudgetEntry>(
  {
    tripId: {
      type: Schema.Types.ObjectId,
      ref: 'Trip',
      required: [true, 'tripId is required'],
    },
    category: {
      type: String,
      enum: {
        values: ['Food', 'Stay', 'Transport', 'Activities', 'Other'],
        message: 'Invalid budget category',
      },
      required: [true, 'category is required'],
    },
    amount: {
      type: Number,
      required: [true, 'amount is required'],
      min: [0.01, 'Amount must be greater than 0'],
    },
    description: {
      type: String,
      maxlength: [200, 'Description cannot exceed 200 characters'],
    },
  },
  {
    // Only track when entry was created — no updates allowed
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// ─── Indexes ─────────────────────────────────────────────────────────────────
BudgetEntrySchema.index({ tripId: 1 });    // fetch all entries for a trip
BudgetEntrySchema.index({ category: 1 }); // group by category for summary

export default mongoose.model<IBudgetEntry>('BudgetEntry', BudgetEntrySchema);
