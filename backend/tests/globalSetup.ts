// This file contains automated tests to verify the correctness of the application code.
/**
 * tests/globalSetup.ts
 *
 * Runs ONCE before all test suites.
 * Starts MongoMemoryServer and stores the URI in process.env
 * so individual test files can connect to it.
 *
 * Note: jest globals (describe, it, beforeAll) are NOT available here.
 */

process.env.MONGOMS_STARTUP_TIMEOUT = '60000';
import { MongoMemoryServer } from 'mongodb-memory-server';

// @ts-ignore — global is available in Node
declare const global: typeof globalThis & { __MONGO_SERVER__: MongoMemoryServer };

export default async function globalSetup() {
  const mongoServer = await MongoMemoryServer.create({
    instance: {
      launchTimeout: 60000,
    },
  });
  const mongoUri = mongoServer.getUri();

  // Store on global so globalTeardown can stop it
  global.__MONGO_SERVER__ = mongoServer;

  // Store URI in environment so tests can connect
  process.env.MONGODB_URI_TEST = mongoUri;

  // Also set the JWT_SECRET and other required env vars for tests
  process.env.MONGODB_URI = mongoUri;
  process.env.JWT_SECRET = 'test-jwt-secret-that-is-long-enough-32chars!';
  process.env.JWT_EXPIRES_IN = '7d';
  process.env.FRONTEND_URL = 'http://localhost:3000';
  process.env.NODE_ENV = 'test';

  console.log(`\n🧪 MongoMemoryServer started: ${mongoUri}`);
}
