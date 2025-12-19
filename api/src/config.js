import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  env: process.env.NODE_ENV || 'development',
  allowHttpDev: process.env.ALLOW_HTTP_DEV === 'true',
  jwtSecret: process.env.JWT_SECRET,
  db: {
    host: process.env.PGHOST,
    port: Number(process.env.PGPORT || 5432),
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
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
};
