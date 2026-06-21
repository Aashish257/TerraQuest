import { BaseRepository } from './BaseRepository';
import TripMember, { ITripMember } from '../models/TripMember';

export class TripMemberRepository extends BaseRepository<ITripMember> {
  constructor() {
    super(TripMember);
  }

  async findMembershipsByUserId(userId: string): Promise<ITripMember[]> {
    return this.find({ userId });
  }

  async findTripParticipants(tripId: string): Promise<ITripMember[]> {
    return this.model.find({ tripId })
      .populate('userId', 'name email avatar role');
  }

  async findParticipant(tripId: string, userId: string): Promise<ITripMember | null> {
    return this.findOne({ tripId, userId });
  }
}

export const tripMemberRepository = new TripMemberRepository();
