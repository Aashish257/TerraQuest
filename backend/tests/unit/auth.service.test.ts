/**
 * tests/unit/auth.service.test.ts — AuthService Unit Tests
 *
 * Test IDs: AUTH-UT-001 through AUTH-UT-004
 */

import '../setup';
import * as authService from '../../src/services/auth.service';
import User from '../../src/models/User';
import bcrypt from 'bcrypt';

describe('AuthService Unit Tests', () => {
  const mockUserData = {
    name: 'Aashish',
    email: 'aashish@example.com',
    password: 'securepass123',
    role: 'traveler' as const,
  };

  it('AUTH-UT-001: registers a user successfully with hashed password and returns token', async () => {
    const result = await authService.registerUser(mockUserData);

    expect(result.token).toBeDefined();
    expect(result.user).toBeDefined();
    expect(result.user.name).toBe(mockUserData.name);
    expect(result.user.email).toBe(mockUserData.email);
    expect(result.user.role).toBe(mockUserData.role);

    // Verify user is in DB
    const dbUser = await User.findOne({ email: mockUserData.email }).select('+password');
    expect(dbUser).not.toBeNull();
    expect(dbUser!.name).toBe(mockUserData.name);
    
    // Verify password is encrypted
    const isPasswordHashed = await bcrypt.compare(mockUserData.password, dbUser!.password);
    expect(isPasswordHashed).toBe(true);
    expect(dbUser!.password).not.toBe(mockUserData.password);
  });

  it('AUTH-UT-002: prevents registration with an already registered email address', async () => {
    // Register the user first
    await authService.registerUser(mockUserData);

    // Try to register the same user again
    await expect(authService.registerUser(mockUserData)).rejects.toThrow(
      /Email is already registered/
    );
  });

  it('AUTH-UT-003: logs in a user successfully with correct credentials and returns token', async () => {
    // Register first
    await authService.registerUser(mockUserData);

    // Attempt login
    const result = await authService.loginUser({
      email: mockUserData.email,
      password: mockUserData.password,
    });

    expect(result.token).toBeDefined();
    expect(result.user).toBeDefined();
    expect(result.user.email).toBe(mockUserData.email);
  });

  it('AUTH-UT-004: rejects login with incorrect email or password', async () => {
    // Register first
    await authService.registerUser(mockUserData);

    // Try invalid password
    await expect(
      authService.loginUser({
        email: mockUserData.email,
        password: 'wrongpassword',
      })
    ).rejects.toThrow(/Invalid email or password/);

    // Try invalid email
    await expect(
      authService.loginUser({
        email: 'wrongemail@example.com',
        password: mockUserData.password,
      })
    ).rejects.toThrow(/Invalid email or password/);
  });
});
