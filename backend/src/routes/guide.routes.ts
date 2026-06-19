/**
 * guide.routes.ts — Guide Profile routes
 *
 * Exposes endpoints to browse guide profiles and create/update guide profiles.
 */

import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';
import { validate } from '../middleware/validate.middleware';
import { createGuideProfileSchema, updateGuideProfileSchema } from '../validators/guide.validator';
import {
  getGuides,
  getGuideById,
  createGuideProfile,
  updateGuideProfile,
} from '../controllers/guide.controller';

const router = Router();

// Public routes
router.get('/', getGuides);
router.get('/:id', getGuideById);

// Protected routes (Only users with 'guide' role)
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
