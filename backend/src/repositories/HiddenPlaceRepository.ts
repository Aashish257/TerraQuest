// This file handles direct database queries and data access operations for hidden place repository.
import { BaseRepository } from './BaseRepository';
import HiddenPlace, { IHiddenPlace } from '../models/HiddenPlace';

export class HiddenPlaceRepository extends BaseRepository<IHiddenPlace> {
  constructor() {
    super(HiddenPlace);
  }

  async findByGuideId(guideId: string | any): Promise<IHiddenPlace[]> {
    return this.model.find({ guideId }).populate('destinationId', 'name country state');
  }

  async findByDestinationId(destinationId: string | any): Promise<IHiddenPlace[]> {
    return this.model.find({ destinationId })
      .populate({
        path: 'guideId',
        populate: {
          path: 'userId',
          select: 'name avatar',
        },
      });
  }
}

export const hiddenPlaceRepository = new HiddenPlaceRepository();
