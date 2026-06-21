/**
 * ai.service.ts — AI Travel Itinerary generator service
 *
 * Connects to OpenAI API to request prompt-driven custom itineraries.
 * Features an offline/fallback dynamic generation logic for seamless local testing.
 */

import OpenAI from 'openai';
import { env } from '../config/env';

// Initialize the OpenAI client.
// Uses configured env variable or dummy key to prevent startup errors.
const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY || 'dummy_key' });

export interface GeneratePlanInput {
  destinationName: string;
  budget: number;
  duration: number;
  interests: string[];
}

/**
 * Helper to generate a realistic mock travel plan if OpenAI is unavailable or keyless.
 */
const generateMockTravelPlan = (input: GeneratePlanInput): string => {
  const interestList = input.interests.join(', ');
  let md = `# ${input.duration}-Day Itinerary to ${input.destinationName}\n\n`;
  md += `## 📊 Trip Overview\n`;
  md += `- **Destination**: ${input.destinationName}\n`;
  md += `- **Duration**: ${input.duration} Days\n`;
  md += `- **Total Budget**: ₹${input.budget.toLocaleString('en-IN')}\n`;
  md += `- **Interests**: ${interestList}\n\n`;

  md += `## 🏨 Accommodation Suggestions\n`;
  md += `Based on a budget of ₹${input.budget.toLocaleString('en-IN')}, we suggest:\n`;
  if (input.budget / input.duration < 3000) {
    md += `- **Budget Homestay / Hostel**: Cozy rooms near local transit (Approx. ₹1,000 - ₹1,500/night).\n`;
  } else if (input.budget / input.duration < 8000) {
    md += `- **Mid-range Boutique Stay**: Modern amenities with beautiful view decks (Approx. ₹3,000 - ₹4,500/night).\n`;
  } else {
    md += `- **Luxury Resort / Heritage Hotel**: Premium experience, infinity pools, and local hospitality (Approx. ₹7,000 - ₹12,000/night).\n`;
  }
  md += `\n`;

  md += `## 📅 Day-by-Day Schedule\n\n`;
  for (let d = 1; d <= input.duration; d++) {
    md += `### Day ${d}: ${d === 1 ? 'Arrival & Initial Explore' : d === input.duration ? 'Souvenirs & Departure' : 'Deep Dive Experiential'}\n`;
    md += `- **Morning**: `;
    if (input.interests.includes('spiritual')) {
      md += `Visit to a highly revered local spiritual site for morning prayers and peaceful meditation. `;
    } else if (input.interests.includes('nature')) {
      md += `Scenic nature walk to capture the early morning sun and local wildlife activity. `;
    } else {
      md += `Breakfast at a traditional local café, tasting regional delicacies. `;
    }
    md += `\n`;

    md += `- **Afternoon**: `;
    if (input.interests.includes('adventure')) {
      md += `Thrilling adventure activity (trekking or local exploration) designed to test your limits. `;
    } else if (input.interests.includes('culture')) {
      md += `Guided walk through historic temples, old streets, and architectural wonders of ${input.destinationName}. `;
    } else {
      md += `Leisurely explore the local marketplace, tasting various street foods. `;
    }
    md += `\n`;

    md += `- **Evening**: `;
    if (input.interests.includes('nightlife')) {
      md += `Enjoy the vibrant evening at a popular local pub, beach shack, or night market. `;
    } else if (input.interests.includes('food')) {
      md += `Gourmet dinner experience showcasing traditional family recipes of ${input.destinationName}. `;
    } else {
      md += `Sunset viewpoints visit followed by quiet dinner at a rooftop cafe. `;
    }
    md += `\n\n`;
  }

  md += `## 💡 Practical Travel Tips\n`;
  md += `- **Transport**: Hire a local scooter/auto-rickshaw for cheap commuting.\n`;
  md += `- **Weather**: Check local seasonal guidelines before packing.\n`;
  md += `- **Etiquette**: Respect local cultural norms at heritage spots.\n`;

  return md;
};

/**
 * Generates an itinerary via OpenAI, or falls back to mock itinerary if key is missing/dummy.
 */
export const generateTravelPlan = async (input: GeneratePlanInput): Promise<string> => {
  const apiKey = process.env.OPENAI_API_KEY || env.OPENAI_API_KEY;

  // If simulated failure requested in tests:
  if (apiKey === 'mock_key_fail') {
    throw new Error('OpenAI API connection failed: Mock failure');
  }

  // Fallback to offline mock mode if no API key is loaded
  if (!apiKey || apiKey === 'dummy_key') {
    return generateMockTravelPlan(input);
  }

  const prompt = `
You are an expert travel planner for India.

Create a detailed ${input.duration}-day travel itinerary for ${input.destinationName}.

Constraints:
- Total budget: ₹${input.budget}
- Traveler interests: ${input.interests.join(', ')}

Provide:
1. Day-by-day schedule
2. Accommodation suggestions
3. Food recommendations (local eats)
4. Activity breakdown
5. Budget split (transport, stay, food, activities)
6. Practical travel tips

Format clearly with Day 1, Day 2... headers.
`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1500,
      temperature: 0.7,
    });

    const plan = response.choices[0]?.message?.content;
    if (!plan) {
      throw new Error('OpenAI returned empty response');
    }

    return plan;
  } catch (err: any) {
    // Re-throw so controller can report it as a 503
    throw new Error(`OpenAI API Failure: ${err.message}`);
  }
};
