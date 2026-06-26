// This file contains the main business logic and backend processes for experience service.
import { experienceRepository } from '../repositories/ExperienceRepository';
import { guideRepository } from '../repositories/GuideRepository';
import { destinationRepository } from '../repositories/DestinationRepository';
import { AppError } from '../middleware/errorHandler';

export const createExperience = async (userId: string, data: any) => {
  // Find or auto-create the GuideProfile for DB-promoted guides
  let guide = await guideRepository.findByUserId(userId);
  if (!guide) {
    guide = await guideRepository.create({ userId, experience: 0, languages: [], expertise: [], location: '', bio: '' });
  }

  const { name, destinationId, duration, description, highlights } = data;

  // 2. Verify destination exists
  const destination = await destinationRepository.findById(destinationId);
  if (!destination) {
    throw new AppError('Destination not found', 404);
  }

  // 3. Create the experience
  return experienceRepository.create({
    name,
    destinationId,
    guideId: guide._id,
    duration,
    description,
    highlights: highlights || [],
  });
};

export const getExperiencesByGuideId = async (guideId: string) => {
  return experienceRepository.findByGuideId(guideId);
};

export const getExperiencesByGuideUser = async (userId: string) => {
  let guide = await guideRepository.findByUserId(userId);
  if (!guide) {
    guide = await guideRepository.create({ userId, experience: 0, languages: [], expertise: [], location: '', bio: '' });
  }
  return experienceRepository.findByGuideId(guide._id);
};
