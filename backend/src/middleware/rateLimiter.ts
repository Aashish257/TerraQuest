// This middleware file checks and processes incoming requests before they reach the main logic.
/**
 * rateLimiter.ts — Auth rate limiting middleware (v2 Backlog)
 *
 * This middleware is NOT wired in for the current build cycle, as rate limiting
 * is deferred to v2. The dependency `express-rate-limit` has been removed.
 *
 * Below is the reference implementation for when it is reintroduced.
 */

import rateLimit from 'express-rate-limit';
import { env } from '../config/env';

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: env.NODE_ENV === 'test' ? 1000 : 10, // Higher threshold for testing integrity
  message: { 
    success: false, 
    message: 'Too many requests, try again later' 
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
