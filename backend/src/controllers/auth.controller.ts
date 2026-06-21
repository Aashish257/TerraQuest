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

const setTokenCookie = (res: Response, token: string) => {
  res.cookie('accessToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days (or matching expiration)
  });
};

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await authService.registerUser(req.body);
    setTokenCookie(res, result.token);
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
    setTokenCookie(res, result.token);
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
    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
    });
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
    });
    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (err) {
    next(err);
  }
};
