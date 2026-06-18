/**
 * trip.controller.ts — Trip controller
 *
 * Implements CRUD actions for Trips and Group Member management.
 * Enforces ownership limits:
 * - Only owners can UPDATE, DELETE trips, or INVITE/REMOVE group members.
 * - Owners and members can GET trip details.
 */

import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import Trip from '../models/Trip';
import TripMember from '../models/TripMember';
import BudgetEntry from '../models/BudgetEntry';
import User from '../models/User';
import { AppError } from '../middleware/errorHandler';
import mongoose from 'mongoose';

export const createTrip = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) throw new AppError('Unauthenticated', 401);

    const { destinationId, title, tripType, startDate, endDate, budget } = req.body;

    // 1. Create Trip
    const trip = await Trip.create({
      ownerId: req.user._id,
      destinationId,
      title,
      tripType,
      startDate,
      endDate,
      budget,
    });

    // 2. Add owner as first member
    await TripMember.create({
      tripId: trip._id,
      userId: req.user._id,
      role: 'owner',
    });

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

    // 1. Find all trip member entries for this user
    const memberships = await TripMember.find({ userId: req.user._id });
    const tripIds = memberships.map((m) => m.tripId);

    // 2. Query and return trips populated with destination info
    const trips = await Trip.find({ _id: { $in: tripIds } })
      .populate('destinationId', 'name country state')
      .sort({ startDate: 1 });

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

    const trip = await Trip.findById(req.params.id)
      .populate('destinationId', 'name country state');
      
    if (!trip) {
      throw new AppError('Trip not found', 404);
    }

    // Verify user is a member of this trip
    const member = await TripMember.findOne({ tripId: trip._id, userId: req.user._id });
    if (!member) {
      throw new AppError('Access denied: You are not a member of this trip', 403);
    }

    // Fetch details of other members if group trip
    let members: any[] = [];
    if (trip.tripType === 'group') {
      members = await TripMember.find({ tripId: trip._id })
        .populate('userId', 'name email avatar role');
    }

    res.status(200).json({
      success: true,
      trip,
      members,
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

    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      throw new AppError('Trip not found', 404);
    }

    // Verify ownership
    if (trip.ownerId.toString() !== req.user._id) {
      throw new AppError('Forbidden: Only the owner can modify this trip', 403);
    }

    const { title, startDate, endDate, budget, status } = req.body;

    // Update
    trip.title = title ?? trip.title;
    trip.startDate = startDate ?? trip.startDate;
    trip.endDate = endDate ?? trip.endDate;
    trip.budget = budget !== undefined ? budget : trip.budget;
    trip.status = status ?? trip.status;

    await trip.save();

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

    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      throw new AppError('Trip not found', 404);
    }

    // Verify ownership
    if (trip.ownerId.toString() !== req.user._id) {
      throw new AppError('Forbidden: Only the owner can delete this trip', 403);
    }

    // Hard cascading delete
    await Trip.findByIdAndDelete(trip._id);
    await TripMember.deleteMany({ tripId: trip._id });
    await BudgetEntry.deleteMany({ tripId: trip._id });

    res.status(200).json({
      success: true,
      message: 'Trip and all associated resources deleted successfully',
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

    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      throw new AppError('Trip not found', 404);
    }

    // Verify ownership
    if (trip.ownerId.toString() !== req.user._id) {
      throw new AppError('Forbidden: Only the owner can manage members', 403);
    }

    // Prevent adding members to solo trips
    if (trip.tripType === 'solo') {
      throw new AppError('Bad Request: Cannot invite members to a solo trip', 400);
    }

    const { userId, email } = req.body;
    let targetUserId = userId;

    // Look up by email if provided
    if (email) {
      const invitee = await User.findOne({ email });
      if (!invitee) {
        throw new AppError('User with this email not found', 404);
      }
      targetUserId = invitee._id.toString();
    }

    if (!targetUserId) {
      throw new AppError('User ID or Email is required', 400);
    }

    // Check if target user is already a member
    const existingMember = await TripMember.findOne({ tripId: trip._id, userId: targetUserId });
    if (existingMember) {
      throw new AppError('User is already a member of this trip', 400);
    }

    // Add member
    const newMember = await TripMember.create({
      tripId: trip._id,
      userId: targetUserId,
      role: 'member',
    });

    res.status(201).json({
      success: true,
      member: newMember,
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

    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      throw new AppError('Trip not found', 404);
    }

    // Verify ownership
    if (trip.ownerId.toString() !== req.user._id) {
      throw new AppError('Forbidden: Only the owner can manage members', 403);
    }

    const { userId } = req.params;

    // Prevent removing the owner
    if (trip.ownerId.toString() === userId) {
      throw new AppError('Bad Request: Cannot remove the owner of the trip', 400);
    }

    const result = await TripMember.findOneAndDelete({ tripId: trip._id, userId });
    if (!result) {
      throw new AppError('Member not found in this trip', 404);
    }

    res.status(200).json({
      success: true,
      message: 'Member removed from trip successfully',
    });
  } catch (err) {
    next(err);
  }
};
