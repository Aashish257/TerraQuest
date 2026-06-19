/**
 * guide.controller.ts — Guide Profile controller
 *
 * Implements endpoints for:
 * - GET /api/guides (list guides, filter by location & rating, pagination)
 * - GET /api/guides/:id (fetch single guide profile detail)
 * - POST /api/guides (create a guide profile, restricted to role 'guide')
 * - PUT /api/guides/:id (update guide profile, restricted to owner)
 */

import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import GuideProfile from '../models/GuideProfile';
import { AppError } from '../middleware/errorHandler';

export const getGuides = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { location, rating, page = '1', limit = '10' } = req.query;

    const query: any = {};

    if (location) {
      query.location = { $regex: new RegExp(location as string, 'i') };
    }

    if (rating) {
      query.rating = { $gte: parseFloat(rating as string) };
    }

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const total = await GuideProfile.countDocuments(query);
    const totalPages = Math.ceil(total / limitNum);

    const guides = await GuideProfile.find(query)
      .populate('userId', 'name email avatar bio')
      .skip(skip)
      .limit(limitNum)
      .sort({ rating: -1 });

    res.status(200).json({
      success: true,
      count: guides.length,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
      },
      guides,
    });
  } catch (err) {
    next(err);
  }
};

export const getGuideById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let guide = await GuideProfile.findById(req.params.id).populate('userId', 'name email avatar bio');
    if (!guide) {
      // Fallback: search by userId
      guide = await GuideProfile.findOne({ userId: req.params.id }).populate('userId', 'name email avatar bio');
    }

    if (!guide) {
      throw new AppError('Guide profile not found', 404);
    }

    res.status(200).json({
      success: true,
      guide,
    });
  } catch (err) {
    next(err);
  }
};

export const createGuideProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { experience, languages, expertise, location, bio } = req.body;

    // Check if profile already exists for the user
    const existingProfile = await GuideProfile.findOne({ userId: req.user!._id });
    if (existingProfile) {
      throw new AppError('Guide profile already exists for this user', 409);
    }

    const profile = await GuideProfile.create({
      userId: req.user!._id,
      experience,
      languages,
      expertise,
      location,
      bio,
    });

    res.status(201).json({
      success: true,
      data: profile,
    });
  } catch (err) {
    next(err);
  }
};

export const updateGuideProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    let profile = await GuideProfile.findById(req.params.id);
    if (!profile) {
      // Fallback: search by userId
      profile = await GuideProfile.findOne({ userId: req.params.id });
    }

    if (!profile) {
      throw new AppError('Guide profile not found', 404);
    }

    // Ownership check (userId comparison)
    if (profile.userId.toString() !== req.user!._id) {
      throw new AppError('Forbidden: You can only update your own profile', 403);
    }

    const { experience, languages, expertise, location, bio } = req.body;

    if (experience !== undefined) profile.experience = experience;
    if (languages !== undefined) profile.languages = languages;
    if (expertise !== undefined) profile.expertise = expertise;
    if (location !== undefined) profile.location = location;
    if (bio !== undefined) profile.bio = bio;

    await profile.save();

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (err) {
    next(err);
  }
};
