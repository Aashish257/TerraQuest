// This file contains the main business logic and backend processes for review service.
import { reviewRepository } from '../repositories/ReviewRepository';
import { destinationRepository } from '../repositories/DestinationRepository';
import { guideRepository } from '../repositories/GuideRepository';
import { recalculateGuideRating } from './rating.service';
import { AppError } from '../middleware/errorHandler';

export const getReviews = async (targetId: string, targetType: string) => {
  if (targetType !== 'destination' && targetType !== 'guide') {
    throw new AppError('targetType must be destination or guide', 400);
  }
  return reviewRepository.findByTarget(targetId, targetType);
};

export const createReview = async (userId: string, data: any) => {
  const { targetId, targetType, rating, comment } = data;

  if (targetType === 'destination') {
    const destination = await destinationRepository.findById(targetId);
    if (!destination) {
      throw new AppError('Destination not found', 404);
    }
  } else if (targetType === 'guide') {
    const guideProfile = await guideRepository.findByUserId(targetId);
    if (!guideProfile) {
      throw new AppError('Guide profile not found', 404);
    }
  } else {
    throw new AppError('Invalid targetType', 400);
  }

  const review = await reviewRepository.create({
    userId,
    targetId,
    targetType,
    rating,
    comment,
  });

  if (targetType === 'guide') {
    await recalculateGuideRating(targetId);
  }

  return review;
};
