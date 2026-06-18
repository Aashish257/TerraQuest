/**
 * rateLimiter.ts — Auth rate limiting middleware (v2 Backlog)
 *
 * This middleware is NOT wired in for the current build cycle, as rate limiting
 * is deferred to v2. The dependency `express-rate-limit` has been removed.
 *
 * Below is the reference implementation for when it is reintroduced.
 */

/*
import rateLimit from 'express-rate-limit';

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per window
  message: { 
    success: false, 
    message: 'Too many requests, try again later' 
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
*/

import { Request, Response, NextFunction } from 'express';

// Temporary placeholder middleware that passes through
export const authRateLimiter = (req: Request, res: Response, next: NextFunction) => {
  next();
};
