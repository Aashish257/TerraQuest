// This file handles the HTTP requests and responses for trip controller features.
import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as tripService from '../services/trip.service';
import { AppError } from '../middleware/errorHandler';

export const createTrip = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) throw new AppError('Unauthenticated', 401);

    const trip = await tripService.createTrip(req.user._id, req.body);

    res.status(201).json({
      success: true,
      trip,
    });
  } catch (err) {
    next(err);
  }
};

export const getMyTrips = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) throw new AppError('Unauthenticated', 401);

    const trips = await tripService.getMyTrips(req.user._id);

    res.status(200).json({
      success: true,
      count: trips.length,
      trips,
    });
  } catch (err) {
    next(err);
  }
};

export const getTripById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) throw new AppError('Unauthenticated', 401);

    const result = await tripService.getTripById(req.params.id, req.user._id);

    res.status(200).json({
      success: true,
      trip: result.trip,
      members: result.members,
    });
  } catch (err) {
    next(err);
  }
};

export const updateTrip = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) throw new AppError('Unauthenticated', 401);

    const trip = await tripService.updateTrip(req.params.id, req.user._id, req.body);

    res.status(200).json({
      success: true,
      trip,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteTrip = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) throw new AppError('Unauthenticated', 401);

    const result = await tripService.deleteTrip(req.params.id, req.user._id);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (err) {
    next(err);
  }
};

export const addMember = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) throw new AppError('Unauthenticated', 401);

    const member = await tripService.addMember(req.params.id, req.user._id, req.body);

    res.status(201).json({
      success: true,
      member,
    });
  } catch (err) {
    next(err);
  }
};

export const removeMember = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) throw new AppError('Unauthenticated', 401);

    const result = await tripService.removeMember(req.params.id, req.user._id, req.params.userId);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (err) {
    next(err);
  }
};
