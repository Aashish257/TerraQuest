// This middleware file checks and processes incoming requests before they reach the main logic.
/**
 * errorHandler.ts — Global Express error handling middleware
 *
 * This is the LAST middleware registered in app.ts.
 * Express identifies it as an error handler because it has 4 parameters.
 *
 * All errors thrown anywhere in the app flow here:
 *   - Mongoose validation errors  → 400
 *   - Mongoose duplicate key      → 409
 *   - JWT errors                  → 401
 *   - Unhandled errors            → 500
 *
 * Standardised response shape:
 * {
 *   "success": false,
 *   "message": "Human readable message",
 *   "errors": []  // optional validation detail
 * }
 */

import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

// Custom application error class — use this to throw errors with HTTP status codes
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // operational errors are known, expected errors
    // Maintain proper prototype chain in TypeScript
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  let statusCode: number = err.statusCode || 500;
  let message: string = err.message || 'Internal Server Error';
  let errors: unknown[] = [];

  // ─── Mongoose: Validation Error ────────────────────────────────────────────
  // Thrown when a required field is missing or fails a validator
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    errors = Object.values(err.errors).map((e: any) => ({
      field: e.path,
      message: e.message,
    }));
  }

  // ─── Mongoose: Duplicate Key ────────────────────────────────────────────────
  // Thrown when a unique index constraint is violated (e.g. duplicate email)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `${field} already exists`;
  }

  // ─── JWT: Invalid Token ─────────────────────────────────────────────────────
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  // ─── JWT: Token Expired ─────────────────────────────────────────────────────
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired — please log in again';
  }

  // ─── Mongoose: CastError ─────────────────────────────────────────────────────
  // Thrown when an invalid ObjectId is passed to findById() etc.
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // Build the standard response
  const response: Record<string, unknown> = {
    success: false,
    message,
    ...(errors.length > 0 && { errors }),
    // Only include stack trace in development — never expose in production
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  };

  res.status(statusCode).json(response);
};
