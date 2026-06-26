// This file inserts initial sample data for fix images into the database.
/**
 * fix-images.ts — One-shot image URL patch script
 *
 * Updates all destination documents in MongoDB with working
 * image URLs using source.unsplash.com (no CORS, no hotlink block).
 * Run: npx ts-node src/seed/fix-images.ts
 */

import 'dotenv/config';
import { connectDB, disconnectDB } from '../config/db';
import Destination from '../models/Destination';

/**
 * All URLs use source.unsplash.com format which:
 * - Bypasses hotlink protection (works via redirect to CDN)
 * - No API key required
 * - Works in browsers without CORS issues
 */
const IMAGE_MAP: Record<string, string[]> = {
  'Goa': [
    'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&q=80&auto=format&fit=crop',
  ],
  'Manali': [
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=800&q=80&auto=format&fit=crop',
  ],
  'Ladakh': [
    'https://images.unsplash.com/photo-1589308454676-2656694cdb97?w=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=800&q=80&auto=format&fit=crop',
  ],
  'Jaipur': [
    'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1568495248636-6432b97bd949?w=800&q=80&auto=format&fit=crop',
  ],
  'Coorg': [
    'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1536599018102-9f803c140fc1?w=800&q=80&auto=format&fit=crop',
  ],
  'Munnar': [
    'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&q=80&auto=format&fit=crop',
  ],
  'Pondicherry': [
    'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=800&q=80&auto=format&fit=crop',
  ],
  'Rishikesh': [
    'https://images.unsplash.com/photo-1591018533254-90c23e596e0e?w=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1565008576549-57569a49371d?w=800&q=80&auto=format&fit=crop',
  ],
  'Udaipur': [
    'https://images.unsplash.com/photo-1566296314736-6eaea1bcb7c3?w=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1477587458883-47145ed31d7a?w=800&q=80&auto=format&fit=crop',
  ],
  'Meghalaya': [
    'https://images.unsplash.com/photo-1573408301185-9519f94815b1?w=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1536599018102-9f803c140fc1?w=800&q=80&auto=format&fit=crop',
  ],
};

const run = async () => {
  console.log('🔗 Connecting to MongoDB...');
  await connectDB();

  let updated = 0;
  let skipped = 0;

  for (const [name, images] of Object.entries(IMAGE_MAP)) {
    const result = await Destination.updateOne(
      { name },
      { $set: { images } }
    );
    if (result.matchedCount > 0) {
      console.log(`  ✅ Updated: ${name} (${images.length} images)`);
      updated++;
    } else {
      console.log(`  ⚠️  Not found in DB: ${name}`);
      skipped++;
    }
  }

  console.log(`\n📊 Done — ${updated} updated, ${skipped} skipped`);
  await disconnectDB();
  process.exit(0);
};

run().catch(async (err) => {
  console.error('❌ Failed:', err.message);
  await disconnectDB();
  process.exit(1);
});
