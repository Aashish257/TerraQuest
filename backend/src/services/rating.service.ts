import mongoose from 'mongoose';
import { reviewRepository } from '../repositories/ReviewRepository';
import { guideRepository } from '../repositories/GuideRepository';

export const recalculateGuideRating = async (guideId: string | mongoose.Types.ObjectId) => {
  const result = await reviewRepository.aggregate([
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

  await guideRepository.updateOne(
    { userId: new mongoose.Types.ObjectId(guideId) },
    {
      rating: Math.round(avgRating * 10) / 10,
      totalReviews: count,
    }
  );
};
