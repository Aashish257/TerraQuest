// This file checks and validates input data for user validator to ensure correctness.
/**
 * user.validator.ts — User request validators
 *
 * Defines Zod schemas for validating user profile updates.
 */

import { z } from 'zod';

export const updateUserSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Name must be at least 2 characters' })
    .max(100, { message: 'Name cannot exceed 100 characters' })
    .optional(),
  bio: z
    .string()
    .max(500, { message: 'Bio cannot exceed 500 characters' })
    .optional(),
  location: z
    .string()
    .optional(),
});
