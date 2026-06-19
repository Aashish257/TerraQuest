/**
 * rating.service.ts — Recalculates average ratings and total reviews for guides.
 *
 * This runs on any review create, update, or delete where targetType === 'guide'.
 */

import mongoose from 'mongoose';
import Review from '../models/Review';
import GuideProfile from '../models/GuideProfile';

export const recalculateGuideRating = async (guideId: string | mongoose.Types.ObjectId) => {
  const result = await Review.aggregate([
    {
      $match: {
        targetId: new mongoose.Types.ObjectId(guideId),
        targetType: 'guide',
      },
    },
    {
      $group: {
        _id: '$targetId',
        avgRating: { $avg: '$rating' },
        count: { $sum: 1 },
      },
    },
  ]);

  const avgRating = result[0]?.avgRating ?? 0;
  const count = result[0]?.count ?? 0;

  await GuideProfile.findOneAndUpdate(
    { userId: new mongoose.Types.ObjectId(guideId) },
    {
      rating: Math.round(avgRating * 10) / 10,
      totalReviews: count,
    }
  );
};
