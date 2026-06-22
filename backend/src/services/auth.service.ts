/**
 * auth.service.ts — Authentication and authorization service
 *
 * Implements logic for:
 * 1. Registering new users (checking duplicate email, hashing passwords).
 * 2. Logging in existing users (verifying email, verifying password, checking status).
 * 3. Issuing JWT access tokens.
 */

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { IUser } from '../models/User';
import { userRepository } from '../repositories/UserRepository';
import { AppError } from '../middleware/errorHandler';

// Helper: Generate JWT token for a user
export const generateToken = (user: IUser): string => {
  return jwt.sign(
    { _id: user._id.toString(), role: user.role },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN as any }
  );
};

export const registerUser = async (data: any) => {
  const { name, email, password, role } = data;

  // 1. Check if user already exists
  const existingUser = await userRepository.findByEmail(email);
  if (existingUser) {
    throw new AppError('Email is already registered', 400);
  }

  // 2. Hash the password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // 3. Create the user
  const user = await userRepository.create({
    name,
    email,
    password: hashedPassword,
    role,
    lastLogin: new Date(),
  });

  // 4. Generate token
  const token = generateToken(user);

  // Return token and user data without password
  const userResponse = {
    _id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  return { token, user: userResponse };
};

export const loginUser = async (data: any) => {
  const { email, password } = data;

  // 1. Find user and explicitly select password
  const user = await userRepository.findByEmailWithPassword(email);
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  // 2. Verify account is active
  if (!user.isActive) {
    throw new AppError('Your account has been deactivated. Please contact support.', 401);
  }

  // 3. Compare passwords
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new AppError('Invalid email or password', 401);
  }

  // 4. Generate token
  const token = generateToken(user);

  // Update last login timestamp
  await userRepository.updateOne({ _id: user._id }, { $set: { lastLogin: new Date() } });

  // Return token and user details without password
  const userResponse = {
    _id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  return { token, user: userResponse };
};
