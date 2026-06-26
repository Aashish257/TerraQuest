// This file handles the HTTP requests and responses for review controller features.
import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as reviewService from '../services/review.service';
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

    const reviews = await reviewService.getReviews(targetId as string, targetType as string);

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
    if (!req.user) throw new AppError('Unauthenticated', 401);

    const review = await reviewService.createReview(req.user._id, req.body);

    res.status(201).json({
      success: true,
      data: review,
    });
  } catch (err) {
    next(err);
  }
};
