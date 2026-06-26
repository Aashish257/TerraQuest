// This file defines the database structure and schema for trip member records.
/**
 * TripMember.ts — Trip Member Mongoose model
 *
 * Junction table for the many-to-many relationship: Trip ↔ User.
 * Used only for GROUP trips. Solo trips don't need members.
 *
 * Design decisions:
 * - Compound unique index { tripId, userId } — one user can only be
 *   in a trip once (prevents duplicate invites)
 * - role: 'owner' | 'member' — the trip creator gets 'owner',
 *   invited users get 'member'. Owner-only actions (delete trip, remove members)
 *   are checked against this role
 * - joinedAt: default Date.now — tracks when someone accepted an invite
 * - No timestamps option — joinedAt serves the same purpose
 */

import mongoose, { Schema, Document } from 'mongoose';

export interface ITripMember extends Document {
  tripId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  role: 'owner' | 'member';
  joinedAt: Date;
}

const TripMemberSchema = new Schema<ITripMember>({
  tripId: {
    type: Schema.Types.ObjectId,
    ref: 'Trip',
    required: [true, 'tripId is required'],
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'userId is required'],
  },
  role: {
    type: String,
    enum: {
      values: ['owner', 'member'],
      message: 'Role must be owner or member',
    },
    default: 'member',
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
});

// ─── Indexes ─────────────────────────────────────────────────────────────────
// Compound unique: prevents duplicate membership
TripMemberSchema.index({ tripId: 1, userId: 1 }, { unique: true });
// For fetching all members of a trip
TripMemberSchema.index({ tripId: 1 });
// For fetching all trips a user is part of
TripMemberSchema.index({ userId: 1 });

export default mongoose.model<ITripMember>('TripMember', TripMemberSchema);
