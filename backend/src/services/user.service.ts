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
