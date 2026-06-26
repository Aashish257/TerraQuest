// This file handles the HTTP requests and responses for guide controller features.
import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as guideService from '../services/guide.service';
import { AppError } from '../middleware/errorHandler';

export const getGuides = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const filters = {
      location: req.query.location as string,
      rating: req.query.rating as string,
      page: req.query.page as string,
      limit: req.query.limit as string,
    };

    const result = await guideService.listGuides(filters);

    res.status(200).json({
      success: true,
      count: result.guides.length,
      pagination: result.pagination,
      guides: result.guides,
    });
  } catch (err) {
    next(err);
  }
};

export const getGuideById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const guide = await guideService.getGuideById(req.params.id);
    res.status(200).json({
      success: true,
      guide,
    });
  } catch (err) {
    next(err);
  }
};

export const createGuideProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) throw new AppError('Unauthenticated', 401);

    const profile = await guideService.createGuideProfile(req.user._id, req.body);

    res.status(201).json({
      success: true,
      data: profile,
    });
  } catch (err) {
    next(err);
  }
};

export const becomeGuide = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) throw new AppError('Unauthenticated', 401);

    const result = await guideService.becomeGuide(req.user._id, req.body);

    // Set the updated token cookie
    res.cookie('accessToken', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      success: true,
      ...result,
    });
  } catch (err) {
    next(err);
  }
};

export const updateMyProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) throw new AppError('Unauthenticated', 401);

    const result = await guideService.updateGuideProfileAndUser(req.user._id, req.body);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const updateGuideProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) throw new AppError('Unauthenticated', 401);

    const profile = await guideService.updateGuideProfile(req.params.id, req.user._id, req.body);

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (err) {
    next(err);
  }
};
