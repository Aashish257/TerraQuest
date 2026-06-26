// This file sets up configurations like the database connection or environment variables.
/**
 * env.ts — Environment variable validation
 *
 * Uses Zod to parse and validate all environment variables at startup.
 * If any required variable is missing or invalid, the process exits
 * immediately with a descriptive error — "fail fast" principle.
 *
 * Best practice: import and call validateEnv() before anything else in server.ts
 */

import { z } from 'zod';

// Define the schema for all environment variables
const envSchema = z.object({
  // Server
  PORT: z
    .string()
    .default('5000')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(1).max(65535)),

  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Database — required, no default
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),

  // JWT Auth — required
  JWT_SECRET: z
    .string()
    .min(32, 'JWT_SECRET must be at least 32 characters for security'),

  JWT_EXPIRES_IN: z.string().default('7d'),

  // CORS — required
  FRONTEND_URL: z.string().url('FRONTEND_URL must be a valid URL').default('http://localhost:3000'),

  // Optional (needed in later phases)
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
});

// Infer the TypeScript type from the schema
export type Env = z.infer<typeof envSchema>;

/**
 * Validates process.env against the schema.
 * Exits the process if validation fails — prevents running with broken config.
 */
export function validateEnv(): Env {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error('❌ Invalid environment variables:\n');
    result.error.issues.forEach((issue) => {
      console.error(`  • ${issue.path.join('.')}: ${issue.message}`);
    });
    console.error('\nPlease check your .env file against .env.example\n');
    process.exit(1);
  }

  return result.data;
}

// Export the validated env singleton — import this anywhere instead of process.env directly
export const env = validateEnv();
