// This file contains automated tests to verify the correctness of the application code.
/**
 * tests/integration/ai.integration.test.ts — AI Planner Integration Tests
 *
 * Test IDs: API-AI-001, API-AI-002, API-AI-003
 */

import '../setup';
import request from 'supertest';
import app from '../../src/app';
import User from '../../src/models/User';
import Destination from '../../src/models/Destination';
import AIPlan from '../../src/models/AIPlan';
import jwt from 'jsonwebtoken';
import { env } from '../../src/config/env';

describe('AI Planner API Integration Tests', () => {
  let userToken: string;
  let userId: string;
  let destinationId: string;
  let originalKey: string | undefined;

  beforeAll(() => {
    originalKey = process.env.GEMINI_API_KEY;
  });

  afterAll(() => {
    process.env.GEMINI_API_KEY = originalKey;
  });

  beforeEach(async () => {
    // 1. Create a user
    const user = await User.create({
      name: 'Plan Traveler',
      email: 'planner@example.com',
      password: 'password123',
    });
    userId = user._id.toString();
    userToken = jwt.sign({ _id: userId, role: user.role }, env.JWT_SECRET);

    // 2. Create a destination
    const dest = await Destination.create({
      name: 'Kerala Backwaters',
      country: 'India',
      description: 'Lush palm-fringed houseboats and canals.',
    });
    destinationId = dest._id.toString();

    // Reset API key to default dummy if not present
    process.env.GEMINI_API_KEY = 'dummy_key';
  });

  describe('POST /api/ai/generate', () => {
    it('API-AI-001: generates and saves travel plan successfully', async () => {
      const res = await request(app)
        .post('/api/ai/generate')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          destinationId,
          budget: 15000,
          duration: 4,
          interests: ['Nature', 'Food'],
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.planId).toBeDefined();
      expect(res.body.generatedPlan).toContain('Kerala Backwaters');
      expect(res.body.generatedPlan).toContain('Day 4');

      // Verify stored in DB
      const storedPlan = await AIPlan.findById(res.body.planId);
      expect(storedPlan).toBeDefined();
      expect(storedPlan!.userId.toString()).toBe(userId);
      expect(storedPlan!.budget).toBe(15000);
    });

    it('API-AI-002: returns 400 when validation rules fail', async () => {
      // Invalid destinationId ObjectId format
      const res1 = await request(app)
        .post('/api/ai/generate')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          destinationId: 'not-an-object-id',
          budget: 15000,
          duration: 4,
          interests: ['Nature'],
        });
      expect(res1.status).toBe(400);

      // Duration out of bounds (31 days)
      const res2 = await request(app)
        .post('/api/ai/generate')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          destinationId,
          budget: 15000,
          duration: 31,
          interests: ['Nature'],
        });
      expect(res2.status).toBe(400);

      // Negative budget
      const res3 = await request(app)
        .post('/api/ai/generate')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          destinationId,
          budget: -10,
          duration: 4,
          interests: ['Nature'],
        });
      expect(res3.status).toBe(400);
    });

    it('API-AI-003: returns 503 when Gemini service fails', async () => {
      // Set mock failure key
      process.env.GEMINI_API_KEY = 'mock_key_fail';

      const res = await request(app)
        .post('/api/ai/generate')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          destinationId,
          budget: 20000,
          duration: 5,
          interests: ['Culture'],
        });

      expect(res.status).toBe(503);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('AI service unavailable');
    });
  });

  describe('GET /api/ai/plans', () => {
    it('fetches list of saved plans and details correctly', async () => {
      // Create two mock plans in DB
      const plan1 = await AIPlan.create({
        userId,
        destinationId,
        budget: 10000,
        duration: 3,
        interests: ['Culture'],
        generatedPlan: 'Day 1: Old temples. Day 2: Museum. Day 3: Market.',
      });

      const plan2 = await AIPlan.create({
        userId,
        destinationId,
        budget: 30000,
        duration: 7,
        interests: ['Adventure'],
        generatedPlan: 'Day 1-7: Treks and peaks.',
      });

      // Get history
      const listRes = await request(app)
        .get('/api/ai/plans')
        .set('Authorization', `Bearer ${userToken}`);

      expect(listRes.status).toBe(200);
      expect(listRes.body.success).toBe(true);
      expect(listRes.body.count).toBe(2);
      expect(listRes.body.plans[0].destinationId.name).toBe('Kerala Backwaters');

      // Get detail
      const detailRes = await request(app)
        .get(`/api/ai/plans/${plan1._id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(detailRes.status).toBe(200);
      expect(detailRes.body.success).toBe(true);
      expect(detailRes.body.plan.budget).toBe(10000);
      expect(detailRes.body.plan.generatedPlan).toContain('Old temples');
    });

    it('rejects access to another user\'s plan', async () => {
      const plan = await AIPlan.create({
        userId: new User({ name: 'Another', email: 'another@ex.com', password: 'password123' })._id,
        destinationId,
        budget: 10000,
        duration: 3,
        interests: ['Culture'],
        generatedPlan: 'Secret itinerary',
      });

      const res = await request(app)
        .get(`/api/ai/plans/${plan._id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });
  });
});
