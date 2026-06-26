// This file contains automated tests to verify the correctness of the application code.
/**
 * tests/unit/models.test.ts — Mongoose Model Unit Tests
 *
 * Tests verify:
 * 1. Valid documents are created successfully
 * 2. Required fields are enforced
 * 3. Enum constraints are enforced
 * 4. Custom validators (minlength, min, max) work
 * 5. Pre-save hooks fire correctly (Trip date validation)
 * 6. Indexes are configured (compound unique on TripMember)
 *
 * Test IDs follow the project's naming convention (from 06-TESTING-STRATEGY.md):
 * MODEL-UT-001, MODEL-UT-002, etc.
 */

// IMPORTANT: Import setup FIRST — registers beforeAll/afterEach/afterAll hooks
import '../setup';

import mongoose from 'mongoose';

import User from '../../src/models/User';
import Destination from '../../src/models/Destination';
import GuideProfile from '../../src/models/GuideProfile';
import Trip from '../../src/models/Trip';
import TripMember from '../../src/models/TripMember';
import BudgetEntry from '../../src/models/BudgetEntry';
import Review from '../../src/models/Review';
import AIPlan from '../../src/models/AIPlan';

// ─── Helper: create a valid destination for use in trip tests ──────────────
const createDestination = async () => {
  return Destination.create({
    name: 'Goa',
    country: 'India',
    state: 'Goa',
    description: 'Sun, sand, and vibrant nightlife on the coast.',
  });
};

// ─── Helper: create a valid user ──────────────────────────────────────────
const createUser = async (email = 'test@example.com', role = 'traveler') => {
  return User.create({
    name: 'Test User',
    email,
    password: '$2b$10$hashedpassword123456789012345678901234567890123456',
    role,
  });
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// USER MODEL TESTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe('User Model', () => {
  it('MODEL-UT-001: creates a valid user successfully', async () => {
    const user = await createUser();
    expect(user._id).toBeDefined();
    expect(user.name).toBe('Test User');
    expect(user.email).toBe('test@example.com');
    expect(user.role).toBe('traveler');
    expect(user.isActive).toBe(true);
    expect(user.travelDNA).toEqual([]);
  });

  it('MODEL-UT-002: requires name field', async () => {
    const user = new User({ email: 'a@b.com', password: 'pass12345', role: 'traveler' });
    await expect(user.save()).rejects.toThrow(/Name is required/);
  });

  it('MODEL-UT-003: requires email field', async () => {
    const user = new User({ name: 'Alice', password: 'pass12345', role: 'traveler' });
    await expect(user.save()).rejects.toThrow(/Email is required/);
  });

  it('MODEL-UT-004: enforces unique email', async () => {
    await createUser('dup@example.com');
    await expect(createUser('dup@example.com')).rejects.toThrow();
  });

  it('MODEL-UT-005: rejects invalid role enum', async () => {
    const user = new User({
      name: 'Alice',
      email: 'alice@example.com',
      password: 'pass12345',
      role: 'superuser', // invalid
    });
    await expect(user.save()).rejects.toThrow(/Role must be traveler, guide, or admin/);
  });

  it('MODEL-UT-006: defaults role to traveler', async () => {
    const user = await User.create({
      name: 'Bob',
      email: 'bob@example.com',
      password: '$2b$10$hashedpassword123456789012345678901234567890123456',
    });
    expect(user.role).toBe('traveler');
  });

  it('MODEL-UT-007: stores travelDNA as array', async () => {
    const user = await User.create({
      name: 'Traveler',
      email: 'traveler@example.com',
      password: '$2b$10$hashedpassword123456789012345678901234567890123456',
      travelDNA: ['adventure', 'food', 'culture'],
    });
    expect(user.travelDNA).toHaveLength(3);
    expect(user.travelDNA).toContain('adventure');
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DESTINATION MODEL TESTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe('Destination Model', () => {
  it('MODEL-UT-010: creates a valid destination', async () => {
    const dest = await createDestination();
    expect(dest._id).toBeDefined();
    expect(dest.name).toBe('Goa');
    expect(dest.featured).toBe(false); // default
  });

  it('MODEL-UT-011: requires name', async () => {
    const dest = new Destination({ country: 'India', description: 'A long enough description here.' });
    await expect(dest.save()).rejects.toThrow(/Destination name is required/);
  });

  it('MODEL-UT-012: requires description with min length', async () => {
    const dest = new Destination({ name: 'Place', country: 'India', description: 'Short' });
    await expect(dest.save()).rejects.toThrow(/at least 20 characters/);
  });

  it('MODEL-UT-013: stores activities array', async () => {
    const dest = await Destination.create({
      name: 'Manali',
      country: 'India',
      description: 'Mountain paradise for adventure seekers in the Himalayas.',
      activities: ['Trekking', 'Skiing', 'Camping'],
    });
    expect(dest.activities).toHaveLength(3);
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GUIDE PROFILE TESTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe('GuideProfile Model', () => {
  it('MODEL-UT-020: creates a valid guide profile', async () => {
    const user = await createUser('guide@example.com', 'guide');
    const profile = await GuideProfile.create({
      userId: user._id,
      experience: 5,
      languages: ['English', 'Hindi'],
      expertise: ['Trekking', 'Photography'],
      location: 'Manali',
      bio: 'Professional trekking guide with 5 years of experience.',
    });
    expect(profile.userId.toString()).toBe(user._id.toString());
    expect(profile.rating).toBe(0); // default
    expect(profile.totalReviews).toBe(0); // default
  });

  it('MODEL-UT-021: enforces unique userId (one profile per guide)', async () => {
    const user = await createUser('guide2@example.com', 'guide');
    await GuideProfile.create({ userId: user._id, location: 'Goa' });
    await expect(
      GuideProfile.create({ userId: user._id, location: 'Mumbai' })
    ).rejects.toThrow();
  });

  it('MODEL-UT-022: rating cannot exceed 5', async () => {
    const user = await createUser('guide3@example.com', 'guide');
    const profile = new GuideProfile({ userId: user._id, rating: 6 });
    await expect(profile.save()).rejects.toThrow(/Rating cannot exceed 5/);
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TRIP MODEL TESTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe('Trip Model', () => {
  let userId: mongoose.Types.ObjectId;
  let destinationId: mongoose.Types.ObjectId;

  beforeEach(async () => {
    const user = await createUser('tripper@example.com');
    const dest = await createDestination();
    userId = user._id as mongoose.Types.ObjectId;
    destinationId = dest._id as mongoose.Types.ObjectId;
  });

  it('MODEL-UT-030: creates a valid trip', async () => {
    const trip = await Trip.create({
      ownerId: userId,
      destinationId,
      title: 'Goa Beach Trip',
      tripType: 'solo',
      startDate: new Date('2025-12-20'),
      endDate: new Date('2025-12-27'),
      budget: 25000,
    });
    expect(trip._id).toBeDefined();
    expect(trip.status).toBe('planning'); // default
  });

  it('MODEL-UT-031: rejects endDate before startDate (pre-save hook)', async () => {
    await expect(
      Trip.create({
        ownerId: userId,
        destinationId,
        title: 'Invalid Trip',
        tripType: 'group',
        startDate: new Date('2025-12-27'),
        endDate: new Date('2025-12-20'), // end BEFORE start
        budget: 10000,
      })
    ).rejects.toThrow(/endDate must be after startDate/);
  });

  it('MODEL-UT-032: rejects negative budget', async () => {
    const trip = new Trip({
      ownerId: userId,
      destinationId,
      title: 'Cheap Trip',
      tripType: 'solo',
      startDate: new Date('2025-12-20'),
      endDate: new Date('2025-12-27'),
      budget: -500, // invalid
    });
    await expect(trip.save()).rejects.toThrow(/Budget cannot be negative/);
  });

  it('MODEL-UT-033: rejects invalid tripType', async () => {
    const trip = new Trip({
      ownerId: userId,
      destinationId,
      title: 'Corporate Trip',
      tripType: 'corporate', // invalid
      startDate: new Date('2025-12-20'),
      endDate: new Date('2025-12-27'),
      budget: 50000,
    });
    await expect(trip.save()).rejects.toThrow(/tripType must be solo or group/);
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TRIP MEMBER TESTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe('TripMember Model', () => {
  it('MODEL-UT-040: prevents duplicate membership (compound unique index)', async () => {
    const user = await createUser('member@example.com');
    const dest = await createDestination();
    const trip = await Trip.create({
      ownerId: user._id,
      destinationId: dest._id,
      title: 'Group Trip',
      tripType: 'group',
      startDate: new Date('2025-12-20'),
      endDate: new Date('2025-12-27'),
      budget: 30000,
    });

    await TripMember.create({ tripId: trip._id, userId: user._id, role: 'owner' });
    await expect(
      TripMember.create({ tripId: trip._id, userId: user._id, role: 'member' })
    ).rejects.toThrow();
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// BUDGET ENTRY TESTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe('BudgetEntry Model', () => {
  it('MODEL-UT-050: creates a valid budget entry', async () => {
    const user = await createUser('budget@example.com');
    const dest = await createDestination();
    const trip = await Trip.create({
      ownerId: user._id,
      destinationId: dest._id,
      title: 'Budget Trip',
      tripType: 'solo',
      startDate: new Date('2025-12-20'),
      endDate: new Date('2025-12-27'),
      budget: 10000,
    });

    const entry = await BudgetEntry.create({
      tripId: trip._id,
      category: 'Food',
      amount: 800,
      description: 'Beach shack dinner',
    });

    expect(entry.category).toBe('Food');
    expect(entry.amount).toBe(800);
  });

  it('MODEL-UT-051: rejects invalid category', async () => {
    const entry = new BudgetEntry({
      tripId: new mongoose.Types.ObjectId(),
      category: 'Shopping', // not in enum
      amount: 1000,
    });
    await expect(entry.save()).rejects.toThrow(/Invalid budget category/);
  });

  it('MODEL-UT-052: rejects zero amount', async () => {
    const entry = new BudgetEntry({
      tripId: new mongoose.Types.ObjectId(),
      category: 'Food',
      amount: 0, // must be > 0
    });
    await expect(entry.save()).rejects.toThrow(/Amount must be greater than 0/);
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// REVIEW MODEL TESTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe('Review Model', () => {
  it('MODEL-UT-060: creates a valid review', async () => {
    const review = await Review.create({
      userId: new mongoose.Types.ObjectId(),
      targetId: new mongoose.Types.ObjectId(),
      targetType: 'destination',
      rating: 4,
      comment: 'Beautiful beach destination with great food.',
    });
    expect(review.rating).toBe(4);
    expect(review.targetType).toBe('destination');
  });

  it('MODEL-UT-061: rejects rating below 1', async () => {
    const review = new Review({
      userId: new mongoose.Types.ObjectId(),
      targetId: new mongoose.Types.ObjectId(),
      targetType: 'guide',
      rating: 0,
      comment: 'This is a valid comment that is long enough.',
    });
    await expect(review.save()).rejects.toThrow(/Rating must be at least 1/);
  });

  it('MODEL-UT-062: rejects rating above 5', async () => {
    const review = new Review({
      userId: new mongoose.Types.ObjectId(),
      targetId: new mongoose.Types.ObjectId(),
      targetType: 'destination',
      rating: 6,
      comment: 'This is a valid comment that is long enough.',
    });
    await expect(review.save()).rejects.toThrow(/Rating cannot exceed 5/);
  });

  it('MODEL-UT-063: rejects short comment', async () => {
    const review = new Review({
      userId: new mongoose.Types.ObjectId(),
      targetId: new mongoose.Types.ObjectId(),
      targetType: 'destination',
      rating: 3,
      comment: 'Short', // less than 10 chars
    });
    await expect(review.save()).rejects.toThrow(/at least 10 characters/);
  });

  it('MODEL-UT-064: rejects invalid targetType', async () => {
    const review = new Review({
      userId: new mongoose.Types.ObjectId(),
      targetId: new mongoose.Types.ObjectId(),
      targetType: 'trip', // not in enum
      rating: 4,
      comment: 'This is a valid comment that is long enough.',
    });
    await expect(review.save()).rejects.toThrow(/targetType must be destination or guide/);
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// AI PLAN MODEL TESTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe('AIPlan Model', () => {
  it('MODEL-UT-070: creates a valid AI plan', async () => {
    const plan = await AIPlan.create({
      userId: new mongoose.Types.ObjectId(),
      destinationId: new mongoose.Types.ObjectId(),
      budget: 20000,
      duration: 5,
      interests: ['adventure', 'food'],
      generatedPlan: '# Day 1\nArrive in Goa. Check into your hotel...',
    });
    expect(plan.duration).toBe(5);
    expect(plan.interests).toContain('adventure');
  });

  it('MODEL-UT-071: rejects duration exceeding 30 days', async () => {
    const plan = new AIPlan({
      userId: new mongoose.Types.ObjectId(),
      destinationId: new mongoose.Types.ObjectId(),
      budget: 50000,
      duration: 31, // exceeds max
      interests: [],
      generatedPlan: 'A very long plan...',
    });
    await expect(plan.save()).rejects.toThrow(/cannot exceed 30 days/);
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HEALTH CHECK — APP ROUTE TEST
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import request from 'supertest';
import app from '../../src/app';

describe('Health Check Endpoint', () => {
  it('GET /health returns 200', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('TerraQuest');
  });

  it('GET /api returns 200', async () => {
    const res = await request(app).get('/api');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('Unknown route returns 404', async () => {
    const res = await request(app).get('/nonexistent-route');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
