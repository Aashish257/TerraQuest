// This file checks and validates input data for review validator to ensure correctness.
/**
 * review.validator.ts — Review request validator
 *
 * Defines Zod schema for validating review payload data.
 */

import { z } from 'zod';

export const createReviewSchema = z.object({
  targetId: z
    .string()
    .min(1, { message: 'targetId is required' }),
  targetType: z.enum(['destination', 'guide'], {
    errorMap: () => ({ message: 'targetType must be destination or guide' }),
  }),
  rating: z
    .number()
    .int({ message: 'Rating must be an integer' })
    .min(1, { message: 'Rating must be at least 1' })
    .max(5, { message: 'Rating cannot exceed 5' }),
  comment: z
    .string()
    .min(10, { message: 'Comment must be at least 10 characters' })
    .max(1000, { message: 'Comment cannot exceed 1000 characters' }),
});
