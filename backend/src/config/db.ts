// This file sets up configurations like the database connection or environment variables.
/**
 * db.ts — MongoDB connection via Mongoose
 *
 * Connects to MongoDB Atlas using the MONGODB_URI from validated env.
 * On failure, the process exits — running without a DB is pointless.
 *
 * Best practices applied:
 * - Single connection per process (Mongoose manages a connection pool internally)
 * - Connection events for observability in development
 * - Exported as a function so tests can skip it and use in-memory MongoDB instead
 */

import mongoose from 'mongoose';
import { env } from './env';
import { logger } from '../utils/logger';

export const connectDB = async (): Promise<void> => {
  try {
    // Mongoose 8+ enables strict mode and buffering by default
    // bufferCommands: false means operations fail immediately if not connected
    // (safer than silently queuing commands)
    const conn = await mongoose.connect(env.MONGODB_URI, {
      bufferCommands: false,
    });

    logger.info(`MongoDB connected: ${conn.connection.host}`);

    // Listen for connection events (useful during development)
    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    mongoose.connection.on('error', (err) => {
      logger.error({ err }, 'MongoDB connection error');
    });
  } catch (error) {
    logger.error({ err: error }, 'Failed to connect to MongoDB');
    // Exit with failure code — let the process manager (PM2/Railway) restart
    process.exit(1);
  }
};

/**
 * Gracefully close the database connection.
 * Used in tests and graceful shutdown handlers.
 */
export const disconnectDB = async (): Promise<void> => {
  await mongoose.disconnect();
  logger.info('MongoDB disconnected gracefully');
};
