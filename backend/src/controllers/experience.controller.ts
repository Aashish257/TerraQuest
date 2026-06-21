import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { Request } from 'express';
import * as experienceService from '../services/experience.service';
import { AppError } from '../middleware/errorHandler';

export const createExperience = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) throw new AppError('Unauthenticated', 401);

    const experience = await experienceService.createExperience(req.user._id, req.body);

    res.status(201).json({
      success: true,
      experience,
    });
  } catch (err) {
    next(err);
  }
};

export const getMyExperiences = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) throw new AppError('Unauthenticated', 401);

    const experiences = await experienceService.getExperiencesByGuideUser(req.user._id);

    res.status(200).json({
      success: true,
      count: experiences.length,
      experiences,
    });
  } catch (err) {
    next(err);
  }
};

export const getExperiencesByGuideId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const experiences = await experienceService.getExperiencesByGuideId(req.params.guideId);

    res.status(200).json({
      success: true,
      count: experiences.length,
      experiences,
    });
  } catch (err) {
    next(err);
  }
};
