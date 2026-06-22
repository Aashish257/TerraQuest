import { userRepository } from '../repositories/UserRepository';
import { AppError } from '../middleware/errorHandler';

export const getMe = async (userId: string) => {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }
  return user;
};

export const updateMe = async (userId: string, data: any) => {
  const { name, bio, location } = data;

  const updatedUser = await userRepository.updateById(
    userId,
    { $set: { name, bio, location } },
    { new: true, runValidators: true }
  );

  if (!updatedUser) {
    throw new AppError('User not found', 404);
  }

  return updatedUser;
};

export const getUserById = async (userId: string) => {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Standardize public profile details returned to external users
  return {
    _id: user._id.toString(),
    name: user.name,
    role: user.role,
    avatar: user.avatar,
    bio: user.bio,
    location: user.location,
    travelDNA: user.travelDNA,
    createdAt: user.createdAt,
  };
};

export const getAllUsers = async () => {
  return userRepository.find(
    {},
    'name email role avatar bio location isActive lastLogin createdAt updatedAt',
    { sort: { createdAt: -1 } }
  );
};

export const updateUserStatus = async (targetUserId: string, requestingAdminId: string, isActive: boolean) => {
  if (targetUserId === requestingAdminId) {
    throw new AppError('Forbidden: You cannot deactivate your own account', 400);
  }

  const updatedUser = await userRepository.updateById(
    targetUserId,
    { $set: { isActive } },
    { new: true, runValidators: true }
  );

  if (!updatedUser) {
    throw new AppError('User not found', 404);
  }

  return updatedUser;
};

export const updateUserRole = async (targetUserId: string, requestingAdminId: string, role: 'traveler' | 'guide' | 'admin') => {
  if (targetUserId === requestingAdminId) {
    throw new AppError('Forbidden: You cannot change your own role', 400);
  }

  const updatedUser = await userRepository.updateById(
    targetUserId,
    { $set: { role } },
    { new: true, runValidators: true }
  );

  if (!updatedUser) {
    throw new AppError('User not found', 404);
  }

  return updatedUser;
};

