// This file defines the API routes and links endpoints to controllers for review routes.
/**
 * review.routes.ts — Review routes
 *
 * Exposes endpoints to get lists of reviews and create a review.
 */

import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createReviewSchema } from '../validators/review.validator';
import { getReviews, createReview } from '../controllers/review.controller';

const router = Router();

// Public routes
router.get('/', getReviews);

// Protected routes
router.post('/', authenticate, validate(createReviewSchema), createReview);

export default router;
