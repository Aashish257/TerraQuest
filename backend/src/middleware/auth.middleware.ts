/**
 * auth.middleware.ts — JWT authentication middleware
 *
 * Checks incoming requests for a valid bearer token in the Authorization header.
 * Verifies the token using JWT_SECRET, loads the user from the database,
 * validates the user is active, and attaches user info to the Request object.
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import User from '../models/User';

// Extend Express Request interface to include req.user
export interface AuthRequest extends Request {
  user?: {
    _id: string;
    role: 'traveler' | 'guide' | 'admin';
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  console.log('--- AUTHENTICATING ROUTE ---', req.method, req.url);
  console.log('HEADERS:', req.headers);
  console.log('COOKIES:', req.cookies);
  let token = req.cookies?.accessToken || req.cookies?.token;

  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication failed: No token provided',
    });
  }

  try {
    // Decode and verify token
    const decoded = jwt.verify(token, env.JWT_SECRET) as {
      _id: string;
      role: 'traveler' | 'guide' | 'admin';
    };

    // Retrieve user and ensure they exist and are active
    const user = await User.findById(decoded._id).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication failed: User no longer exists',
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Authentication failed: User account is inactive',
      });
    }

    // Attach user information to request
    req.user = {
      _id: user._id.toString(),
      role: user.role,
    };

    next();
  } catch (err) {
    console.error('JWT AUTH MIDDLEWARE ERROR:', err, 'Token:', token);
    return res.status(401).json({
      success: false,
      message: 'Authentication failed: Invalid or expired token',
    });
  }
};
