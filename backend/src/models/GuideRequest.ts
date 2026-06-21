import mongoose, { Schema, Document } from 'mongoose';

export interface IGuideRequest extends Document {
  travelerId: mongoose.Types.ObjectId;
  guideId: mongoose.Types.ObjectId;
  tripId: mongoose.Types.ObjectId;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

const GuideRequestSchema = new Schema<IGuideRequest>(
  {
    travelerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'travelerId is required'],
    },
    guideId: {
      type: Schema.Types.ObjectId,
      ref: 'GuideProfile',
      required: [true, 'guideId is required'],
    },
    tripId: {
      type: Schema.Types.ObjectId,
      ref: 'Trip',
      required: [true, 'tripId is required'],
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      maxlength: [500, 'Message cannot exceed 500 characters'],
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'accepted', 'rejected'],
        message: 'Status must be pending, accepted, or rejected',
      },
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
GuideRequestSchema.index({ travelerId: 1 });
GuideRequestSchema.index({ guideId: 1 });
GuideRequestSchema.index({ tripId: 1 });
// Compound index to prevent duplicate pending requests for the same trip and guide
GuideRequestSchema.index({ tripId: 1, guideId: 1, status: 1 });

export default mongoose.model<IGuideRequest>('GuideRequest', GuideRequestSchema);
