/**
 * budget.controller.ts — Budget entry controller
 *
 * Handles nested routes for managing trip expenses:
 * - POST /api/trips/:tripId/budget-entries (add expense)
 * - GET /api/trips/:tripId/budget-entries (list expenses)
 * - DELETE /api/trips/:tripId/budget-entries/:entryId (remove expense)
 * - GET /api/trips/:tripId/budget-summary (retrieve calculations breakdown)
 *
 * Verifies that the user is an active participant (owner or member) of the trip.
 */

import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import BudgetEntry from '../models/BudgetEntry';
import Trip from '../models/Trip';
import TripMember from '../models/TripMember';
import * as budgetService from '../services/budget.service';
import { AppError } from '../middleware/errorHandler';

// Helper: Ensure the requesting user has access to the trip (is owner or member)
const verifyTripAccess = async (tripId: string, userId: string): Promise<any> => {
  const trip = await Trip.findById(tripId);
  if (!trip) {
    throw new AppError('Trip not found', 404);
  }

  const member = await TripMember.findOne({ tripId, userId });
  if (!member) {
    throw new AppError('Access denied: You are not a participant in this trip', 403);
  }

  return trip;
};

export const addBudgetEntry = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) throw new AppError('Unauthenticated', 401);

    const { tripId } = req.params;
    const { category, amount, description } = req.body;

    // 1. Verify trip exists and user is owner/member
    await verifyTripAccess(tripId, req.user._id);

    // 2. Create entry
    const entry = await BudgetEntry.create({
      tripId,
      category,
      amount,
      description,
    });

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

    const { tripId } = req.params;

    // 1. Verify trip access
    await verifyTripAccess(tripId, req.user._id);

    // 2. Fetch all entries
    const entries = await BudgetEntry.find({ tripId }).sort({ createdAt: -1 });

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

    const { tripId, entryId } = req.params;

    // 1. Verify access to the trip
    await verifyTripAccess(tripId, req.user._id);

    // 2. Find and delete the entry
    const entry = await BudgetEntry.findOneAndDelete({ _id: entryId, tripId });
    if (!entry) {
      throw new AppError('Budget entry not found', 404);
    }

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

    const { tripId } = req.params;

    // 1. Verify access and get planned budget
    const trip = await verifyTripAccess(tripId, req.user._id);

    // 2. Calculate summary
    const summary = await budgetService.calculateBudgetSummary(trip._id, trip.budget);

    res.status(200).json({
      success: true,
      summary,
    });
  } catch (err) {
    next(err);
  }
};
