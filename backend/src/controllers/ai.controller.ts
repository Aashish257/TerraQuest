/**
 * ai.controller.ts — AI Plan controllers
 *
 * Implements actions to request generated travel plans, list history, and view details.
 */

import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import AIPlan from '../models/AIPlan';
import Destination from '../models/Destination';
import * as aiService from '../services/ai.service';
import { AppError } from '../middleware/errorHandler';

/**
 * Handles POST /api/ai/generate
 * Generates an itinerary, saves it to database, and returns the plan ID and content.
 */
export const generatePlan = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) throw new AppError('Unauthenticated', 401);

    const { destinationId, budget, duration, interests } = req.body;

    // 1. Verify destination exists
    const destination = await Destination.findById(destinationId);
    if (!destination) {
      throw new AppError('Destination not found', 404);
    }

    // 2. Generate travel plan (catches external failures)
    let generatedPlan: string;
    try {
      generatedPlan = await aiService.generateTravelPlan({
        destinationName: destination.name,
        budget,
        duration,
        interests,
      });
    } catch (err: any) {
      console.error('AI Service Error:', err);
      if (err.message?.includes('OpenAI')) {
        // Return 503 as specified in API-AI-003
        return res.status(503).json({
          success: false,
          message: 'AI service unavailable',
        });
      }
      throw err;
    }

    // 3. Save to database
    const plan = await AIPlan.create({
      userId: req.user._id,
      destinationId,
      budget,
      duration,
      interests,
      generatedPlan,
    });

    // Populate destinationId before returning to prevent 'undefined' in title and destinationId query params on the frontend
    const populatedPlan = await AIPlan.findById(plan._id).populate(
      'destinationId',
      'name country state'
    );

    res.status(200).json({
      success: true,
      planId: plan._id,
      generatedPlan: plan.generatedPlan,
      createdAt: plan.createdAt,
      data: populatedPlan || plan,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Handles GET /api/ai/plans
 * Retrieves saved travel plans history list for the current user.
 */
export const getMyPlans = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) throw new AppError('Unauthenticated', 401);

    const plans = await AIPlan.find({ userId: req.user._id })
      .populate('destinationId', 'name country state')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: plans.length,
      plans,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Handles GET /api/ai/plans/:id
 * Resolves a single saved travel plan.
 */
export const getPlanById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) throw new AppError('Unauthenticated', 401);

    const plan = await AIPlan.findById(req.params.id)
      .populate('destinationId', 'name country state');

    if (!plan) {
      throw new AppError('AI Plan not found', 404);
    }

    // Verify ownership
    if (plan.userId.toString() !== req.user._id) {
      throw new AppError('Forbidden: Access denied to this travel plan', 403);
    }

    res.status(200).json({
      success: true,
      plan,
    });
  } catch (err) {
    next(err);
  }
};
