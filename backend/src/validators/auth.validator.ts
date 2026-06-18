/**
 * auth.validator.ts — Authentication request validators
 *
 * Defines Zod schemas for validating incoming register and login payloads.
 */

import { z } from 'zod';

// Register payload validation
export const registerSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Name must be at least 2 characters' })
    .max(100, { message: 'Name cannot exceed 100 characters' }),
  email: z
    .string()
    .email({ message: 'Please provide a valid email address' }),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters' }),
  role: z
    .enum(['traveler', 'guide'], {
      errorMap: () => ({ message: 'Role must be traveler or guide' }),
    })
    .default('traveler'),
});

// Login payload validation
export const loginSchema = z.object({
  email: z
    .string()
    .email({ message: 'Please provide a valid email address' }),
  password: z
    .string()
    .min(1, { message: 'Password is required' }),
});
