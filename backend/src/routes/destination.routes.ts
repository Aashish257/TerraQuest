/**
 * destination.routes.ts — Destinations routes
 *
 * Exposes endpoints for:
 * - GET /api/destinations (List, filter, paginate)
 * - GET /api/destinations/:id (Single details)
 * - GET /api/destinations/:id/hidden-places (Guides offbeat spots)
 */

import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  getDestinations,
  getDestinationById,
  getHiddenPlacesByDestinationId,
  submitDestinationContribution,
  getMyContributions,
  updateDestinationStatus,
  getPendingDestinations,
} from '../controllers/destination.controller';
import {
  createDestinationSchema,
  updateDestinationStatusSchema,
} from '../validators/destination.validator';

const router = Router();

// Contributor guide routes (Must be before dynamic /:id parameter)
router.post(
  '/guide',
  authenticate,
  authorize('guide'),
  validate(createDestinationSchema),
  submitDestinationContribution
);

router.get(
  '/guide/me',
  authenticate,
  authorize('guide'),
  getMyContributions
);

// Admin moderation routes (Must be before dynamic /:id parameter)
router.get(
  '/admin/pending',
  authenticate,
  authorize('admin'),
  getPendingDestinations
);

router.patch(
  '/:id/status',
  authenticate,
  authorize('admin'),
  validate(updateDestinationStatusSchema),
  updateDestinationStatus
);

// Public routes
router.get('/', getDestinations);
router.get('/:id', getDestinationById);
router.get('/:id/hidden-places', getHiddenPlacesByDestinationId);

export default router;
