// This file defines the API routes and links endpoints to controllers for guide routes.
/**
 * guide.routes.ts — Guide Profile routes
 *
 * Exposes endpoints to browse guide profiles and create/update guide profiles.
 */

import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  getGuides,
  getGuideById,
  createGuideProfile,
  updateGuideProfile,
  becomeGuide,
  updateMyProfile,
} from '../controllers/guide.controller';
import {
  createGuideProfileSchema,
  updateGuideProfileSchema,
  updateGuideProfileAndUserSchema,
} from '../validators/guide.validator';

const router = Router();

// Public routes
router.get('/', getGuides);
router.get('/:id', getGuideById);

// Protected routes (Any authenticated user can upgrade to guide)
router.post(
  '/become',
  authenticate,
  validate(createGuideProfileSchema),
  becomeGuide
);

// Protected routes (Only users with 'guide' role)
router.put(
  '/profile/me',
  authenticate,
  authorize('guide'),
  validate(updateGuideProfileAndUserSchema),
  updateMyProfile
);

router.post(
  '/',
  authenticate,
  authorize('guide'),
  validate(createGuideProfileSchema),
  createGuideProfile
);
router.put(
  '/:id',
  authenticate,
  authorize('guide'),
  validate(updateGuideProfileSchema),
  updateGuideProfile
);

export default router;
