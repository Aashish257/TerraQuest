/**
 * destinations.seed.ts — Destination data seeder
 *
 * Runs as a separate script (`npm run seed`) to clear and seed
 * the destinations collection with P0 start data.
 */

import 'dotenv/config';
import Destination from '../models/Destination';
import { connectDB, disconnectDB } from '../config/db';

const destinations = [
  {
    name: 'Goa',
    country: 'India',
    state: 'Goa',
    description: "Sun, sand, and vibrant nightlife. India's most popular beach destination with Portuguese colonial heritage.",
    bestTimeToVisit: 'November to February',
    budgetRange: '₹5,000 – ₹20,000 per day',
    activities: ['Beach', 'Water Sports', 'Nightlife', 'Heritage', 'Food Tour'],
    images: [],
    featured: true,
  },
  {
    name: 'Manali',
    country: 'India',
    state: 'Himachal Pradesh',
    description: 'Mountain paradise for adventure seekers with snow-capped peaks and lush valleys.',
    bestTimeToVisit: 'October to June',
    budgetRange: '₹3,000 – ₹15,000 per day',
    activities: ['Trekking', 'Skiing', 'Adventure', 'Camping', 'River Rafting'],
    images: [],
    featured: true,
  },
  {
    name: 'Ladakh',
    country: 'India',
    state: 'Ladakh UT',
    description: 'Land of high passes with breathtaking monasteries, blue lakes, and stark desert landscapes.',
    bestTimeToVisit: 'June to September',
    budgetRange: '₹4,000 – ₹18,000 per day',
    activities: ['Trekking', 'Motorcycle Trip', 'Monasteries', 'Wildlife', 'Photography'],
    images: [],
    featured: true,
  },
  {
    name: 'Jaipur',
    country: 'India',
    state: 'Rajasthan',
    description: 'The Pink City. Royal palaces, forts, and vibrant bazaars capture the essence of Rajasthan.',
    bestTimeToVisit: 'October to March',
    budgetRange: '₹2,000 – ₹12,000 per day',
    activities: ['Heritage', 'Shopping', 'Food Tour', 'Architecture', 'Culture'],
    images: [],
    featured: false,
  },
  {
    name: 'Coorg',
    country: 'India',
    state: 'Karnataka',
    description: 'Scotland of India. Coffee plantations, mist-covered hills, and rich Kodava culture.',
    bestTimeToVisit: 'October to March',
    budgetRange: '₹3,000 – ₹12,000 per day',
    activities: ['Trekking', 'Plantation Tour', 'Rafting', 'Wildlife', 'Nature'],
    images: [],
    featured: false,
  },
  {
    name: 'Munnar',
    country: 'India',
    state: 'Kerala',
    description: 'Tea estate haven in the Western Ghats with stunning green landscapes and cool climate.',
    bestTimeToVisit: 'September to March',
    budgetRange: '₹2,500 – ₹10,000 per day',
    activities: ['Tea Plantation', 'Trekking', 'Wildlife', 'Nature', 'Scenic Drives'],
    images: [],
    featured: false,
  },
  {
    name: 'Pondicherry',
    country: 'India',
    state: 'Puducherry',
    description: 'French colonial quarter meets Indian spirituality. Beaches, ashrams, and café culture.',
    bestTimeToVisit: 'October to March',
    budgetRange: '₹2,000 – ₹8,000 per day',
    activities: ['Beach', 'Heritage', 'Spiritual', 'Food Tour', 'Cycling'],
    images: [],
    featured: false,
  },
  {
    name: 'Rishikesh',
    country: 'India',
    state: 'Uttarakhand',
    description: 'Yoga capital of the world on the banks of the Ganges. Gateway to Himalayan treks.',
    bestTimeToVisit: 'February to May, September to November',
    budgetRange: '₹1,500 – ₹8,000 per day',
    activities: ['Yoga', 'River Rafting', 'Trekking', 'Bungee Jumping', 'Spiritual'],
    images: [],
    featured: true,
  },
  {
    name: 'Udaipur',
    country: 'India',
    state: 'Rajasthan',
    description: 'City of Lakes. Romantic palaces reflected in shimmering lakes, royal heritage at every turn.',
    bestTimeToVisit: 'September to March',
    budgetRange: '₹2,500 – ₹15,000 per day',
    activities: ['Heritage', 'Boat Ride', 'Architecture', 'Shopping', 'Food Tour'],
    images: [],
    featured: false,
  },
  {
    name: 'Meghalaya',
    country: 'India',
    state: 'Meghalaya',
    description: 'Abode of the Clouds. Living root bridges, wettest place on earth, and stunning waterfalls.',
    bestTimeToVisit: 'October to May',
    budgetRange: '₹3,000 – ₹12,000 per day',
    activities: ['Trekking', 'Caving', 'Waterfalls', 'Tribal Culture', 'Photography'],
    images: [],
    featured: true,
  },
];

const seed = async () => {
  console.log('🌱 Starting destination seeding...');
  await connectDB();
  
  console.log('🧹 Clearing existing destinations...');
  await Destination.deleteMany({});
  
  console.log(`📤 Inserting ${destinations.length} destinations...`);
  await Destination.insertMany(destinations);
  
  console.log('✅ Seeding completed successfully!');
  await disconnectDB();
  process.exit(0);
};

seed().catch(async (err) => {
  console.error('❌ Seeding failed with error:', err);
  try {
    await disconnectDB();
  } catch (disconnectErr) {
    console.error('Failed to disconnect cleanly:', disconnectErr);
  }
  process.exit(1);
});
