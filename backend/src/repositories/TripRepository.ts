// This file handles direct database queries and data access operations for trip repository.
import { BaseRepository } from './BaseRepository';
import Trip, { ITrip } from '../models/Trip';

export class TripRepository extends BaseRepository<ITrip> {
  constructor() {
    super(Trip);
  }

  async findTripsByIds(tripIds: any[]): Promise<ITrip[]> {
    return this.model.find({ _id: { $in: tripIds } })
      .populate('destinationId', 'name country state')
      .sort({ startDate: 1 });
  }

  async findTripWithDestination(tripId: string): Promise<ITrip | null> {
    return this.model.findById(tripId)
      .populate('destinationId', 'name country state');
  }
}

export const tripRepository = new TripRepository();
