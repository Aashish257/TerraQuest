/**
 * server.ts — HTTP Server startup
 *
 * This is the entry point that starts the Node.js HTTP server.
 * It is NOT imported by tests — tests use app.ts directly via supertest.
 *
 * Order of operations:
 * 1. Load .env (dotenv must be called BEFORE any env access)
 * 2. Validate environment variables (env.ts — exits if invalid)
 * 3. Connect to MongoDB
 * 4. Start listening on PORT
 * 5. Set up graceful shutdown handlers
 */

import 'dotenv/config'; // loads .env into process.env
import { env } from './config/env'; // validates env — exits if invalid
import { connectDB, disconnectDB } from './config/db';
import app from './app';
import http from 'http';
import { logger } from './utils/logger';

const PORT = env.PORT;

// Create HTTP server — wrapping app allows us to close it programmatically
const server = http.createServer(app);

const startServer = async (): Promise<void> => {
  try {
    // Connect to MongoDB before accepting requests
    await connectDB();

    server.listen(PORT, () => {
      logger.info({ env: env.NODE_ENV, port: PORT }, `TerraQuest API Server started on port ${PORT}`);
    });
  } catch (error) {
    logger.error({ err: error }, 'Failed to start server');
    process.exit(1);
  }
};

// ─── Graceful Shutdown ────────────────────────────────────────────────────────
// Handles SIGTERM (from Railway/Render on deploy) and SIGINT (Ctrl+C in dev)
const gracefulShutdown = async (signal: string): Promise<void> => {
  logger.info(`${signal} received — shutting down gracefully...`);

  server.close(async () => {
    logger.info('HTTP server closed');
    await disconnectDB();
    logger.info('TerraQuest API shut down complete');
    process.exit(0);
  });

  // Force shutdown if graceful close takes too long
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// ─── Unhandled Error Safety Net ───────────────────────────────────────────────
process.on('unhandledRejection', (reason: unknown) => {
  logger.error({ reason }, 'Unhandled Promise Rejection');
  // Don't exit — log and continue. Railway will restart if needed.
});

process.on('uncaughtException', (error: Error) => {
  logger.error({ err: error }, 'Uncaught Exception');
  process.exit(1); // Uncaught exceptions leave the app in unknown state — must restart
});

startServer();
