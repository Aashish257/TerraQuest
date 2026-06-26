// This file checks and validates input data for trip validator to ensure correctness.
/**
 * trip.validator.ts — Trip and budget entry request validators
 *
 * Defines Zod schemas for validating payloads to create trips and add budget expenses.
 */

import { z } from 'zod';

export const createTripSchema = z
  .object({
    destinationId: z
      .string()
      .min(1, { message: 'destinationId is required' }),
    title: z
      .string()
      .min(2, { message: 'Title must be at least 2 characters' }),
    tripType: z.enum(['solo', 'group'], {
      errorMap: () => ({ message: 'tripType must be solo or group' }),
    }),
    startDate: z.coerce.date({
      required_error: 'startDate is required',
      invalid_type_error: 'Invalid start date format',
    }),
    endDate: z.coerce.date({
      required_error: 'endDate is required',
      invalid_type_error: 'Invalid end date format',
    }),
    budget: z
      .number()
      .min(0, { message: 'Budget cannot be negative' }),
  })
  .refine((data) => data.endDate > data.startDate, {
    message: 'endDate must be after startDate',
    path: ['endDate'],
  });

export const updateTripSchema = z
  .object({
    destinationId: z
      .string()
      .min(1, { message: 'destinationId cannot be empty' })
      .optional(),
    title: z
      .string()
      .min(2, { message: 'Title must be at least 2 characters' })
      .optional(),
    tripType: z.enum(['solo', 'group'], {
      errorMap: () => ({ message: 'tripType must be solo or group' }),
    }).optional(),
    startDate: z.coerce.date({
      invalid_type_error: 'Invalid start date format',
    }).optional(),
    endDate: z.coerce.date({
      invalid_type_error: 'Invalid end date format',
    }).optional(),
    budget: z
      .number()
      .min(0, { message: 'Budget cannot be negative' })
      .optional(),
    status: z.enum(['active', 'completed', 'cancelled']).optional(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return data.endDate > data.startDate;
      }
      return true;
    },
    {
      message: 'endDate must be after startDate',
      path: ['endDate'],
    }
  );

export const createBudgetEntrySchema = z.object({
  category: z.enum(['Food', 'Stay', 'Transport', 'Activities', 'Other'], {
    errorMap: () => ({ message: 'Category must be Food, Stay, Transport, Activities, or Other' }),
  }),
  amount: z
    .number()
    .min(0.01, { message: 'Amount must be greater than 0' }),
  description: z
    .string()
    .max(200, { message: 'Description cannot exceed 200 characters' })
    .optional(),
});

