import { BaseRepository } from './BaseRepository';
import GuideProfile, { IGuideProfile } from '../models/GuideProfile';
import { FilterQuery } from 'mongoose';

export class GuideRepository extends BaseRepository<IGuideProfile> {
  constructor() {
    super(GuideProfile);
  }

  async findWithPagination(
    filter: FilterQuery<IGuideProfile>,
    skip: number,
    limit: number
  ): Promise<IGuideProfile[]> {
    return this.model.find(filter)
      .populate('userId', 'name email avatar bio')
      .skip(skip)
      .limit(limit)
      .sort({ rating: -1 });
  }

  async count(filter: FilterQuery<IGuideProfile>): Promise<number> {
    return this.model.countDocuments(filter);
  }

  async findByUserId(userId: string): Promise<IGuideProfile | null> {
    return this.model.findOne({ userId }).populate('userId', 'name email avatar bio');
  }

  async findByIdWithUser(id: string): Promise<IGuideProfile | null> {
    return this.model.findById(id).populate('userId', 'name email avatar bio');
  }
}

export const guideRepository = new GuideRepository();
