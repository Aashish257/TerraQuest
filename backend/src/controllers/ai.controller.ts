// This file handles the HTTP requests and responses for ai controller features.
import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as aiPlanService from '../services/aiPlan.service';
import { AppError } from '../middleware/errorHandler';

export const generatePlan = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) throw new AppError('Unauthenticated', 401);

    const result = await aiPlanService.generateAndSavePlan(req.user._id, req.body);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (err) {
    next(err);
  }
};

export const getMyPlans = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) throw new AppError('Unauthenticated', 401);

    const plans = await aiPlanService.getMyPlans(req.user._id);

    res.status(200).json({
      success: true,
      count: plans.length,
      plans,
    });
  } catch (err) {
    next(err);
  }
};

export const getPlanById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) throw new AppError('Unauthenticated', 401);

    const plan = await aiPlanService.getPlanById(req.params.id, req.user._id);

    res.status(200).json({
      success: true,
      plan,
    });
  } catch (err) {
    next(err);
  }
};
