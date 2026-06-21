import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';
import { validate } from '../middleware/validate.middleware';
import { createExperienceSchema } from '../validators/experience.validator';
import {
  createExperience,
  getMyExperiences,
  getExperiencesByGuideId,
} from '../controllers/experience.controller';

const router = Router();

// Protected routes (Only users with 'guide' role)
router.post(
  '/',
  authenticate,
  authorize('guide'),
  validate(createExperienceSchema),
  createExperience
);

router.get(
  '/guide/me',
  authenticate,
  authorize('guide'),
  getMyExperiences
);

// Public route to get experiences of a specific guide
router.get(
  '/guide/:guideId',
  getExperiencesByGuideId
);

export default router;
