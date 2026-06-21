import { z } from 'zod';

export const createHiddenPlaceSchema = z.object({
  destinationId: z.string().regex(/^[0-9a-fA-F]{24}$/, {
    message: 'Invalid destinationId format',
  }),
  title: z
    .string()
    .min(3, { message: 'Title must be at least 3 characters' })
    .max(100, { message: 'Title cannot exceed 100 characters' }),
  description: z
    .string()
    .min(20, { message: 'Description must be at least 20 characters' })
    .max(2000, { message: 'Description cannot exceed 2000 characters' }),
  category: z
    .string()
    .min(2, { message: 'Category must be at least 2 characters' })
    .optional()
    .or(z.literal('')),
  images: z
    .array(z.string().url({ message: 'Invalid image URL format' }))
    .optional(),
});
