/**
 * tests/unit/budget.service.test.ts — BudgetService Unit Tests
 */

import '../setup';
import mongoose from 'mongoose';
import * as budgetService from '../../src/services/budget.service';
import BudgetEntry from '../../src/models/BudgetEntry';

describe('BudgetService Unit Tests', () => {
  const tripId = new mongoose.Types.ObjectId();
  const plannedBudget = 20000;

  it('calculates budget summary correctly with multiple category entries', async () => {
    // Insert test entries
    await BudgetEntry.create([
      { tripId, category: 'Food', amount: 1200.5, description: 'Shack dinner' },
      { tripId, category: 'Stay', amount: 8500.0, description: 'Hotel stay' },
      { tripId, category: 'Transport', amount: 2300.75, description: 'Train tickets' },
      { tripId, category: 'Food', amount: 450.25, description: 'Lunch' },
      { tripId, category: 'Other', amount: 500.0, description: 'Souvenirs' },
    ]);

    const summary = await budgetService.calculateBudgetSummary(tripId, plannedBudget);

    expect(summary.totalBudget).toBe(plannedBudget);
    
    // Spent = 1200.5 + 8500.0 + 2300.75 + 450.25 + 500.0 = 12951.5
    expect(summary.spent).toBe(12951.5);
    
    // Remaining = 20000 - 12951.5 = 7048.5
    expect(summary.remaining).toBe(7048.5);

    // Breakdowns
    expect(summary.breakdown.Food).toBe(1650.75); // 1200.5 + 450.25
    expect(summary.breakdown.Stay).toBe(8500.0);
    expect(summary.breakdown.Transport).toBe(2300.75);
    expect(summary.breakdown.Activities).toBe(0);
    expect(summary.breakdown.Other).toBe(500.0);
  });

  it('returns planned budget and zero expenses if no budget entries exist', async () => {
    const summary = await budgetService.calculateBudgetSummary(tripId, plannedBudget);

    expect(summary.totalBudget).toBe(plannedBudget);
    expect(summary.spent).toBe(0);
    expect(summary.remaining).toBe(plannedBudget);
    expect(summary.breakdown).toEqual({
      Food: 0,
      Stay: 0,
      Transport: 0,
      Activities: 0,
      Other: 0,
    });
  });
});
