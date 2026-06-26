// This file contains the main business logic and backend processes for hidden place service.
import { hiddenPlaceRepository } from '../repositories/HiddenPlaceRepository';
import { guideRepository } from '../repositories/GuideRepository';
import { destinationRepository } from '../repositories/DestinationRepository';
import { AppError } from '../middleware/errorHandler';

export const createHiddenPlace = async (userId: string, data: any) => {
  // Find or auto-create the GuideProfile for DB-promoted guides
  let guide = await guideRepository.findByUserId(userId);
  if (!guide) {
    guide = await guideRepository.create({ userId, experience: 0, languages: [], expertise: [], location: '', bio: '' });
  }

  const { destinationId, title, description, category, images } = data;

  // 2. Verify destination exists
  const destination = await destinationRepository.findById(destinationId);
  if (!destination) {
    throw new AppError('Destination not found', 404);
  }

  // 3. Create the hidden place
  return hiddenPlaceRepository.create({
    destinationId,
    guideId: guide._id,
    title,
    description,
    category,
    images: images || [],
  });
};

export const getHiddenPlacesByDestination = async (destinationId: string) => {
  return hiddenPlaceRepository.findByDestinationId(destinationId);
};

export const getHiddenPlacesByGuide = async (userId: string) => {
  let guide = await guideRepository.findByUserId(userId);
  if (!guide) {
    guide = await guideRepository.create({ userId, experience: 0, languages: [], expertise: [], location: '', bio: '' });
  }
  return hiddenPlaceRepository.findByGuideId(guide._id);
};
