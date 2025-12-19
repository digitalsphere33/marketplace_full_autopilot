import { Pool } from 'pg';
import { config } from './config.js';
import { newDb } from 'pg-mem';

let pool;
if (process.env.USE_PGMEM === 'true') {
  const mem = newDb();
  const adapter = mem.adapters.createPg();
  pool = new adapter.Pool();
} else {
  pool = new Pool(config.db);
}

export async function ensureSchema() {
  const useMem = process.env.USE_PGMEM === 'true';
  const ext = useMem ? '' : 'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";\n';
  const ddl = `
${ext}

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;

CREATE TABLE IF NOT EXISTS sellers (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  kyc_status TEXT DEFAULT 'pending',
  payout_delay_days INT DEFAULT 7
);

CREATE TABLE IF NOT EXISTS listings (
  id UUID PRIMARY KEY,
  seller_id UUID REFERENCES sellers(id),
  title TEXT,
  price NUMERIC,
  status TEXT DEFAULT 'draft',
  category TEXT DEFAULT 'Electronics',
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY,
  buyer_id UUID REFERENCES users(id),
  total NUMERIC,
  status TEXT,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ledger (
  id UUID PRIMARY KEY,
  order_id UUID,
  platform_fee NUMERIC,
  seller_amount NUMERIC
);

CREATE TABLE IF NOT EXISTS flagged_items (
  id UUID PRIMARY KEY,
  seller_id UUID,
  listing_title TEXT,
  reason TEXT,
  created_at TIMESTAMP DEFAULT now()
);
`;
  await pool.query(ddl);
}

export { pool };
