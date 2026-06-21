export const ROLES = {
  TRAVELER: 'traveler',
  GUIDE: 'guide',
  ADMIN: 'admin',
} as const;

export type UserRole = typeof ROLES[keyof typeof ROLES];

export const TRIP_STATUS = {
  PLANNING: 'planning',
  ONGOING: 'ongoing',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export type TripStatus = typeof TRIP_STATUS[keyof typeof TRIP_STATUS];

export const BUDGET_CATEGORIES = ['Food', 'Stay', 'Transport', 'Activities', 'Other'] as const;

export type BudgetCategory = typeof BUDGET_CATEGORIES[number];

export const ERROR_MESSAGES = {
  UNAUTHENTICATED: 'Unauthenticated',
  USER_NOT_FOUND: 'User not found',
  EMAIL_REGISTERED: 'Email is already registered',
  INVALID_CREDENTIALS: 'Invalid email or password',
  FORBIDDEN: 'Forbidden',
  TRIP_NOT_FOUND: 'Trip not found',
  DESTINATION_NOT_FOUND: 'Destination not found',
  GUIDE_NOT_FOUND: 'Guide profile not found',
  PLAN_NOT_FOUND: 'AI Plan not found',
} as const;
