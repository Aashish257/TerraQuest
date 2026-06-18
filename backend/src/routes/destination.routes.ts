/**
 * destination.routes.ts — Destinations routes
 *
 * Exposes endpoints for:
 * - GET /api/destinations (List, filter, paginate)
 * - GET /api/destinations/:id (Single details)
 * - GET /api/destinations/:id/hidden-places (Guides offbeat spots)
 */

import { Router } from 'express';
import {
  getDestinations,
  getDestinationById,
  getHiddenPlacesByDestinationId,
} from '../controllers/destination.controller';

const router = Router();

// All destinations endpoints are public
router.get('/', getDestinations);
router.get('/:id', getDestinationById);
router.get('/:id/hidden-places', getHiddenPlacesByDestinationId);

export default router;
