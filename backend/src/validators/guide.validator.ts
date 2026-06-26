// This file checks and validates input data for guide validator to ensure correctness.
/**
 * guide.validator.ts — Guide Profile request validators
 *
 * Defines Zod schemas for validating payloads to create and update guide profiles.
 */

import { z } from 'zod';

export const createGuideProfileSchema = z.object({
  experience: z
    .number()
    .min(0, { message: 'Experience cannot be negative' }),
  languages: z
    .array(z.string())
    .min(1, { message: 'At least one language must be specified' }),
  expertise: z
    .array(z.string())
    .min(1, { message: 'At least one area of expertise must be specified' }),
  location: z
    .string()
    .min(1, { message: 'Location is required' }),
  bio: z
    .string()
    .max(1000, { message: 'Bio cannot exceed 1000 characters' })
    .optional(),
});

export const updateGuideProfileSchema = z.object({
  experience: z
    .number()
    .min(0, { message: 'Experience cannot be negative' })
    .optional(),
  languages: z
    .array(z.string())
    .min(1, { message: 'At least one language must be specified' })
    .optional(),
  expertise: z
    .array(z.string())
    .min(1, { message: 'At least one area of expertise must be specified' })
    .optional(),
  location: z
    .string()
    .min(1, { message: 'Location is required' })
    .optional(),
  bio: z
    .string()
    .max(1000, { message: 'Bio cannot exceed 1000 characters' })
    .optional(),
});

export const updateGuideProfileAndUserSchema = updateGuideProfileSchema.extend({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }).optional(),
  avatar: z.string().optional(),
});
