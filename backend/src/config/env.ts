import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load .env file from root
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters long'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters long'),
  PAYMENT_PROVIDER: z.enum(['mock', 'razorpay', 'stripe']).default('mock'),
}).refine((data) => {
  if (data.NODE_ENV === 'production') {
    if (data.JWT_SECRET.includes('default') || data.JWT_SECRET.includes('change_in_production')) {
      return false;
    }
  }
  return true;
}, {
  message: 'In production mode, JWT_SECRET must be set to a secure custom secret',
  path: ['JWT_SECRET'],
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  // eslint-disable-next-line no-console
  console.error('❌ Invalid environment variables:', parsedEnv.error.format());
  if (process.env.NODE_ENV !== 'test') {
    process.exit(1);
  }
}

export const env = parsedEnv.success
  ? parsedEnv.data
  : {
      NODE_ENV: 'test' as const,
      PORT: 5000,
      FRONTEND_URL: 'http://localhost:5173',
      DATABASE_URL: process.env.DATABASE_URL || 'mysql://root:password@127.0.0.1:3306/housing_clone',
      JWT_SECRET: process.env.JWT_SECRET || 'super_secret_jwt_key_at_least_32_characters_long_for_test',
      JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'super_secret_refresh_key_at_least_32_characters_long_for_test',
      PAYMENT_PROVIDER: 'mock' as const,
    };
