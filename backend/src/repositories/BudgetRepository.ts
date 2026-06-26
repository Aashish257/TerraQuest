// This file handles direct database queries and data access operations for budget repository.
import { BaseRepository } from './BaseRepository';
import BudgetEntry, { IBudgetEntry } from '../models/BudgetEntry';

export class BudgetRepository extends BaseRepository<IBudgetEntry> {
  constructor() {
    super(BudgetEntry);
  }

  async findByTripId(tripId: string): Promise<IBudgetEntry[]> {
    return this.find({ tripId }, null, { sort: { createdAt: -1 } });
  }
}

export const budgetRepository = new BudgetRepository();
