// This file contains the main business logic and backend processes for guide service.
import { guideRepository } from '../repositories/GuideRepository';
import { userRepository } from '../repositories/UserRepository';
import { generateToken } from './auth.service';
import { AppError } from '../middleware/errorHandler';

export const listGuides = async (filters: {
  location?: string;
  rating?: string;
  page?: string;
  limit?: string;
}) => {
  const { location, rating, page = '1', limit = '10' } = filters;
  const query: any = {};

  if (location) {
    query.location = { $regex: new RegExp(location as string, 'i') };
  }

  if (rating) {
    query.rating = { $gte: parseFloat(rating as string) };
  }

  const pageNum = parseInt(page as string, 10) || 1;
  const limitNum = parseInt(limit as string, 10) || 10;
  const skip = (pageNum - 1) * limitNum;

  const total = await guideRepository.count(query);
  const totalPages = Math.ceil(total / limitNum);

  const guides = await guideRepository.findWithPagination(query, skip, limitNum);

  return {
    guides,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages,
    },
  };
};

export const getGuideById = async (id: string) => {
  let guide = await guideRepository.findByIdWithUser(id);
  if (!guide) {
    guide = await guideRepository.findByUserId(id);
  }

  if (!guide) {
    throw new AppError('Guide profile not found', 404);
  }

  return guide;
};

export const createGuideProfile = async (userId: string, data: any) => {
  const { experience, languages, expertise, location, bio } = data;

  const existingProfile = await guideRepository.findByUserId(userId);
  if (existingProfile) {
    throw new AppError('Guide profile already exists for this user', 409);
  }

  return guideRepository.create({
    userId,
    experience,
    languages,
    expertise,
    location,
    bio,
  });
};

export const becomeGuide = async (userId: string, data: any) => {
  const { experience, languages, expertise, location, bio } = data;

  // 1. Find User
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // 2. Check if guide profile already exists
  const existingProfile = await guideRepository.findByUserId(userId);
  if (existingProfile) {
    throw new AppError('Guide profile already exists for this user', 409);
  }

  // 3. Update User role
  user.role = 'guide';
  await user.save();

  // 4. Create GuideProfile
  const profile = await guideRepository.create({
    userId,
    experience,
    languages,
    expertise,
    location,
    bio,
  });

  // 5. Generate a new token with updated role
  const token = generateToken(user);

  return {
    user: {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      isActive: user.isActive,
    },
    profile,
    token,
  };
};

export const updateGuideProfileAndUser = async (userId: string, data: any) => {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Update user fields
  const { name, avatar } = data;
  if (name !== undefined) user.name = name;
  if (avatar !== undefined) user.avatar = avatar;
  await user.save();

  // Find or CREATE guide profile (upsert so users promoted via DB still work)
  let profile = await guideRepository.findByUserId(userId);
  if (!profile) {
    profile = await guideRepository.create({
      userId,
      experience: 0,
      languages: [],
      expertise: [],
      location: '',
      bio: '',
    });
  }

  const { experience, languages, expertise, location, bio } = data;
  if (experience !== undefined) profile.experience = experience;
  if (languages !== undefined) profile.languages = languages;
  if (expertise !== undefined) profile.expertise = expertise;
  if (location !== undefined) profile.location = location;
  if (bio !== undefined) profile.bio = bio;
  await profile.save();

  return {
    user: {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      isActive: user.isActive,
    },
    profile,
  };
};

export const updateGuideProfile = async (id: string, userId: string, data: any) => {
  let profile = await guideRepository.findById(id);
  if (!profile) {
    profile = await guideRepository.findByUserId(id);
  }

  if (!profile) {
    throw new AppError('Guide profile not found', 404);
  }

  if (profile.userId.toString() !== userId) {
    throw new AppError('Forbidden: You can only update your own profile', 403);
  }

  const { experience, languages, expertise, location, bio } = data;

  if (experience !== undefined) profile.experience = experience;
  if (languages !== undefined) profile.languages = languages;
  if (expertise !== undefined) profile.expertise = expertise;
  if (location !== undefined) profile.location = location;
  if (bio !== undefined) profile.bio = bio;

  await profile.save();
  return profile;
};
