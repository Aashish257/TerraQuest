// This file checks and validates input data for guide request validator to ensure correctness.
import { z } from 'zod';

export const createGuideRequestSchema = z.object({
  guideId: z.string().regex(/^[0-9a-fA-F]{24}$/, {
    message: 'Invalid guideId format',
  }),
  tripId: z.string().regex(/^[0-9a-fA-F]{24}$/, {
    message: 'Invalid tripId format',
  }),
  message: z
    .string()
    .min(5, { message: 'Message must be at least 5 characters' })
    .max(500, { message: 'Message cannot exceed 500 characters' }),
});

export const respondGuideRequestSchema = z.object({
  status: z.enum(['accepted', 'rejected'], {
    errorMap: () => ({ message: "Status must be 'accepted' or 'rejected'" }),
  }),
});
