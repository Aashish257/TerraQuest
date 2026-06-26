// This file defines the API routes and links endpoints to controllers for user routes.
/**
 * user.routes.ts — User routes definition
 *
 * Mounts validators, controllers, and middlewares for:
 * - GET /api/users/me
 * - PUT /api/users/me
 * - GET /api/users/:id
 */

import { Router } from 'express';
import {
  getMe,
  updateMe,
  getUserById,
  getAllUsers,
  updateUserStatus,
  updateUserRole,
} from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';
import { validate } from '../middleware/validate.middleware';
import { updateUserSchema } from '../validators/user.validator';

const router = Router();

// Admin routes (placed BEFORE /:id to avoid clash)
router.get('/', authenticate, authorize('admin'), getAllUsers);
router.patch('/:id/status', authenticate, authorize('admin'), updateUserStatus);
router.patch('/:id/role', authenticate, authorize('admin'), updateUserRole);

// Protected profile routes
router.get('/me', authenticate, getMe);
router.put('/me', authenticate, validate(updateUserSchema), updateMe);

// Public profile retrieval
router.get('/:id', getUserById);

export default router;

