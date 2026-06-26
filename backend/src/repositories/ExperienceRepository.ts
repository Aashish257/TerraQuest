// This file handles direct database queries and data access operations for experience repository.
import { BaseRepository } from './BaseRepository';
import Experience, { IExperience } from '../models/Experience';

export class ExperienceRepository extends BaseRepository<IExperience> {
  constructor() {
    super(Experience);
  }

  async findByGuideId(guideId: string | any): Promise<IExperience[]> {
    return this.model.find({ guideId }).populate('destinationId', 'name country state');
  }

  async findByDestinationId(destinationId: string | any): Promise<IExperience[]> {
    return this.model.find({ destinationId }).populate('guideId');
  }
}

export const experienceRepository = new ExperienceRepository();
