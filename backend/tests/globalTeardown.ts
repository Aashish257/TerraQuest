// This file contains automated tests to verify the correctness of the application code.
/**
 * tests/globalTeardown.ts
 *
 * Runs ONCE after all test suites complete.
 * Stops the MongoMemoryServer that was started in globalSetup.ts.
 */

import { MongoMemoryServer } from 'mongodb-memory-server';

// @ts-ignore
declare const global: typeof globalThis & { __MONGO_SERVER__: MongoMemoryServer };

export default async function globalTeardown() {
  if (global.__MONGO_SERVER__) {
    await global.__MONGO_SERVER__.stop();
    console.log('\n🧪 MongoMemoryServer stopped');
  }
}
