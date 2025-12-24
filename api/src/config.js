import dotenv from 'dotenv';
dotenv.config();

function requireEnv(name) {
  if (!process.env[name]) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return process.env[name];
}

export const config = {
  port: process.env.PORT || 3000,
  env: process.env.NODE_ENV || 'development',
  allowHttpDev: process.env.ALLOW_HTTP_DEV === 'true',
  jwtSecret: process.env.JWT_SECRET || requireEnv('JWT_SECRET'),
  db: {
    host: process.env.USE_PGMEM === 'true' ? process.env.PGHOST : (process.env.PGHOST || requireEnv('PGHOST')),
    port: Number(process.env.PGPORT || 5432),
    user: process.env.USE_PGMEM === 'true' ? process.env.PGUSER : (process.env.PGUSER || requireEnv('PGUSER')),
    password: process.env.USE_PGMEM === 'true' ? process.env.PGPASSWORD : (process.env.PGPASSWORD || requireEnv('PGPASSWORD')),
    database: process.env.USE_PGMEM === 'true' ? process.env.PGDATABASE : (process.env.PGDATABASE || requireEnv('PGDATABASE')),
  },
  redisUrl: process.env.REDIS_URL,
  payfast: {
    merchantId: process.env.PAYFAST_MERCHANT_ID,
    merchantKey: process.env.PAYFAST_MERCHANT_KEY,
    passphrase: process.env.PAYFAST_PASSPHRASE,
    baseUrl: process.env.PAYFAST_BASE_URL || 'https://sandbox.payfast.co.za',
    commissionPercent: Number(process.env.PLATFORM_COMMISSION_PERCENT || 10),
  },
  ai: {
    provider: process.env.AI_PROVIDER || 'anthropic',
    model: process.env.AI_MODEL || 'claude-sonnet-4.5',
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  },
  supabase: {
    url: process.env.SUPABASE_URL,
    anonKey: process.env.SUPABASE_ANON_KEY,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  }
};
