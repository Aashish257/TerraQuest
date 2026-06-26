// This file handles direct database queries and data access operations for destination repository.
import { BaseRepository } from './BaseRepository';
import Destination, { IDestination } from '../models/Destination';
import { FilterQuery } from 'mongoose';

export class DestinationRepository extends BaseRepository<IDestination> {
  constructor() {
    super(Destination);
  }

  async findWithPagination(
    filter: FilterQuery<IDestination>,
    skip: number,
    limit: number
  ): Promise<IDestination[]> {
    return this.model.find(filter).skip(skip).limit(limit);
  }

  async count(filter: FilterQuery<IDestination>): Promise<number> {
    return this.model.countDocuments(filter);
  }
}

export const destinationRepository = new DestinationRepository();
