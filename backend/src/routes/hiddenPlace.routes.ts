import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';
import { validate } from '../middleware/validate.middleware';
import { createHiddenPlaceSchema } from '../validators/hiddenPlace.validator';
import {
  createHiddenPlace,
  getMyHiddenPlaces,
} from '../controllers/hiddenPlace.controller';

const router = Router();

// Protected routes (Only users with 'guide' role)
router.post(
  '/',
  authenticate,
  authorize('guide'),
  validate(createHiddenPlaceSchema),
  createHiddenPlace
);

router.get(
  '/guide/me',
  authenticate,
  authorize('guide'),
  getMyHiddenPlaces
);

export default router;
