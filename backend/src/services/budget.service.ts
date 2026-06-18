/**
 * budget.service.ts — Budget analytics aggregation service
 *
 * Implements logic to calculate actual expenses, remaining balances,
 * and category breakdown summaries for a specific trip.
 */

import mongoose from 'mongoose';
import BudgetEntry from '../models/BudgetEntry';

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

export const calculateBudgetSummary = async (
  tripId: string | mongoose.Types.ObjectId,
  plannedBudget: number
): Promise<BudgetSummary> => {
  const objTripId = new mongoose.Types.ObjectId(tripId);

  // Group by category and sum amounts
  const result = await BudgetEntry.aggregate([
    { $match: { tripId: objTripId } },
    {
      $group: {
        _id: '$category',
        total: { $sum: '$amount' },
      },
    },
  ]);

  // Construct standard category breakdown mapping
  const breakdown = {
    Food: 0,
    Stay: 0,
    Transport: 0,
    Activities: 0,
    Other: 0,
  };

  let spent = 0;
  result.forEach((item) => {
    const category = item._id as keyof typeof breakdown;
    if (category in breakdown) {
      breakdown[category] = Math.round(item.total * 100) / 100; // round to cents
      spent += item.total;
    }
  });

  spent = Math.round(spent * 100) / 100;
  const remaining = Math.round((plannedBudget - spent) * 100) / 100;

  return {
    totalBudget: plannedBudget,
    spent,
    remaining,
    breakdown,
  };
};
