/**
 * HiddenPlace.ts — Hidden Place Mongoose model
 *
 * Guide-submitted secret spots tied to a destination.
 * Only guides can submit hidden places (enforced at route level).
 *
 * Design decisions:
 * - isDeleted: soft delete — guides can "remove" their submission without
 *   losing the DB record (helpful for moderation audit trails)
 * - guideId references GuideProfile (not User) — keeps the data model clean
 * - description minlength 20: enforces meaningful content, not "nice place"
 */

import mongoose, { Schema, Document } from 'mongoose';

export interface IHiddenPlace extends Document {
  destinationId: mongoose.Types.ObjectId;
  guideId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  category?: string;
  images: string[];
  createdAt: Date;
}

const HiddenPlaceSchema = new Schema<IHiddenPlace>(
  {
    destinationId: {
      type: Schema.Types.ObjectId,
      ref: 'Destination',
      required: [true, 'destinationId is required'],
    },
    guideId: {
      type: Schema.Types.ObjectId,
      ref: 'GuideProfile',
      required: [true, 'guideId is required'],
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      minlength: [20, 'Description must be at least 20 characters'],
    },
    category: {
      type: String,
      // e.g. 'Waterfall', 'Viewpoint', 'Cafe', 'Temple', 'Beach'
    },
    images: [{ type: String }],
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// ─── Indexes ─────────────────────────────────────────────────────────────────
HiddenPlaceSchema.index({ destinationId: 1 }); // fetch all hidden places for a destination
HiddenPlaceSchema.index({ guideId: 1 });        // fetch all places submitted by a guide
HiddenPlaceSchema.index({ category: 1 });       // filter by category



export default mongoose.model<IHiddenPlace>('HiddenPlace', HiddenPlaceSchema);
