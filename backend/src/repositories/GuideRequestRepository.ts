import { BaseRepository } from './BaseRepository';
import GuideRequest, { IGuideRequest } from '../models/GuideRequest';

export class GuideRequestRepository extends BaseRepository<IGuideRequest> {
  constructor() {
    super(GuideRequest);
  }

  async findRequestsForGuide(guideId: string | any): Promise<IGuideRequest[]> {
    return this.model.find({ guideId })
      .populate('travelerId', 'name email avatar')
      .populate({
        path: 'tripId',
        select: 'title startDate endDate budget destinationId',
        populate: {
          path: 'destinationId',
          select: 'name country state',
        },
      })
      .sort({ createdAt: -1 });
  }

  async findAllRequests(): Promise<IGuideRequest[]> {
    return this.model.find({})
      .populate('travelerId', 'name email avatar')
      .populate({
        path: 'guideId',
        populate: {
          path: 'userId',
          select: 'name email',
        },
      })
      .populate({
        path: 'tripId',
        select: 'title startDate endDate budget destinationId',
        populate: {
          path: 'destinationId',
          select: 'name country state',
        },
      })
      .sort({ createdAt: -1 });
  }

  async findRequestsForTraveler(travelerId: string | any): Promise<IGuideRequest[]> {
    return this.model.find({ travelerId })
      .populate({
        path: 'guideId',
        populate: {
          path: 'userId',
          select: 'name email avatar',
        },
      })
      .populate('tripId', 'title startDate endDate')
      .sort({ createdAt: -1 });
  }
}

export const guideRequestRepository = new GuideRequestRepository();
