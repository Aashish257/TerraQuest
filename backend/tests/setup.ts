// This file contains automated tests to verify the correctness of the application code.
/**
 * tests/setup.ts — Per-test-file database connection hooks
 *
 * Imported at the top of each test file.
 * Uses the MongoMemoryServer URI set by globalSetup.ts.
 *
 * beforeAll  → connect Mongoose to the in-memory DB
 * afterEach  → wipe all collections (clean state between tests)
 * afterAll   → disconnect Mongoose
 */

import mongoose from 'mongoose';

// Connect before each test suite
beforeAll(async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI not set. globalSetup must run first.');

  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(uri);
  }
});

// Wipe all collections after each test for isolation
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

// Disconnect after each test file
afterAll(async () => {
  await mongoose.disconnect();
});
