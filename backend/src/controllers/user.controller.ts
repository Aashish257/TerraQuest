// This file handles the HTTP requests and responses for user controller features.
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



export const getAllUsers = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const users = await userService.getAllUsers();
    res.status(200).json({
      success: true,
      users,
    });
  } catch (err) {
    next(err);
  }
};

export const updateUserStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Unauthenticated', 401);
    }
    const { isActive } = req.body;
    if (typeof isActive !== 'boolean') {
      throw new AppError('isActive must be a boolean value', 400);
    }

    const user = await userService.updateUserStatus(
      req.params.id,
      req.user._id,
      isActive
    );

    res.status(200).json({
      success: true,
      user,
    });
  } catch (err) {
    next(err);
  }
};

export const updateUserRole = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Unauthenticated', 401);
    }
    const { role } = req.body;
    if (role !== 'traveler' && role !== 'guide' && role !== 'admin') {
      throw new AppError('role must be traveler, guide, or admin', 400);
    }

    const user = await userService.updateUserRole(
      req.params.id,
      req.user._id,
      role
    );

    res.status(200).json({
      success: true,
      user,
    });
  } catch (err) {
    next(err);
  }
};

