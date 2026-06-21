import { tripRepository } from '../repositories/TripRepository';
import { tripMemberRepository } from '../repositories/TripMemberRepository';
import { userRepository } from '../repositories/UserRepository';
import { budgetRepository } from '../repositories/BudgetRepository';
import { AppError } from '../middleware/errorHandler';

export const createTrip = async (userId: string, data: any) => {
  const { destinationId, title, tripType, startDate, endDate, budget } = data;

  // 1. Create Trip
  const trip = await tripRepository.create({
    ownerId: userId,
    destinationId,
    title,
    tripType,
    startDate,
    endDate,
    budget,
  });

  // 2. Add owner as first member
  await tripMemberRepository.create({
    tripId: trip._id,
    userId,
    role: 'owner',
  });

  return trip;
};

export const getMyTrips = async (userId: string) => {
  const memberships = await tripMemberRepository.findMembershipsByUserId(userId);
  const tripIds = memberships.map((m) => m.tripId);
  return tripRepository.findTripsByIds(tripIds);
};

export const getTripById = async (tripId: string, userId: string) => {
  const trip = await tripRepository.findTripWithDestination(tripId);
  if (!trip) {
    throw new AppError('Trip not found', 404);
  }

  // Verify participant status
  const member = await tripMemberRepository.findParticipant(tripId, userId);
  if (!member) {
    throw new AppError('Access denied: You are not a member of this trip', 403);
  }

  let members: any[] = [];
  if (trip.tripType === 'group') {
    members = await tripMemberRepository.findTripParticipants(tripId);
  }

  return { trip, members };
};

export const updateTrip = async (tripId: string, userId: string, updateData: any) => {
  const trip = await tripRepository.findById(tripId);
  if (!trip) {
    throw new AppError('Trip not found', 404);
  }

  // Verify ownership
  if (trip.ownerId.toString() !== userId) {
    throw new AppError('Forbidden: Only the owner can modify this trip', 403);
  }

  const { title, startDate, endDate, budget, status } = updateData;

  trip.title = title ?? trip.title;
  trip.startDate = startDate ?? trip.startDate;
  trip.endDate = endDate ?? trip.endDate;
  trip.budget = budget !== undefined ? budget : trip.budget;
  trip.status = status ?? trip.status;

  await trip.save();
  return trip;
};

export const deleteTrip = async (tripId: string, userId: string) => {
  const trip = await tripRepository.findById(tripId);
  if (!trip) {
    throw new AppError('Trip not found', 404);
  }

  // Verify ownership
  if (trip.ownerId.toString() !== userId) {
    throw new AppError('Forbidden: Only the owner can delete this trip', 403);
  }

  // Cascade hard deletion
  await tripRepository.deleteById(trip._id);
  await tripMemberRepository.deleteMany({ tripId: trip._id });
  await budgetRepository.deleteMany({ tripId: trip._id });

  return { message: 'Trip and all associated resources deleted successfully' };
};

export const addMember = async (tripId: string, ownerId: string, inviteData: any) => {
  const trip = await tripRepository.findById(tripId);
  if (!trip) {
    throw new AppError('Trip not found', 404);
  }

  // Verify ownership
  if (trip.ownerId.toString() !== ownerId) {
    throw new AppError('Forbidden: Only the owner can manage members', 403);
  }

  // Prevent solo modifications
  if (trip.tripType === 'solo') {
    throw new AppError('Bad Request: Cannot invite members to a solo trip', 400);
  }

  const { userId, email } = inviteData;
  let targetUserId = userId;

  if (email) {
    const invitee = await userRepository.findByEmail(email);
    if (!invitee) {
      throw new AppError('User with this email not found', 404);
    }
    targetUserId = invitee._id.toString();
  }

  if (!targetUserId) {
    throw new AppError('User ID or Email is required', 400);
  }

  const existingMember = await tripMemberRepository.findParticipant(tripId, targetUserId);
  if (existingMember) {
    throw new AppError('User is already a member of this trip', 400);
  }

  return tripMemberRepository.create({
    tripId: trip._id,
    userId: targetUserId,
    role: 'member',
  });
};

export const removeMember = async (tripId: string, ownerId: string, targetUserId: string) => {
  const trip = await tripRepository.findById(tripId);
  if (!trip) {
    throw new AppError('Trip not found', 404);
  }

  // Verify ownership
  if (trip.ownerId.toString() !== ownerId) {
    throw new AppError('Forbidden: Only the owner can manage members', 403);
  }

  // Prevent removing owner
  if (trip.ownerId.toString() === targetUserId) {
    throw new AppError('Bad Request: Cannot remove the owner of the trip', 400);
  }

  const result = await tripMemberRepository.findOneAndDelete({ tripId, userId: targetUserId });
  if (!result) {
    throw new AppError('Member not found in this trip', 404);
  }

  return { message: 'Member removed from trip successfully' };
};
