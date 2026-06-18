/**
 * ai.validator.ts — AI Plan input validators
 *
 * Defines Zod schemas for validating payloads to generate itineraries.
 */

import { z } from 'zod';

export const generatePlanSchema = z.object({
  destinationId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, { message: 'Invalid destinationId format' }),
  budget: z
    .number()
    .min(1, { message: 'Budget must be a positive number' }),
  duration: z
    .number()
    .int({ message: 'Duration must be an integer' })
    .min(1, { message: 'Duration must be at least 1 day' })
    .max(30, { message: 'Duration cannot exceed 30 days' }),
  interests: z
    .array(z.string().min(1, { message: 'Interest cannot be empty' }))
    .min(1, { message: 'At least one interest is required' }),
});
