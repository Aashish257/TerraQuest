/**
 * auth.controller.ts — Authentication controller
 *
 * Handles HTTP requests for:
 * - Registering a new user
 * - Logging in an existing user
 * - Logging out (stateless response)
 */

import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await authService.registerUser(req.body);
    res.status(201).json({
      success: true,
      ...result,
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await authService.loginUser(req.body);
    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (err) {
    next(err);
  }
};

export const logout = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Stateless JWT: logout is handled on client by deleting the token.
    // Server simply confirms with 200 OK.
    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (err) {
    next(err);
  }
};
