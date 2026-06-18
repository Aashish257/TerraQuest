/**
 * User.ts — User Mongoose model
 *
 * Stores all platform users: Travelers, Guides, and Admins.
 *
 * Design decisions:
 * - Soft delete: isDeleted flag instead of hard delete (preserves data integrity
 *   for trip/review foreign keys)
 * - travelDNA: array of interest strings (e.g. ['adventure', 'food', 'culture'])
 *   — populated during onboarding quiz
 * - password: NOT returned by default (select: false) — must be explicitly
 *   selected when needed for login verification
 * - role enum: enforced at DB level AND at application level (Zod)
 */

import mongoose, { Schema, Document } from 'mongoose';

// TypeScript interface — describes the shape of a User document
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'traveler' | 'guide' | 'admin';
  avatar?: string;
  bio?: string;
  location?: string;
  travelDNA: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true, // stored as lowercase — prevents case-sensitivity issues
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // excluded from queries by default — security best practice
    },
    role: {
      type: String,
      enum: {
        values: ['traveler', 'guide', 'admin'],
        message: 'Role must be traveler, guide, or admin',
      },
      required: true,
      default: 'traveler',
    },
    avatar: {
      type: String, // Cloudinary URL stored here
    },
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
    },
    location: {
      type: String,
    },
    travelDNA: [
      {
        type: String,
        // Examples: 'adventure', 'food', 'culture', 'nature', 'luxury', 'budget'
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    // timestamps: true automatically adds createdAt and updatedAt fields
    // and updates updatedAt on every save
    timestamps: true,
  }
);

// ─── Indexes ────────────────────────────────────────────────────────────────
// Note: email unique index is already created by `unique: true` in the field definition
// Role: for filtering guides or travelers
UserSchema.index({ role: 1 });
// CreatedAt: for sorting newest users
UserSchema.index({ createdAt: -1 });



export default mongoose.model<IUser>('User', UserSchema);
