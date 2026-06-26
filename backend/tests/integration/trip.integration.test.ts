// This file contains automated tests to verify the correctness of the application code.
/**
 * tests/integration/trip.integration.test.ts — Trip & Nested Budget API Integration Tests
 *
 * Test IDs: API-TRIP-001, API-BUDGET-001, API-BUDGET-002, API-BUDGET-003
 */

import '../setup';
import request from 'supertest';
import app from '../../src/app';
import User from '../../src/models/User';
import Destination from '../../src/models/Destination';
import Trip from '../../src/models/Trip';
import TripMember from '../../src/models/TripMember';
import BudgetEntry from '../../src/models/BudgetEntry';
import jwt from 'jsonwebtoken';
import { env } from '../../src/config/env';

describe('Trip & Budget API Integration Tests', () => {
  let ownerToken: string;
  let ownerId: string;
  let memberToken: string;
  let memberId: string;
  let outsiderToken: string;
  
  let destinationId: string;
  let tripId: string;

  beforeEach(async () => {
    // 1. Create Users
    const owner = await User.create({
      name: 'Owner User',
      email: 'owner@example.com',
      password: '$2b$10$hashedpassword123456789012345678901234567890123456',
      role: 'traveler',
    });
    ownerId = owner._id.toString();
    ownerToken = jwt.sign({ _id: ownerId, role: owner.role }, env.JWT_SECRET);

    const member = await User.create({
      name: 'Member User',
      email: 'member@example.com',
      password: '$2b$10$hashedpassword123456789012345678901234567890123456',
      role: 'traveler',
    });
    memberId = member._id.toString();
    memberToken = jwt.sign({ _id: memberId, role: member.role }, env.JWT_SECRET);

    const outsider = await User.create({
      name: 'Outsider User',
      email: 'outsider@example.com',
      password: '$2b$10$hashedpassword123456789012345678901234567890123456',
      role: 'traveler',
    });
    outsiderToken = jwt.sign({ _id: outsider._id.toString(), role: outsider.role }, env.JWT_SECRET);

    // 2. Create Destination
    const dest = await Destination.create({
      name: 'Goa Coast',
      country: 'India',
      description: 'Sun, sand, and beach shacks in western India.',
    });
    destinationId = dest._id.toString();

    // 3. Create a Group Trip owned by Owner
    const trip = await Trip.create({
      ownerId,
      destinationId,
      title: 'Goa Summer Group',
      tripType: 'group',
      startDate: new Date('2025-10-10'),
      endDate: new Date('2025-10-15'),
      budget: 30000,
    });
    tripId = trip._id.toString();

    // Add owner membership
    await TripMember.create({
      tripId,
      userId: ownerId,
      role: 'owner',
    });

    // Add member membership
    await TripMember.create({
      tripId,
      userId: memberId,
      role: 'member',
    });
  });

  describe('POST /api/trips & GET /api/trips', () => {
    it('API-TRIP-001: creates a new trip successfully and maps owner as member', async () => {
      const res = await request(app)
        .post('/api/trips')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          destinationId,
          title: 'Solo Exploration',
          tripType: 'solo',
          startDate: '2025-11-01',
          endDate: '2025-11-05',
          budget: 15000,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.trip.title).toBe('Solo Exploration');

      // Verify TripMember is created mapping the owner
      const memberCount = await TripMember.countDocuments({ tripId: res.body.trip._id });
      expect(memberCount).toBe(1);
      
      const membership = await TripMember.findOne({ tripId: res.body.trip._id });
      expect(membership!.userId.toString()).toBe(ownerId);
      expect(membership!.role).toBe('owner');
    });

    it('GET /api/trips fetches trips where user is owner or member', async () => {
      // Owner gets the trip
      const ownerRes = await request(app)
        .get('/api/trips')
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(ownerRes.status).toBe(200);
      expect(ownerRes.body.trips).toHaveLength(1);
      expect(ownerRes.body.trips[0].title).toBe('Goa Summer Group');

      // Member gets the trip
      const memberRes = await request(app)
        .get('/api/trips')
        .set('Authorization', `Bearer ${memberToken}`);

      expect(memberRes.status).toBe(200);
      expect(memberRes.body.trips).toHaveLength(1);

      // Outsider does not get the trip
      const outsiderRes = await request(app)
        .get('/api/trips')
        .set('Authorization', `Bearer ${outsiderToken}`);

      expect(outsiderRes.status).toBe(200);
      expect(outsiderRes.body.trips).toHaveLength(0);
    });
  });

  describe('GET & PUT & DELETE /api/trips/:id', () => {
    it('GET /api/trips/:id details resolves for participant and rejects outsider', async () => {
      // Participant
      const res = await request(app)
        .get(`/api/trips/${tripId}`)
        .set('Authorization', `Bearer ${memberToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.trip.title).toBe('Goa Summer Group');

      // Outsider
      const badRes = await request(app)
        .get(`/api/trips/${tripId}`)
        .set('Authorization', `Bearer ${outsiderToken}`);
      
      expect(badRes.status).toBe(403);
    });

    it('PUT /api/trips/:id modifications are only allowed for the owner', async () => {
      // Member tries (forbidden)
      const badRes = await request(app)
        .put(`/api/trips/${tripId}`)
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ title: 'Hacked Title' });
      expect(badRes.status).toBe(403);

      // Owner tries (allowed)
      const res = await request(app)
        .put(`/api/trips/${tripId}`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          destinationId,
          title: 'Goa Summer Group Updated',
          tripType: 'group',
          startDate: '2025-10-10',
          endDate: '2025-10-15',
          budget: 35000,
        });
      expect(res.status).toBe(200);
      expect(res.body.trip.title).toBe('Goa Summer Group Updated');
      expect(res.body.trip.budget).toBe(35000);
    });

    it('DELETE /api/trips/:id cascade deletes members and budget entries', async () => {
      // Add a budget entry first
      await BudgetEntry.create({ tripId, category: 'Food', amount: 100 });

      // Outsider tries (forbidden)
      const badRes = await request(app)
        .delete(`/api/trips/${tripId}`)
        .set('Authorization', `Bearer ${outsiderToken}`);
      expect(badRes.status).toBe(403);

      // Owner deletes (allowed)
      const res = await request(app)
        .delete(`/api/trips/${tripId}`)
        .set('Authorization', `Bearer ${ownerToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Check cascading deletions
      const tripCount = await Trip.countDocuments({ _id: tripId });
      const memberCount = await TripMember.countDocuments({ tripId });
      const entryCount = await BudgetEntry.countDocuments({ tripId });

      expect(tripCount).toBe(0);
      expect(memberCount).toBe(0);
      expect(entryCount).toBe(0);
    });
  });

  describe('Trip Members Management', () => {
    it('POST /api/trips/:id/members invites a user only if request is from owner', async () => {
      const newUser = await User.create({
        name: 'New Invitee',
        email: 'invitee@example.com',
        password: 'password123',
      });

      // Member invites (forbidden)
      const badRes = await request(app)
        .post(`/api/trips/${tripId}/members`)
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ email: newUser.email });
      expect(badRes.status).toBe(403);

      // Owner invites (allowed)
      const res = await request(app)
        .post(`/api/trips/${tripId}/members`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ email: newUser.email });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.member.userId.toString()).toBe(newUser._id.toString());
    });

    it('DELETE /api/trips/:id/members/:userId removes user only if owner request', async () => {
      // Outsider tries (forbidden)
      const badRes = await request(app)
        .delete(`/api/trips/${tripId}/members/${memberId}`)
        .set('Authorization', `Bearer ${outsiderToken}`);
      expect(badRes.status).toBe(403);

      // Owner removes (allowed)
      const res = await request(app)
        .delete(`/api/trips/${tripId}/members/${memberId}`)
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify deletion
      const count = await TripMember.countDocuments({ tripId, userId: memberId });
      expect(count).toBe(0);
    });
  });

  describe('Nested Budget Entries CRUD & Analytics', () => {
    it('API-BUDGET-001: allows trip member to create budget entry', async () => {
      const res = await request(app)
        .post(`/api/trips/${tripId}/budget-entries`)
        .set('Authorization', `Bearer ${memberToken}`)
        .send({
          category: 'Food',
          amount: 1500,
          description: 'Beach shack seafood dinner',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.entry.amount).toBe(1500);

      // Outsider is rejected
      const badRes = await request(app)
        .post(`/api/trips/${tripId}/budget-entries`)
        .set('Authorization', `Bearer ${outsiderToken}`)
        .send({ category: 'Food', amount: 1500 });
      expect(badRes.status).toBe(403);
    });

    it('API-BUDGET-002: rejects budget entry creation if input amount is <= 0', async () => {
      const res = await request(app)
        .post(`/api/trips/${tripId}/budget-entries`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          category: 'Stay',
          amount: -500, // Invalid negative amount
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Validation failed');
    });

    it('API-BUDGET-003: GET /api/trips/:tripId/budget-summary aggregates budget statistics', async () => {
      // Seed budget entries
      await BudgetEntry.create([
        { tripId, category: 'Stay', amount: 10000, description: 'Hotel stay' },
        { tripId, category: 'Food', amount: 3000, description: 'Eats' },
        { tripId, category: 'Transport', amount: 2500, description: 'Train' },
      ]);

      const res = await request(app)
        .get(`/api/trips/${tripId}/budget-summary`)
        .set('Authorization', `Bearer ${memberToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const summary = res.body.summary;
      expect(summary.totalBudget).toBe(30000); // planned budget
      expect(summary.spent).toBe(15500); // sum
      expect(summary.remaining).toBe(14500); // planned - spent
      expect(summary.breakdown.Stay).toBe(10000);
      expect(summary.breakdown.Food).toBe(3000);
      expect(summary.breakdown.Transport).toBe(2500);
    });

    it('DELETE /api/trips/:tripId/budget-entries/:entryId removes expense entry', async () => {
      const entry = await BudgetEntry.create({ tripId, category: 'Other', amount: 120 });

      const res = await request(app)
        .delete(`/api/trips/${tripId}/budget-entries/${entry._id}`)
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const count = await BudgetEntry.countDocuments({ _id: entry._id });
      expect(count).toBe(0);
    });
  });
});
