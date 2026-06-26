// This file contains automated tests to verify the correctness of the application code.
/**
 * tests/integration/guide.integration.test.ts — Guide Profile API Integration Tests
 */

import '../setup';
import request from 'supertest';
import app from '../../src/app';
import User from '../../src/models/User';
import GuideProfile from '../../src/models/GuideProfile';

describe('Guide Profile API Integration Tests', () => {
  let guideToken: string;
  let guideUserId: string;
  let anotherGuideToken: string;
  let anotherGuideUserId: string;
  let travelerToken: string;
  let profileId: string;

  beforeEach(async () => {
    // 1. Create a user with 'guide' role
    const guideUserRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Guide Alpha',
        email: 'guide.alpha@example.com',
        password: 'securepassword123',
        role: 'guide',
      });
    guideToken = guideUserRes.body.token;
    guideUserId = guideUserRes.body.user._id;

    // 2. Create another user with 'guide' role
    const anotherGuideUserRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Guide Beta',
        email: 'guide.beta@example.com',
        password: 'securepassword123',
        role: 'guide',
      });
    anotherGuideToken = anotherGuideUserRes.body.token;
    anotherGuideUserId = anotherGuideUserRes.body.user._id;

    // 3. Create a user with 'traveler' role
    const travelerUserRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Traveler One',
        email: 'traveler.one@example.com',
        password: 'securepassword123',
        role: 'traveler',
      });
    travelerToken = travelerUserRes.body.token;
  });

  describe('POST /api/guides', () => {
    it('creates guide profile successfully for users with guide role', async () => {
      const res = await request(app)
        .post('/api/guides')
        .set('Authorization', `Bearer ${guideToken}`)
        .send({
          experience: 5,
          languages: ['English', 'Hindi'],
          expertise: ['Trekking', 'Culture'],
          location: 'Manali',
          bio: 'Passionate mountain explorer.',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.userId).toBe(guideUserId);
      expect(res.body.data.experience).toBe(5);
      expect(res.body.data.location).toBe('Manali');
      profileId = res.body.data._id;
    });

    it('returns 403 Forbidden for users without guide role', async () => {
      const res = await request(app)
        .post('/api/guides')
        .set('Authorization', `Bearer ${travelerToken}`)
        .send({
          experience: 2,
          languages: ['English'],
          expertise: ['Food'],
          location: 'Goa',
          bio: 'I am not a guide.',
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Forbidden');
    });

    it('returns 409 Conflict if guide profile already exists', async () => {
      // Create first profile
      await request(app)
        .post('/api/guides')
        .set('Authorization', `Bearer ${guideToken}`)
        .send({
          experience: 5,
          languages: ['English'],
          expertise: ['Culture'],
          location: 'Manali',
        });

      // Try creating second profile
      const res = await request(app)
        .post('/api/guides')
        .set('Authorization', `Bearer ${guideToken}`)
        .send({
          experience: 3,
          languages: ['Hindi'],
          expertise: ['Food'],
          location: 'Goa',
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('already exists');
    });
  });

  describe('GET /api/guides', () => {
    beforeEach(async () => {
      // Seed some guide profiles
      await GuideProfile.create({
        userId: guideUserId,
        experience: 5,
        languages: ['English', 'Hindi'],
        expertise: ['Trekking'],
        location: 'Manali',
        rating: 4.5,
        totalReviews: 2,
      });

      await GuideProfile.create({
        userId: anotherGuideUserId,
        experience: 8,
        languages: ['English', 'German'],
        expertise: ['Heritage'],
        location: 'Jaipur',
        rating: 3.8,
        totalReviews: 4,
      });
    });

    it('lists all guides with user hydration details', async () => {
      const res = await request(app).get('/api/guides');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.guides).toHaveLength(2);
      expect(res.body.guides[0].userId.name).toBeDefined();
      expect(res.body.guides[0].userId.email).toBeDefined();
    });

    it('filters guides by location', async () => {
      const res = await request(app).get('/api/guides?location=Manali');

      expect(res.status).toBe(200);
      expect(res.body.guides).toHaveLength(1);
      expect(res.body.guides[0].location).toBe('Manali');
    });

    it('filters guides by minimum rating threshold', async () => {
      const res = await request(app).get('/api/guides?rating=4.0');

      expect(res.status).toBe(200);
      expect(res.body.guides).toHaveLength(1);
      expect(res.body.guides[0].rating).toBe(4.5);
    });
  });

  describe('GET /api/guides/:id', () => {
    let guideProfile: any;

    beforeEach(async () => {
      guideProfile = await GuideProfile.create({
        userId: guideUserId,
        experience: 5,
        languages: ['English'],
        expertise: ['Trekking'],
        location: 'Manali',
        rating: 4.8,
        totalReviews: 10,
      });
    });

    it('fetches guide details by GuideProfile _id', async () => {
      const res = await request(app).get(`/api/guides/${guideProfile._id}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.guide.location).toBe('Manali');
      expect(res.body.guide.userId.name).toBe('Guide Alpha');
    });

    it('fetches guide details by User ID (userId fallback)', async () => {
      const res = await request(app).get(`/api/guides/${guideUserId}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.guide._id.toString()).toBe(guideProfile._id.toString());
    });

    it('returns 404 for non-existent guide ID', async () => {
      const fakeId = '609b24479f64a4b27c9b8899';
      const res = await request(app).get(`/api/guides/${fakeId}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PUT /api/guides/:id', () => {
    let guideProfile: any;

    beforeEach(async () => {
      guideProfile = await GuideProfile.create({
        userId: guideUserId,
        experience: 5,
        languages: ['English'],
        expertise: ['Trekking'],
        location: 'Manali',
      });
    });

    it('updates guide profile successfully if owned by requesting guide', async () => {
      const res = await request(app)
        .put(`/api/guides/${guideProfile._id}`)
        .set('Authorization', `Bearer ${guideToken}`)
        .send({
          experience: 6,
          location: 'Shimla',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.experience).toBe(6);
      expect(res.body.data.location).toBe('Shimla');
    });

    it('returns 403 Forbidden when trying to update another guide profile', async () => {
      const res = await request(app)
        .put(`/api/guides/${guideProfile._id}`)
        .set('Authorization', `Bearer ${anotherGuideToken}`)
        .send({
          experience: 10,
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Forbidden');
    });
  });
});
