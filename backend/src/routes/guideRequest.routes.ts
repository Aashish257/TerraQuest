// This file defines the API routes and links endpoints to controllers for guide request routes.
import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';
import { validate } from '../middleware/validate.middleware';
import { createGuideRequestSchema, respondGuideRequestSchema } from '../validators/guideRequest.validator';
import {
  createRequest,
  getMyRequests,
  respondToRequest,
  getAllRequests,
} from '../controllers/guideRequest.controller';


const router = Router();

// Protected routes (Any authenticated user can submit a request)
router.post(
  '/',
  authenticate,
  validate(createGuideRequestSchema),
  createRequest
);

// Protected routes (Only users with 'guide' role)
router.get(
  '/guide/me',
  authenticate,
  authorize('guide'),
  getMyRequests
);

router.patch(
  '/:id/respond',
  authenticate,
  authorize('guide'),
  validate(respondGuideRequestSchema),
  respondToRequest
);

// Admin: get all guide requests platform-wide
router.get(
  '/admin/all',
  authenticate,
  authorize('admin'),
  getAllRequests
);

export default router;

