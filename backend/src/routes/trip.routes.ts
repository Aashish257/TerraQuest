// This file defines the API routes and links endpoints to controllers for trip routes.
/**
 * trip.routes.ts — Trips and nested budget entries routes
 *
 * Mounts validators, controllers, and middlewares for:
 * - CRUD operations on Trips
 * - Invitation / removal of group trip members
 * - CRUD operations on nested Budget entries
 * - Retrieval of aggregated budget summaries
 */

import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  createTripSchema,
  updateTripSchema,
  createBudgetEntrySchema,
} from '../validators/trip.validator';
import {
  createTrip,
  getMyTrips,
  getTripById,
  updateTrip,
  deleteTrip,
  addMember,
  removeMember,
} from '../controllers/trip.controller';
import {
  addBudgetEntry,
  getBudgetEntries,
  deleteBudgetEntry,
  getBudgetSummary,
} from '../controllers/budget.controller';

const router = Router();

// Protect all routes under this module
router.use(authenticate);

// ─── Trips Routes ────────────────────────────────────────────────────────────
router.get('/', getMyTrips);
router.post('/', validate(createTripSchema), createTrip);
router.get('/:id', getTripById);
router.put('/:id', validate(updateTripSchema), updateTrip);
router.delete('/:id', deleteTrip);

// ─── Trip Members Routes ──────────────────────────────────────────────────────
router.post('/:id/members', addMember);
router.delete('/:id/members/:userId', removeMember);

// ─── Nested Budget Entries Routes ─────────────────────────────────────────────
router.get('/:tripId/budget-entries', getBudgetEntries);
router.post(
  '/:tripId/budget-entries',
  validate(createBudgetEntrySchema),
  addBudgetEntry
);
router.delete('/:tripId/budget-entries/:entryId', deleteBudgetEntry);
router.get('/:tripId/budget-summary', getBudgetSummary);

export default router;
