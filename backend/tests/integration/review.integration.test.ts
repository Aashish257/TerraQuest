// This file contains automated tests to verify the correctness of the application code.
/**
 * tests/integration/review.integration.test.ts — Review API Integration Tests
 */

import '../setup';
import request from 'supertest';
import app from '../../src/app';
import Destination from '../../src/models/Destination';
import GuideProfile from '../../src/models/GuideProfile';
import Review from '../../src/models/Review';

describe('Review API Integration Tests', () => {
  let travelerToken: string;
  let travelerUserId: string;
  let destinationId: string;
  let guideUserId: string;
  let guideProfileId: string;

  beforeEach(async () => {
    // 1. Register traveler
    const travelerRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Jane Traveler',
        email: 'jane.traveler@example.com',
        password: 'securepassword123',
        role: 'traveler',
      });
    travelerToken = travelerRes.body.token;
    travelerUserId = travelerRes.body.user._id;

    // 2. Register guide and create guide profile
    const guideRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Guide Sam',
        email: 'guide.sam@example.com',
        password: 'securepassword123',
        role: 'guide',
      });
    guideUserId = guideRes.body.user._id;

    const profile = await GuideProfile.create({
      userId: guideUserId,
      experience: 4,
      languages: ['English'],
      expertise: ['Wildlife'],
      location: 'Gir Forest',
    });
    guideProfileId = profile._id.toString();

    // 3. Create destination
    const dest = await Destination.create({
      name: 'Gir Forest',
      country: 'India',
      state: 'Gujarat',
      description: 'Home of the Asiatic lions.',
      bestTimeToVisit: 'November to March',
      budgetRange: '₹3,000 – ₹10,000 per day',
      activities: ['Safari', 'Photography'],
    });
    destinationId = dest._id.toString();
  });

  describe('POST /api/reviews', () => {
    it('creates destination review successfully', async () => {
      const res = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${travelerToken}`)
        .send({
          targetId: destinationId,
          targetType: 'destination',
          rating: 5,
          comment: 'We saw three lions! Amazing experience.',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.targetId).toBe(destinationId);
      expect(res.body.data.targetType).toBe('destination');
      expect(res.body.data.rating).toBe(5);
    });

    it('returns 400 when validation constraints fail (e.g. comment too short)', async () => {
      const res = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${travelerToken}`)
        .send({
          targetId: destinationId,
          targetType: 'destination',
          rating: 4,
          comment: 'Short', // Less than 10 chars
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Validation failed');
    });

    it('returns 404 when destination target does not exist', async () => {
      const fakeId = '609b24479f64a4b27c9b8899';
      const res = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${travelerToken}`)
        .send({
          targetId: fakeId,
          targetType: 'destination',
          rating: 4,
          comment: 'A lovely place in my dreams.',
        });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Destination not found');
    });

    it('creates guide review and recalculates GuideProfile rating dynamically', async () => {
      // 1. Submit first review (rating = 5)
      let res = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${travelerToken}`)
        .send({
          targetId: guideUserId, // targetId for guide reviews is their userId
          targetType: 'guide',
          rating: 5,
          comment: 'Sam was an incredibly knowledgeable guide!',
        });

      expect(res.status).toBe(201);
      
      let profile = await GuideProfile.findOne({ userId: guideUserId });
      expect(profile!.rating).toBe(5.0);
      expect(profile!.totalReviews).toBe(1);

      // 2. Register second traveler and submit second review (rating = 4)
      const traveler2Res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Bob Traveler',
          email: 'bob.traveler@example.com',
          password: 'securepassword123',
          role: 'traveler',
        });
      const traveler2Token = traveler2Res.body.token;

      res = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${traveler2Token}`)
        .send({
          targetId: guideUserId,
          targetType: 'guide',
          rating: 4,
          comment: 'Very professional, though safari was late.',
        });
      
      expect(res.status).toBe(201);

      profile = await GuideProfile.findOne({ userId: guideUserId });
      expect(profile!.rating).toBe(4.5); // Average of 5 and 4
      expect(profile!.totalReviews).toBe(2);
    });
  });

  describe('GET /api/reviews', () => {
    beforeEach(async () => {
      // Create some reviews for the destination
      await Review.create({
        userId: travelerUserId,
        targetId: destinationId,
        targetType: 'destination',
        rating: 5,
        comment: 'Absolutely stunning! Loved every bit of Gir Forest safari.',
      });

      await Review.create({
        userId: travelerUserId,
        targetId: destinationId,
        targetType: 'destination',
        rating: 3,
        comment: 'It was okay. Too hot in the afternoon hours.',
      });
    });

    it('returns lists of reviews with hydrated user profiles', async () => {
      const res = await request(app)
        .get(`/api/reviews?targetId=${destinationId}&targetType=destination`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.reviews).toHaveLength(2);
      expect(res.body.reviews[0].userId.name).toBe('Jane Traveler');
      expect(res.body.reviews[0].comment).toBeDefined();
    });

    it('fails when query parameters are missing', async () => {
      const res = await request(app).get('/api/reviews');
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
});
