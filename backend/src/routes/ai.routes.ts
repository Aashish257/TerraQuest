// This file defines the API routes and links endpoints to controllers for ai routes.
/**
 * ai.routes.ts — AI Planner routes
 *
 * Exposes endpoints to request prompt-driven itineraries, get saved history list,
 * and view single generated plans. Proteced by authentication.
 */

import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { generatePlanSchema } from '../validators/ai.validator';
import {
  generatePlan,
  getMyPlans,
  getPlanById,
} from '../controllers/ai.controller';

const router = Router();

// Protect all routes
router.use(authenticate);

// API Mappings
router.post('/generate', validate(generatePlanSchema), generatePlan);
router.get('/plans', getMyPlans);
router.get('/plans/:id', getPlanById);

export default router;
