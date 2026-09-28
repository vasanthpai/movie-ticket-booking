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

export type Env = z.infer<typeof envSchema>;
