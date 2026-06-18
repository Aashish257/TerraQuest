/**
 * role.middleware.ts — Role-Based Access Control (RBAC) middleware
 *
 * Provides the authorize(...roles) middleware factory to restrict routes
 * to specific user roles (e.g., traveler, guide, admin).
 * Must be used AFTER the authenticate middleware.
 */

import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';

export const authorize = (...roles: ('traveler' | 'guide' | 'admin')[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to access this resource',
      });
    }
    next();
  };
};
