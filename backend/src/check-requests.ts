import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User';
import GuideProfile from './models/GuideProfile';
import GuideRequest from './models/GuideRequest';

dotenv.config();

async function run() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/terraquest';
  console.log('Connecting to database:', uri);
  await mongoose.connect(uri);
  console.log('Connected!');

  const users = await User.find({}, 'name email role');
  console.log('\n--- USERS IN DATABASE ---');
  users.forEach((u) => {
    console.log(`User ID: ${u._id} | Name: ${u.name} | Role: ${u.role}`);
  });

  const profiles = await GuideProfile.find({});
  console.log('\n--- GUIDE PROFILES IN DATABASE ---');
  profiles.forEach((p) => {
    console.log(`Profile ID: ${p._id} | User ID (userId): ${p.userId}`);
  });

  const requests = await GuideRequest.find({});
  console.log('\n--- GUIDE REQUESTS IN DATABASE ---');
  requests.forEach((r) => {
    const guideProfileExists = profiles.some((p) => p._id.toString() === r.guideId.toString());
    const guideUserExists = users.some((u) => u._id.toString() === r.guideId.toString());
    
    let matchType = 'UNKNOWN ID TYPE';
    if (guideProfileExists) matchType = 'GuideProfile ID (Correct)';
    if (guideUserExists) matchType = 'User ID (Mismatched/Incorrect)';

    console.log(`Request ID: ${r._id} | Traveler ID: ${r.travelerId} | Guide ID (guideId): ${r.guideId} | Type: ${matchType} | Status: ${r.status}`);
  });

  await mongoose.disconnect();
  console.log('\nDone.');
}

run().catch(console.error);
