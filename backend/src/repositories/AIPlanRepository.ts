// This file handles direct database queries and data access operations for a i plan repository.
import { BaseRepository } from './BaseRepository';
import AIPlan, { IAIPlan } from '../models/AIPlan';

export class AIPlanRepository extends BaseRepository<IAIPlan> {
  constructor() {
    super(AIPlan);
  }

  async findByUserId(userId: string): Promise<IAIPlan[]> {
    return this.model.find({ userId })
      .populate('destinationId', 'name country state')
      .sort({ createdAt: -1 });
  }

  async findByIdWithDestination(id: string): Promise<IAIPlan | null> {
    return this.model.findById(id)
      .populate('destinationId', 'name country state');
  }
}

export const aiPlanRepository = new AIPlanRepository();
