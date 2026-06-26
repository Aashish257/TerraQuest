// This file contains the main business logic and backend processes for destination service.
import { destinationRepository } from '../repositories/DestinationRepository';
import { AppError } from '../middleware/errorHandler';

const getMinBudget = (range: string): number => {
  const cleanRange = range.replace(/,/g, '');
  const match = cleanRange.match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
};

export const listDestinations = async (filters: {
  search?: string;
  activity?: string;
  budget?: string;
  page?: string;
  limit?: string;
  status?: string;
}) => {
  const { search, activity, budget, page = '1', limit = '10', status = 'approved' } = filters;
  const query: any = {};

  if (status && status !== 'all') {
    query.status = status;
  }

  if (search) {
    query.$text = { $search: search };
  }

  if (activity) {
    query.activities = { $regex: new RegExp(activity, 'i') };
  }

  let destinations = await destinationRepository.find(query);

  if (budget) {
    destinations = destinations.filter((dest) => {
      const minBudget = getMinBudget(dest.budgetRange || '');
      if (budget === 'low') {
        return minBudget < 2500;
      } else if (budget === 'medium') {
        return minBudget >= 2500 && minBudget < 4000;
      } else if (budget === 'high') {
        return minBudget >= 4000;
      }
      return true;
    });
  }

  const pageNum = parseInt(page as string, 10) || 1;
  const limitNum = parseInt(limit as string, 10) || 10;
  const total = destinations.length;
  const totalPages = Math.ceil(total / limitNum);
  const startIndex = (pageNum - 1) * limitNum;
  const paginatedDestinations = destinations.slice(startIndex, startIndex + limitNum);

  return {
    destinations: paginatedDestinations,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages,
    },
  };
};

export const getDestinationById = async (id: string) => {
  const destination = await destinationRepository.findById(id);
  if (!destination) {
    throw new AppError('Destination not found', 404);
  }
  return destination;
};

export const createDestinationContribution = async (userId: string, data: any) => {
  const { name, country, state, description, bestTimeToVisit, budgetRange, activities, images } = data;

  return destinationRepository.create({
    name,
    country,
    state,
    description,
    bestTimeToVisit,
    budgetRange,
    activities: activities || [],
    images: images || [],
    status: 'pending',
    submittedBy: userId,
  });
};

export const getGuideContributions = async (userId: string) => {
  return destinationRepository.find({ submittedBy: userId });
};

export const updateDestinationStatus = async (destinationId: string, status: 'approved' | 'rejected') => {
  const dest = await destinationRepository.findById(destinationId);
  if (!dest) {
    throw new AppError('Destination not found', 404);
  }

  dest.status = status;
  await dest.save();
  return dest;
};
