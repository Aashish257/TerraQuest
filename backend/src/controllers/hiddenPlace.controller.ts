import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as hiddenPlaceService from '../services/hiddenPlace.service';
import { AppError } from '../middleware/errorHandler';

export const createHiddenPlace = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) throw new AppError('Unauthenticated', 401);

    const hiddenPlace = await hiddenPlaceService.createHiddenPlace(req.user._id, req.body);

    res.status(201).json({
      success: true,
      hiddenPlace,
    });
  } catch (err) {
    next(err);
  }
};

export const getMyHiddenPlaces = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) throw new AppError('Unauthenticated', 401);

    const hiddenPlaces = await hiddenPlaceService.getHiddenPlacesByGuide(req.user._id);

    res.status(200).json({
      success: true,
      count: hiddenPlaces.length,
      hiddenPlaces,
    });
  } catch (err) {
    next(err);
  }
};
