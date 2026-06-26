// This file contains automated tests to verify the correctness of the application code.
/**
 * tests/integration/destination.integration.test.ts — Destinations API Integration Tests
 *
 * Test IDs: API-DEST-001, API-DEST-002, API-DEST-003
 */

import '../setup';
import request from 'supertest';
import app from '../../src/app';
import Destination from '../../src/models/Destination';

describe('Destinations API Integration Tests', () => {
  let destLowId: string;
  let destMedId: string;
  let destHighId: string;

  beforeEach(async () => {
    // 1. Create a low budget destination
    const low = await Destination.create({
      name: 'Rishikesh Beach',
      country: 'India',
      state: 'Uttarakhand',
      description: 'Yoga capital of the world and white-water rafting haven.',
      bestTimeToVisit: 'September to April',
      budgetRange: '₹1,500 – ₹8,000 per day', // Min: 1500 (low < 2500)
      activities: ['Yoga', 'River Rafting', 'Trekking'],
      images: [],
      featured: true,
    });
    destLowId = low._id.toString();

    // 2. Create a medium budget destination
    const med = await Destination.create({
      name: 'Manali Mountains',
      country: 'India',
      state: 'Himachal Pradesh',
      description: 'Mountain paradise with snow-capped peaks and valleys.',
      bestTimeToVisit: 'October to June',
      budgetRange: '₹3,000 – ₹15,000 per day', // Min: 3000 (med >= 2500 && < 4000)
      activities: ['Trekking', 'Skiing', 'Camping'],
      images: [],
      featured: false,
    });
    destMedId = med._id.toString();

    // 3. Create a high budget destination
    const high = await Destination.create({
      name: 'Goa Luxury Resorts',
      country: 'India',
      state: 'Goa',
      description: 'High-end luxury beach resort experience on the coast.',
      bestTimeToVisit: 'November to February',
      budgetRange: '₹5,000 – ₹20,000 per day', // Min: 5000 (high >= 4000)
      activities: ['Beach', 'Nightlife', 'Luxury Stay'],
      images: [],
      featured: true,
    });
    destHighId = high._id.toString();
  });

  describe('GET /api/destinations', () => {
    it('API-DEST-001: returns list of all destinations with success status', async () => {
      const res = await request(app).get('/api/destinations');
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.destinations).toHaveLength(3);
      expect(res.body.pagination.total).toBe(3);
    });

    it('filters destinations by search text query (name/activities indexing)', async () => {
      // Note: text index might not search sub-strings inside Jest unless full words match.
      // But we can check for full word queries like 'Rishikesh' or 'Luxury'.
      const res = await request(app).get('/api/destinations?search=Rishikesh');
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.destinations.length).toBeGreaterThan(0);
      expect(res.body.destinations[0].name).toContain('Rishikesh');
    });

    it('filters destinations by activity query', async () => {
      const res = await request(app).get('/api/destinations?activity=Skiing');
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.destinations).toHaveLength(1);
      expect(res.body.destinations[0].name).toContain('Manali');
    });

    it('filters destinations by budget level query', async () => {
      // 1. Low budget filter
      const lowRes = await request(app).get('/api/destinations?budget=low');
      expect(lowRes.status).toBe(200);
      expect(lowRes.body.destinations).toHaveLength(1);
      expect(lowRes.body.destinations[0].name).toContain('Rishikesh');

      // 2. Medium budget filter
      const medRes = await request(app).get('/api/destinations?budget=medium');
      expect(medRes.status).toBe(200);
      expect(medRes.body.destinations).toHaveLength(1);
      expect(medRes.body.destinations[0].name).toContain('Manali');

      // 3. High budget filter
      const highRes = await request(app).get('/api/destinations?budget=high');
      expect(highRes.status).toBe(200);
      expect(highRes.body.destinations).toHaveLength(1);
      expect(highRes.body.destinations[0].name).toContain('Goa');
    });

    it('paginates results correctly using page and limit query params', async () => {
      const res = await request(app).get('/api/destinations?page=1&limit=2');
      
      expect(res.status).toBe(200);
      expect(res.body.destinations).toHaveLength(2);
      expect(res.body.pagination.totalPages).toBe(2);
      expect(res.body.pagination.page).toBe(1);
      expect(res.body.pagination.limit).toBe(2);
    });
  });

  describe('GET /api/destinations/:id', () => {
    it('API-DEST-002: returns details of a single valid destination', async () => {
      const res = await request(app).get(`/api/destinations/${destLowId}`);
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.destination.name).toBe('Rishikesh Beach');
      expect(res.body.destination.budgetRange).toBe('₹1,500 – ₹8,000 per day');
    });

    it('API-DEST-003: returns 404 error when destination ID does not exist', async () => {
      // Use a valid format ObjectId but non-existent
      const fakeId = '609b24479f64a4b27c9b8899';
      const res = await request(app).get(`/api/destinations/${fakeId}`);
      
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Destination not found');
    });
  });

  describe('GET /api/destinations/:id/hidden-places', () => {
    it('returns 200 with empty hidden-places array (P1 compliance placeholder)', async () => {
      const res = await request(app).get(`/api/destinations/${destLowId}/hidden-places`);
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(0);
      expect(res.body.hiddenPlaces).toEqual([]);
    });
  });
});
