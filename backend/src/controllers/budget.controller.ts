import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as budgetService from '../services/budget.service';
import { AppError } from '../middleware/errorHandler';

export const addBudgetEntry = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) throw new AppError('Unauthenticated', 401);

    const entry = await budgetService.addBudgetEntry(req.params.tripId, req.user._id, req.body);

    res.status(201).json({
      success: true,
      entry,
    });
  } catch (err) {
    next(err);
  }
};

export const getBudgetEntries = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) throw new AppError('Unauthenticated', 401);

    const entries = await budgetService.getBudgetEntries(req.params.tripId, req.user._id);

    res.status(200).json({
      success: true,
      count: entries.length,
      entries,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteBudgetEntry = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) throw new AppError('Unauthenticated', 401);

    await budgetService.deleteBudgetEntry(req.params.tripId, req.params.entryId, req.user._id);

    res.status(200).json({
      success: true,
      message: 'Budget entry deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};

export const getBudgetSummary = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) throw new AppError('Unauthenticated', 401);

    const summary = await budgetService.getBudgetSummary(req.params.tripId, req.user._id);

    res.status(200).json({
      success: true,
      summary,
    });
  } catch (err) {
    next(err);
  }
};
