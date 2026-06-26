// This file handles the HTTP requests and responses for guide request controller features.
import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as guideRequestService from '../services/guideRequest.service';
import { AppError } from '../middleware/errorHandler';


export const createRequest = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) throw new AppError('Unauthenticated', 401);

    const request = await guideRequestService.createGuideRequest(req.user._id, req.body);

    res.status(201).json({
      success: true,
      request,
    });
  } catch (err) {
    next(err);
  }
};

export const getMyRequests = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) throw new AppError('Unauthenticated', 401);

    const requests = await guideRequestService.getRequestsForGuide(req.user._id);

    res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (err) {
    next(err);
  }
};

export const respondToRequest = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) throw new AppError('Unauthenticated', 401);

    const { status } = req.body;
    if (status !== 'accepted' && status !== 'rejected') {
      throw new AppError("Invalid response status. Must be 'accepted' or 'rejected'", 400);
    }

    const request = await guideRequestService.respondToRequest(
      req.user._id,
      req.params.id,
      status
    );

   return res.status(200).json({
      success: true,
      request,
    });
  } catch (err) {
    next(err);
  }
};

export const getAllRequests = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const requests = await guideRequestService.getAllRequestsForAdmin();
    res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (err) {
    next(err);
  }
};
