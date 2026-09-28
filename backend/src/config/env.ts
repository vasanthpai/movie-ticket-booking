import 'dotenv/config';
import { z } from 'zod';

/**
 * Every environment variable the app needs, with its type and default.
 * Add new variables here (and to .env.example) as later phases need them.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  // Env vars are always strings; coerce turns "5000" into the number 5000.
  PORT: z.coerce.number().int().min(1).max(65535).default(5000),
  // No default on purpose: the app must not start without a database.
  MONGODB_URI: z
    .string()
    .regex(/^mongodb(\+srv)?:\/\//, 'must start with mongodb:// or mongodb+srv://'),
  // The frontend origin allowed to call this API from a browser.
  CORS_ORIGIN: z.url().default('http://localhost:3000'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // Fail fast: better to crash at startup with a clear message than to
  // run with a broken configuration and fail mysteriously later.
  console.error('❌ Invalid environment variables:');
  console.error(z.prettifyError(parsed.error));
  process.exit(1);
}

/** Typed, validated config. Import this instead of reading process.env directly. */
export const env = parsed.data;

export const isProduction = env.NODE_ENV === 'production';

export type Env = z.infer<typeof envSchema>;
