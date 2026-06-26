// This file contains the main business logic and backend processes for guide request service.
import { guideRequestRepository } from '../repositories/GuideRequestRepository';
import { guideRepository } from '../repositories/GuideRepository';
import { tripRepository } from '../repositories/TripRepository';
import { AppError } from '../middleware/errorHandler';

export const createGuideRequest = async (travelerId: string, data: any) => {
  const { guideId, tripId, message } = data;

  // 1. Verify trip exists and traveler is the owner of this trip
  const trip = await tripRepository.findById(tripId);
  if (!trip) {
    throw new AppError('Trip not found', 404);
  }

  if (trip.ownerId.toString() !== travelerId) {
    throw new AppError('Forbidden: You can only request a guide for your own trips', 403);
  }

  // 2. Verify guide profile exists
  const guide = await guideRepository.findById(guideId);
  if (!guide) {
    throw new AppError('Guide profile not found', 404);
  }

  // 3. Check for existing pending/accepted request for this trip and guide
  const existingRequests = await guideRequestRepository.find({
    tripId,
    guideId,
    status: { $in: ['pending', 'accepted'] },
  });
  if (existingRequests.length > 0) {
    throw new AppError('You already have an active request for this guide and trip', 400);
  }

  // 4. Create request
  return guideRequestRepository.create({
    travelerId,
    guideId,
    tripId,
    message,
    status: 'pending',
  });
};

export const getRequestsForGuide = async (userId: string) => {
  let guide = await guideRepository.findByUserId(userId);
  if (!guide) {
    guide = await guideRepository.create({ userId, experience: 0, languages: [], expertise: [], location: '', bio: '' });
  }
  return guideRequestRepository.findRequestsForGuide(guide._id);
};

export const respondToRequest = async (userId: string, requestId: string, responseStatus: 'accepted' | 'rejected') => {
  // 1. Find or auto-create guide profile
  let guide = await guideRepository.findByUserId(userId);
  if (!guide) {
    guide = await guideRepository.create({ userId, experience: 0, languages: [], expertise: [], location: '', bio: '' });
  }

  // 2. Find request
  const request = await guideRequestRepository.findById(requestId);
  if (!request) {
    throw new AppError('Guide request not found', 404);
  }

  // 3. Verify request is addressed to this guide
  if (request.guideId.toString() !== guide._id.toString()) {
    throw new AppError('Forbidden: This request is not addressed to you', 403);
  }

  // 4. Update request status
  request.status = responseStatus;
  await request.save();

  // 5. If accepted, associate the guide profile with the trip
  if (responseStatus === 'accepted') {
    const trip = await tripRepository.findById(request.tripId);
    if (trip) {
      trip.guideId = guide._id as any;
      await trip.save();
    }
  }

  return request;
};

export const getAllRequestsForAdmin = async () => {
  return guideRequestRepository.findAllRequests();
};
