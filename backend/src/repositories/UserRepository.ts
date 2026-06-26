// This file handles direct database queries and data access operations for user repository.
import { BaseRepository } from './BaseRepository';
import User, { IUser } from '../models/User';

export class UserRepository extends BaseRepository<IUser> {
  constructor() {
    super(User);
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return this.findOne({ email });
  }

  async findByEmailWithPassword(email: string): Promise<IUser | null> {
    return this.model.findOne({ email }).select('+password');
  }
}

export const userRepository = new UserRepository();
