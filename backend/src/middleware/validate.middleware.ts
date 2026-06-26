// This middleware file checks and processes incoming requests before they reach the main logic.
/**
 * validate.middleware.ts — Request body validation middleware
 *
 * Wraps Zod schema parsing in an Express middleware.
 * If validation succeeds, req.body is replaced with the parsed/coerced data.
 * If validation fails, returns a 400 Bad Request response with validation details.
 */

import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: result.error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      });
    }

    // Replace req.body with validated and typed data
    req.body = result.data;
    next();
  };
};
