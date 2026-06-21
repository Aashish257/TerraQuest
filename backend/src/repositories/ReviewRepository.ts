import { BaseRepository } from './BaseRepository';
import Review, { IReview } from '../models/Review';

export class ReviewRepository extends BaseRepository<IReview> {
  constructor() {
    super(Review);
  }

  async findByTarget(targetId: string, targetType: string): Promise<IReview[]> {
    return this.model.find({ targetId, targetType })
      .populate('userId', 'name avatar')
      .sort({ createdAt: -1 });
  }
}

export const reviewRepository = new ReviewRepository();
