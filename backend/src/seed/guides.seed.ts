// This file inserts initial sample data for guides seed into the database.
/**
 * guides.seed.ts — Guide and GuideProfile data seeder
 *
 * Runs as a separate script (`npm run seed:guides`) to clear and seed
 * guide accounts and profiles with starting data.
 */

import 'dotenv/config';
import bcrypt from 'bcrypt';
import User from '../models/User';
import GuideProfile from '../models/GuideProfile';
import { connectDB, disconnectDB } from '../config/db';

const guidesData = [
  {
    name: 'Aarav Sharma',
    email: 'aarav.guide@terraquest.com',
    password: 'password123',
    location: 'Goa',
    experience: 5,
    languages: ['English', 'Hindi', 'Konkani'],
    expertise: ['Water Sports', 'Heritage', 'Food Tour'],
    bio: 'Born and raised in Goa, I know every secret beach shack and historical Portuguese fort. Let me show you the real Goa beyond the tourist traps!',
  },
  {
    name: 'Priya Patel',
    email: 'priya.guide@terraquest.com',
    password: 'password123',
    location: 'Manali',
    experience: 7,
    languages: ['English', 'Hindi', 'Gujarati'],
    expertise: ['Trekking', 'Camping', 'River Rafting'],
    bio: 'Passionate mountaineer and licensed trekking guide. Specializing in high-altitude trails, hidden hot springs, and scenic camp spots around Manali.',
  },
  {
    name: 'Vikram Singh',
    email: 'vikram.guide@terraquest.com',
    password: 'password123',
    location: 'Jaipur',
    experience: 10,
    languages: ['English', 'Hindi', 'Rajasthani'],
    expertise: ['Heritage', 'Architecture', 'Culture', 'Shopping'],
    bio: 'Historian and heritage guide for Jaipur. Let me walk you through the royal palaces, astronomical observatories, and vibrant spice markets.',
  },
  {
    name: 'Aditi Rao',
    email: 'aditi.guide@terraquest.com',
    password: 'password123',
    location: 'Munnar',
    experience: 4,
    languages: ['English', 'Tamil', 'Malayalam'],
    expertise: ['Tea Plantation', 'Nature', 'Wildlife', 'Photography'],
    bio: 'Nature enthusiast and photographer. I will guide you through Munnar\'s lush tea valleys, misty mountain gaps, and endemic wildlife sanctuaries.',
  }
];

const seedGuides = async () => {
  console.log('🌱 Starting Guide and GuideProfile seeding...');
  await connectDB();

  // Clean existing guide accounts and profiles
  const existingGuides = await User.find({ role: 'guide' });
  const existingGuideIds = existingGuides.map(u => u._id);

  console.log(`🧹 Clearing ${existingGuideIds.length} existing guide profiles and user accounts...`);
  await GuideProfile.deleteMany({ userId: { $in: existingGuideIds } });
  await User.deleteMany({ role: 'guide' });

  // Create new guides
  for (const guide of guidesData) {
    const hashedPassword = await bcrypt.hash(guide.password, 10);
    const user = await User.create({
      name: guide.name,
      email: guide.email,
      password: hashedPassword,
      role: 'guide',
      isActive: true,
      bio: guide.bio,
      location: guide.location,
    });

    await GuideProfile.create({
      userId: user._id,
      experience: guide.experience,
      languages: guide.languages,
      expertise: guide.expertise,
      location: guide.location,
      bio: guide.bio,
      rating: 0,
      totalReviews: 0,
    });

    console.log(`✅ Seeded guide profile for: ${guide.name} (${guide.email})`);
  }

  console.log('🎉 Seeding of Guides and Profiles completed successfully!');
  await disconnectDB();
  process.exit(0);
};

seedGuides().catch(async (err) => {
  console.error('❌ Seeding guides failed:', err);
  try {
    await disconnectDB();
  } catch (disconnectErr) {
    console.error('Failed to disconnect cleanly:', disconnectErr);
  }
  process.exit(1);
});
