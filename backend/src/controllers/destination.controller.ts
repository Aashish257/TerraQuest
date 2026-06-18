/**
 * destination.controller.ts — Destinations controller
 *
 * Implements endpoints for:
 * - GET /api/destinations (search, activity/budget filters, pagination)
 * - GET /api/destinations/:id (detail lookup)
 * - GET /api/destinations/:id/hidden-places (returns empty array for P1 placeholder)
 */

import { Request, Response, NextFunction } from 'express';
import Destination from '../models/Destination';
import { AppError } from '../middleware/errorHandler';

// Helper: Extract min budget number from budgetRange string (e.g. "₹3,000 – ₹12,000 per day" -> 3000)
const getMinBudget = (range: string): number => {
  const cleanRange = range.replace(/,/g, '');
  const match = cleanRange.match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
};

export const getDestinations = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { search, activity, budget, page = '1', limit = '10' } = req.query;

    const query: any = {};

    // 1. Text Search (Name and Activities text index)
    if (search) {
      query.$text = { $search: search as string };
    }

    // 2. Activity filter
    if (activity) {
      query.activities = { $regex: new RegExp(activity as string, 'i') };
    }

    // Fetch matching records
    let destinations = await Destination.find(query);

    // 3. Budget filter (Applied in-memory for flexible string range checking)
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

    // 4. Pagination
    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 10;
    const total = destinations.length;
    const totalPages = Math.ceil(total / limitNum);

    const startIndex = (pageNum - 1) * limitNum;
    const paginatedDestinations = destinations.slice(startIndex, startIndex + limitNum);

    res.status(200).json({
      success: true,
      count: paginatedDestinations.length,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
      },
      destinations: paginatedDestinations,
    });
  } catch (err) {
    next(err);
  }
};

export const getDestinationById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const destination = await Destination.findById(req.params.id);
    if (!destination) {
      throw new AppError('Destination not found', 404);
    }

    res.status(200).json({
      success: true,
      destination,
    });
  } catch (err) {
    next(err);
  }
};

export const getHiddenPlacesByDestinationId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const destination = await Destination.findById(req.params.id);
    if (!destination) {
      throw new AppError('Destination not found', 404);
    }

    // P1 Compliance Placeholder: returns an empty array for now
    res.status(200).json({
      success: true,
      count: 0,
      hiddenPlaces: [],
    });
  } catch (err) {
    next(err);
  }
};
