import { z } from 'zod';

export const createExperienceSchema = z.object({
  name: z
    .string()
    .min(3, { message: 'Name must be at least 3 characters' })
    .max(100, { message: 'Name cannot exceed 100 characters' }),
  destinationId: z.string().regex(/^[0-9a-fA-F]{24}$/, {
    message: 'Invalid destinationId format',
  }),
  duration: z
    .string()
    .min(1, { message: 'Duration description is required' }),
  description: z
    .string()
    .min(20, { message: 'Description must be at least 20 characters' })
    .max(2000, { message: 'Description cannot exceed 2000 characters' }),
  highlights: z
    .array(z.string().min(1, { message: 'Highlight item cannot be empty' }))
    .optional(),
});
