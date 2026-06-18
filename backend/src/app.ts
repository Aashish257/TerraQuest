/**
 * app.ts — Express application definition
 *
 * This file creates and configures the Express app.
 * It does NOT call app.listen() — that's server.ts's job.
 *
 * Separation of concerns:
 * - app.ts: middleware, routes, error handler → importable by tests
 * - server.ts: starts the HTTP server → not imported by tests
 *
 * Middleware order matters in Express:
 * 1. CORS — must be first so preflight OPTIONS requests are handled
 * 2. express.json() — parses request body before routes can access it
 * 3. Routes — business logic
 * 4. 404 handler — after all routes, catches unknown paths
 * 5. Error handler — MUST be last, 4-argument signature
 */

import express, { Request, Response } from 'express';
import cors from 'cors';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import destinationRoutes from './routes/destination.routes';
import tripRoutes from './routes/trip.routes';
import aiRoutes from './routes/ai.routes';

const app = express();

// ─── Security & Parsing Middleware ──────────────────────────────────────────

// CORS: Only allow requests from the configured frontend URL
// In production: restrict to your Vercel domain
// In development: http://localhost:3000
app.use(
  cors({
    origin: env.FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true, // allows cookies if needed in future
  })
);

// Parse incoming JSON request bodies
// limit: 10mb — prevents extremely large payloads (basic DoS protection)
app.use(express.json({ limit: '10mb' }));

// Parse URL-encoded form data (needed for some OAuth flows)
app.use(express.urlencoded({ extended: true }));

// ─── Health Check ────────────────────────────────────────────────────────────
// Simple endpoint to verify the server is running
// Used by Railway/Render health checks and monitoring
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: '🌍 TerraQuest API is running',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
});

// ─── API Routes ──────────────────────────────────────────────────────────────
// Auth, User, Destination, Trip, and AI routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/destinations', destinationRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/ai', aiRoutes);

// Base API route information
app.get('/api', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'TerraQuest API v1',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      destinations: '/api/destinations',
      trips: '/api/trips',
      ai: '/api/ai',
    },
  });
});

// ─── 404 Handler ─────────────────────────────────────────────────────────────
// Catches any request that doesn't match a defined route
// Must come AFTER all route definitions
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// ─── Global Error Handler ────────────────────────────────────────────────────
// Must be the LAST middleware registered
// Express identifies this as an error handler by its 4 parameters
app.use(errorHandler);

export default app;
