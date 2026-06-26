// This file contains automated tests to verify the correctness of the application code.
/**
 * tests/integration/auth.integration.test.ts — Authentication and User API Integration Tests
 *
 * Test IDs: AUTH-INT-001, AUTH-INT-002
 */

import '../setup';
import request from 'supertest';
import app from '../../src/app';
import User from '../../src/models/User';

describe('Auth & User API Integration Tests', () => {
  const registerPayload = {
    name: 'Aashish Integration',
    email: 'aashish.int@example.com',
    password: 'securepass123',
    role: 'traveler',
  };

  describe('POST /api/auth/register & POST /api/auth/login', () => {
    it('AUTH-INT-001: registers, logins, and logouts a user via API endpoints', async () => {
      // 1. REGISTER
      const regRes = await request(app)
        .post('/api/auth/register')
        .send(registerPayload);

      expect(regRes.status).toBe(201);
      expect(regRes.body.success).toBe(true);
      expect(regRes.body.token).toBeDefined();
      expect(regRes.body.user).toBeDefined();
      expect(regRes.body.user.email).toBe(registerPayload.email);
      expect(regRes.body.user.password).toBeUndefined(); // Verify password not leaked

      // 2. LOGIN
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: registerPayload.email,
          password: registerPayload.password,
        });

      expect(loginRes.status).toBe(200);
      expect(loginRes.body.success).toBe(true);
      expect(loginRes.body.token).toBeDefined();
      const token = loginRes.body.token;

      // 3. LOGOUT (protected route)
      const logoutRes = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .send();

      expect(logoutRes.status).toBe(200);
      expect(logoutRes.body.success).toBe(true);
      expect(logoutRes.body.message).toContain('Logged out');
    });

    it('returns 400 when registration validation fails', async () => {
      const invalidPayload = {
        name: 'A', // too short
        email: 'invalid-email', // invalid email
        password: '123', // too short
        role: 'invalid-role',
      };

      const res = await request(app)
        .post('/api/auth/register')
        .send(invalidPayload);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Validation failed');
      expect(res.body.errors).toHaveLength(4);
    });
  });

  describe('GET & PUT /api/users/me', () => {
    let token: string;
    let userId: string;

    beforeEach(async () => {
      // Pre-register user to get a token
      const regRes = await request(app)
        .post('/api/auth/register')
        .send(registerPayload);

      token = regRes.body.token;
      userId = regRes.body.user._id;
    });

    it('AUTH-INT-002: retrieves and updates the logged-in user profile', async () => {
      // 1. GET own profile
      const getRes = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${token}`);

      expect(getRes.status).toBe(200);
      expect(getRes.body.success).toBe(true);
      expect(getRes.body.user._id).toBe(userId);
      expect(getRes.body.user.name).toBe(registerPayload.name);
      expect(getRes.body.user.password).toBeUndefined();

      // 2. UPDATE own profile
      const updatePayload = {
        name: 'Updated Name',
        bio: 'Avid traveler and foodie.',
        location: 'Berlin, Germany',
      };

      const updateRes = await request(app)
        .put('/api/users/me')
        .set('Authorization', `Bearer ${token}`)
        .send(updatePayload);

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.success).toBe(true);
      expect(updateRes.body.user.name).toBe(updatePayload.name);
      expect(updateRes.body.user.bio).toBe(updatePayload.bio);
      expect(updateRes.body.user.location).toBe(updatePayload.location);

      // Verify DB change
      const userInDb = await User.findById(userId);
      expect(userInDb!.name).toBe(updatePayload.name);
    });

    it('GET /api/users/:id retrieves public profile without authentication', async () => {
      const publicRes = await request(app).get(`/api/users/${userId}`);

      expect(publicRes.status).toBe(200);
      expect(publicRes.body.success).toBe(true);
      expect(publicRes.body.user._id).toBe(userId);
      expect(publicRes.body.user.name).toBe(registerPayload.name);
      expect(publicRes.body.user.email).toBeUndefined(); // Email is private, not returned in public profiles
      expect(publicRes.body.user.isActive).toBeUndefined(); // Status is private
    });

    it('returns 401 when accessing protected profile route without token', async () => {
      const res = await request(app).get('/api/users/me');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('No token provided');
    });

    it('returns 401 when token is invalid', async () => {
      const res = await request(app)
        .get('/api/users/me')
        .set('Authorization', 'Bearer invalidtoken123');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invalid or expired token');
    });
  });

  describe('Admin User Management API endpoints', () => {
    let adminToken: string;
    let travelerToken: string;
    let travelerId: string;
    let adminId: string;

    beforeEach(async () => {
      // Clear users first to start clean
      await User.deleteMany({});

      const bcrypt = require('bcrypt');
      const salt = await bcrypt.genSalt(10);
      
      // Create admin
      const hashedAdminPassword = await bcrypt.hash('adminpassword123', salt);
      const adminUser = await User.create({
        name: 'System Admin',
        email: 'admin.test@example.com',
        password: hashedAdminPassword,
        role: 'admin',
        isActive: true,
        lastLogin: new Date(),
      });
      adminId = adminUser._id.toString();

      const { generateToken } = require('../../src/services/auth.service');
      adminToken = generateToken(adminUser);

      // Create traveler
      const hashedTravelerPassword = await bcrypt.hash('travelerpass123', salt);
      const travelerUser = await User.create({
        name: 'John Traveler',
        email: 'john.traveler@example.com',
        password: hashedTravelerPassword,
        role: 'traveler',
        isActive: true,
        lastLogin: new Date(),
      });
      travelerId = travelerUser._id.toString();
      travelerToken = generateToken(travelerUser);
    });

    it('GET /api/users returns all users for admin but 403 for traveler', async () => {
      // 1. Admin gets all users
      const adminRes = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(adminRes.status).toBe(200);
      expect(adminRes.body.success).toBe(true);
      expect(adminRes.body.users).toHaveLength(2);
      expect(adminRes.body.users[0]).toHaveProperty('lastLogin');

      // 2. Traveler attempts to get all users
      const travelerRes = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${travelerToken}`);

      expect(travelerRes.status).toBe(403);
      expect(travelerRes.body.success).toBe(false);
    });

    it('PATCH /api/users/:id/status updates status, returns 400 when admin deactivates self', async () => {
      // 1. Admin deactivates traveler
      const deactiveRes = await request(app)
        .patch(`/api/users/${travelerId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isActive: false });

      expect(deactiveRes.status).toBe(200);
      expect(deactiveRes.body.success).toBe(true);
      expect(deactiveRes.body.user.isActive).toBe(false);

      const travelerInDb = await User.findById(travelerId);
      expect(travelerInDb!.isActive).toBe(false);

      // 2. Admin tries to deactivate themselves
      const selfRes = await request(app)
        .patch(`/api/users/${adminId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isActive: false });

      expect(selfRes.status).toBe(400);
      expect(selfRes.body.success).toBe(false);
      expect(selfRes.body.message).toContain('cannot deactivate your own account');
    });

    it('PATCH /api/users/:id/role updates role, returns 400 when admin changes own role', async () => {
      // 1. Admin updates traveler to guide
      const roleRes = await request(app)
        .patch(`/api/users/${travelerId}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'guide' });

      expect(roleRes.status).toBe(200);
      expect(roleRes.body.success).toBe(true);
      expect(roleRes.body.user.role).toBe('guide');

      const travelerInDb = await User.findById(travelerId);
      expect(travelerInDb!.role).toBe('guide');

      // 2. Admin tries to change their own role
      const selfRes = await request(app)
        .patch(`/api/users/${adminId}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'traveler' });

      expect(selfRes.status).toBe(400);
      expect(selfRes.body.success).toBe(false);
      expect(selfRes.body.message).toContain('cannot change your own role');
    });
  });
});

