// This file inserts initial sample data for admin seed into the database.
/**
 * admin.seed.ts — Seeder for default Admin User
 *
 * Runs as a separate script to create or promote the default admin user.
 */

import 'dotenv/config';
import bcrypt from 'bcrypt';
import User from '../models/User';
import { connectDB, disconnectDB } from '../config/db';

const adminEmail = 'admin@terraquest.com';
const adminPassword = 'AdminPassword123!';
const adminName = 'System Admin';

const seedAdmin = async () => {
  console.log('🌱 Starting Admin account seeding...');
  await connectDB();

  try {
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log(`ℹ️ Admin account already exists for ${adminEmail}. Ensuring role is set to 'admin' and active...`);
      existingAdmin.role = 'admin';
      existingAdmin.isActive = true;
      await existingAdmin.save();
      console.log(`✅ Admin account updated successfully!`);
    } else {
      console.log(`🆕 Creating new admin account for ${adminEmail}...`);
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      await User.create({
        name: adminName,
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        isActive: true,
        travelDNA: ['Adventure', 'Culture']
      });
      console.log(`✅ Default admin account created successfully!`);
      console.log(`🔑 Credentials:\n   - Email: ${adminEmail}\n   - Password: ${adminPassword}`);
    }
  } catch (err) {
    console.error('❌ Error seeding admin:', err);
  } finally {
    await disconnectDB();
    process.exit(0);
  }
};

seedAdmin();
