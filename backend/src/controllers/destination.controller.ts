// This file handles the HTTP requests and responses for destination controller features.
import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as destinationService from '../services/destination.service';
import * as hiddenPlaceService from '../services/hiddenPlace.service';
import { AppError } from '../middleware/errorHandler';

export const getDestinations = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const filters = {
      search: req.query.search as string,
      activity: req.query.activity as string,
      budget: req.query.budget as string,
      page: req.query.page as string,
      limit: req.query.limit as string,
      status: req.query.status as string,
    };

    const result = await destinationService.listDestinations(filters);

    res.status(200).json({
      success: true,
      count: result.destinations.length,
      pagination: result.pagination,
      destinations: result.destinations,
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
    const destination = await destinationService.getDestinationById(req.params.id);
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
    // Verify destination exists first
    await destinationService.getDestinationById(req.params.id);

    const hiddenPlaces = await hiddenPlaceService.getHiddenPlacesByDestination(req.params.id);

    res.status(200).json({
      success: true,
      count: hiddenPlaces.length,
      hiddenPlaces,
    });
  } catch (err) {
    next(err);
  }
};

export const submitDestinationContribution = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) throw new AppError('Unauthenticated', 401);

    const destination = await destinationService.createDestinationContribution(req.user._id, req.body);

    res.status(201).json({
      success: true,
      destination,
    });
  } catch (err) {
    next(err);
  }
};

export const getMyContributions = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) throw new AppError('Unauthenticated', 401);

    const destinations = await destinationService.getGuideContributions(req.user._id);

    res.status(200).json({
      success: true,
      count: destinations.length,
      destinations,
    });
  } catch (err) {
    next(err);
  }
};

export const updateDestinationStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { status } = req.body;
    if (status !== 'approved' && status !== 'rejected') {
      throw new AppError("Invalid status. Must be 'approved' or 'rejected'", 400);
    }

    const destination = await destinationService.updateDestinationStatus(req.params.id, status);

    res.status(200).json({
      success: true,
      destination,
    });
  } catch (err) {
    next(err);
  }
};

export const getPendingDestinations = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await destinationService.listDestinations({ status: 'pending', limit: '100' });
    res.status(200).json({
      success: true,
      count: result.destinations.length,
      destinations: result.destinations,
    });
  } catch (err) {
    next(err);
  }
};
