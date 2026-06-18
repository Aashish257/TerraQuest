/**
 * auth.routes.ts — Authentication routes definition
 *
 * Mounts validators, controllers, and middlewares for:
 * - POST /api/auth/register
 * - POST /api/auth/login
 * - POST /api/auth/logout
 */

import { Router } from 'express';
import { register, login, logout } from '../controllers/auth.controller';
import { validate } from '../middleware/validate.middleware';
import { registerSchema, loginSchema } from '../validators/auth.validator';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);

// Protected routes
router.post('/logout', authenticate, logout);

export default router;
