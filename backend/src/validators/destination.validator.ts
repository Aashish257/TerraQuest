import { z } from 'zod';

export const createDestinationSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Name must be at least 2 characters' })
    .max(100, { message: 'Name cannot exceed 100 characters' }),
  country: z
    .string()
    .min(2, { message: 'Country must be at least 2 characters' }),
  state: z
    .string()
    .optional()
    .or(z.literal('')),
  description: z
    .string()
    .min(20, { message: 'Description must be at least 20 characters' })
    .max(2000, { message: 'Description cannot exceed 2000 characters' }),
  bestTimeToVisit: z
    .string()
    .optional()
    .or(z.literal('')),
  budgetRange: z
    .string()
    .optional()
    .or(z.literal('')),
  activities: z
    .array(z.string().min(1, { message: 'Activity name cannot be empty' }))
    .optional(),
  images: z
    .array(z.string().url({ message: 'Invalid image URL format' }))
    .optional(),
});

export const updateDestinationStatusSchema = z.object({
  status: z.enum(['approved', 'rejected'], {
    errorMap: () => ({ message: "Status must be 'approved' or 'rejected'" }),
  }),
});
