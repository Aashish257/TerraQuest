import { aiPlanRepository } from '../repositories/AIPlanRepository';
import { destinationRepository } from '../repositories/DestinationRepository';
import * as aiService from './ai.service';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

export const generateAndSavePlan = async (userId: string, data: any) => {
  const { destinationId, budget, duration, interests } = data;

  const destination = await destinationRepository.findById(destinationId);
  if (!destination) {
    throw new AppError('Destination not found', 404);
  }

  let generatedPlan: string;
  try {
    generatedPlan = await aiService.generateTravelPlan({
      destinationName: destination.name,
      budget,
      duration,
      interests,
    });
  } catch (err: any) {
    logger.error({ err }, 'AI Service Error');
    if (err.message?.includes('OpenAI') || err.message?.includes('Gemini')) {
      throw new AppError('AI service unavailable', 503);
    }
    throw err;
  }

  const plan = await aiPlanRepository.create({
    userId,
    destinationId,
    budget,
    duration,
    interests,
    generatedPlan,
  });

  const populatedPlan = await aiPlanRepository.findByIdWithDestination(plan._id.toString());
  return {
    planId: plan._id,
    generatedPlan: plan.generatedPlan,
    createdAt: plan.createdAt,
    data: populatedPlan || plan,
  };
};

export const getMyPlans = async (userId: string) => {
  return aiPlanRepository.findByUserId(userId);
};

export const getPlanById = async (planId: string, userId: string) => {
  const plan = await aiPlanRepository.findByIdWithDestination(planId);
  if (!plan) {
    throw new AppError('AI Plan not found', 404);
  }

  if (plan.userId.toString() !== userId) {
    throw new AppError('Forbidden: Access denied to this travel plan', 403);
  }

  return plan;
};
