// This file contains the main business logic and backend processes for budget service.
import mongoose from 'mongoose';
import { budgetRepository } from '../repositories/BudgetRepository';
import { tripRepository } from '../repositories/TripRepository';
import { tripMemberRepository } from '../repositories/TripMemberRepository';
import { AppError } from '../middleware/errorHandler';

interface BudgetSummary {
  totalBudget: number;
  spent: number;
  remaining: number;
  breakdown: {
    Food: number;
    Stay: number;
    Transport: number;
    Activities: number;
    Other: number;
  };
}

// Internal Helper: Ensure user is owner or member of the trip
export const verifyTripAccess = async (tripId: string, userId: string): Promise<any> => {
  const trip = await tripRepository.findById(tripId);
  if (!trip) {
    throw new AppError('Trip not found', 404);
  }

  const member = await tripMemberRepository.findParticipant(tripId, userId);
  if (!member) {
    throw new AppError('Access denied: You are not a participant in this trip', 403);
  }

  return trip;
};

export const addBudgetEntry = async (tripId: string, userId: string, data: any) => {
  await verifyTripAccess(tripId, userId);
  const { category, amount, description } = data;

  return budgetRepository.create({
    tripId,
    category,
    amount,
    description,
  });
};

export const getBudgetEntries = async (tripId: string, userId: string) => {
  await verifyTripAccess(tripId, userId);
  return budgetRepository.findByTripId(tripId);
};

export const deleteBudgetEntry = async (tripId: string, entryId: string, userId: string) => {
  await verifyTripAccess(tripId, userId);

  const entry = await budgetRepository.findOneAndDelete({ _id: entryId, tripId });
  if (!entry) {
    throw new AppError('Budget entry not found', 404);
  }
  return entry;
};

export const calculateBudgetSummary = async (
  tripId: string | mongoose.Types.ObjectId,
  plannedBudget: number,
  cachedSpent?: number
): Promise<BudgetSummary> => {
  const objTripId = new mongoose.Types.ObjectId(tripId);

  // Group by category and sum amounts for breakdown chart representation
  const result = await budgetRepository.aggregate([
    { $match: { tripId: objTripId } },
    {
      $group: {
        _id: '$category',
        total: { $sum: '$amount' },
      },
    },
  ]);

  const breakdown = {
    Food: 0,
    Stay: 0,
    Transport: 0,
    Activities: 0,
    Other: 0,
  };

  let aggregatedSpent = 0;
  result.forEach((item) => {
    const category = item._id as keyof typeof breakdown;
    if (category in breakdown) {
      breakdown[category] = Math.round(item.total * 100) / 100;
      aggregatedSpent += item.total;
    }
  });

  // Use cachedSpent from trip if available, otherwise fallback to aggregation sum
  const spent = cachedSpent !== undefined ? cachedSpent : Math.round(aggregatedSpent * 100) / 100;
  const remaining = Math.round((plannedBudget - spent) * 100) / 100;

  return {
    totalBudget: plannedBudget,
    spent,
    remaining,
    breakdown,
  };
};

export const getBudgetSummary = async (tripId: string, userId: string) => {
  const trip = await verifyTripAccess(tripId, userId);
  return calculateBudgetSummary(trip._id, trip.budget, trip.totalSpent);
};
