/**
 * user.controller.ts — User controller
 *
 * Handles HTTP requests for:
 * - GET /api/users/me (get own profile)
 * - PUT /api/users/me (update own profile)
 * - GET /api/users/:id (get public profile by ID)
 */

import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import User from '../models/User';
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

    const user = await User.findById(req.user._id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

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

    const { name, bio, location } = req.body;

    // Use findByIdAndUpdate to apply modifications
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { name, bio, location } },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      throw new AppError('User not found', 404);
    }

    res.status(200).json({
      success: true,
      user: updatedUser,
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
    const user = await User.findById(req.params.id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Standardize public profile details returned to external users
    const publicProfile = {
      _id: user._id.toString(),
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      bio: user.bio,
      location: user.location,
      travelDNA: user.travelDNA,
      createdAt: user.createdAt,
    };

    res.status(200).json({
      success: true,
      user: publicProfile,
    });
  } catch (err) {
    next(err);
  }
};
