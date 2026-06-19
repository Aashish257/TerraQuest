/**
 * review.controller.ts — Review controller
 *
 * Implements endpoints for:
 * - GET /api/reviews (fetch reviews by targetId and targetType)
 * - POST /api/reviews (create a review, recalculate guide ratings if applicable)
 */

import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import Review from '../models/Review';
import Destination from '../models/Destination';
import GuideProfile from '../models/GuideProfile';
import { recalculateGuideRating } from '../services/rating.service';
import { AppError } from '../middleware/errorHandler';

export const getReviews = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { targetId, targetType } = req.query;

    if (!targetId || !targetType) {
      throw new AppError('targetId and targetType are required query parameters', 400);
    }

    if (targetType !== 'destination' && targetType !== 'guide') {
      throw new AppError('targetType must be destination or guide', 400);
    }

    const reviews = await Review.find({ targetId, targetType })
      .populate('userId', 'name avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (err) {
    next(err);
  }
};

export const createReview = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { targetId, targetType, rating, comment } = req.body;

    // 1. Verify target exists
    if (targetType === 'destination') {
      const destination = await Destination.findById(targetId);
      if (!destination) {
        throw new AppError('Destination not found', 404);
      }
    } else if (targetType === 'guide') {
      const guideProfile = await GuideProfile.findOne({ userId: targetId });
      if (!guideProfile) {
        throw new AppError('Guide profile not found', 404);
      }
    } else {
      throw new AppError('Invalid targetType', 400);
    }

    // 2. Create the review
    const review = await Review.create({
      userId: req.user!._id,
      targetId,
      targetType,
      rating,
      comment,
    });

    // 3. Recalculate guide rating if applicable
    if (targetType === 'guide') {
      await recalculateGuideRating(targetId);
    }

    res.status(201).json({
      success: true,
      data: review,
    });
  } catch (err) {
    next(err);
  }
};
