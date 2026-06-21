import mongoose, { Schema, Document } from 'mongoose';

export interface IExperience extends Document {
  name: string;
  destinationId: mongoose.Types.ObjectId;
  guideId: mongoose.Types.ObjectId;
  duration: string;
  description: string;
  highlights: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ExperienceSchema = new Schema<IExperience>(
  {
    name: {
      type: String,
      required: [true, 'Experience name is required'],
      trim: true,
      minlength: [3, 'Experience name must be at least 3 characters'],
    },
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
    duration: {
      type: String,
      required: [true, 'Duration is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      minlength: [20, 'Description must be at least 20 characters'],
    },
    highlights: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes
ExperienceSchema.index({ guideId: 1 });
ExperienceSchema.index({ destinationId: 1 });

export default mongoose.model<IExperience>('Experience', ExperienceSchema);
