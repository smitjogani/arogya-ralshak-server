import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3000'),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url().default('redis://localhost:6379'),
  JWT_SECRET: z.string().min(32),
  AES_ENCRYPTION_KEY: z.string().length(32), // Exactly 32 chars/bytes for AES-256
  GEMINI_API_KEY: z.string().optional(),
  ALLOWED_ORIGINS: z.string().default('*'), // Comma separated list
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('900000'), // 15 mins
  RATE_LIMIT_MAX_REQS: z.string().transform(Number).default('100'),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Invalid environment variables:', _env.error.format());
  process.exit(1);
}

export const env = _env.data;
