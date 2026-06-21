import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as userService from '../services/user.service';
import { AppError } from '../middleware/errorHandler';

export const getMe = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Unauthenticated', 401);
    }

    const user = await userService.getMe(req.user._id);

    res.status(200).json({
      success: true,
      user,
    });
  } catch (err) {
    next(err);
  }
};

export const updateMe = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Unauthenticated', 401);
    }

    const user = await userService.updateMe(req.user._id, req.body);

    res.status(200).json({
      success: true,
      user,
    });
  } catch (err) {
    next(err);
  }
};

export const getUserById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const publicProfile = await userService.getUserById(req.params.id);

    res.status(200).json({
      success: true,
      user: publicProfile,
    });
  } catch (err) {
    next(err);
  }
};
