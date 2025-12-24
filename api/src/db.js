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

CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INT DEFAULT 1,
  price NUMERIC
);

CREATE TABLE IF NOT EXISTS ledger (
  id UUID PRIMARY KEY,
  order_id UUID,
  platform_fee NUMERIC,
  seller_amount NUMERIC,
  created_at TIMESTAMP DEFAULT now(),
  seller_payout_scheduled_at TIMESTAMP,
  paid_to_seller BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS flagged_items (
  id UUID PRIMARY KEY,
  seller_id UUID,
  listing_title TEXT,
  reason TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- Products (new) for richer catalog
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  currency TEXT DEFAULT 'ZAR',
  stock INT DEFAULT 0,
  sku TEXT,
  category TEXT DEFAULT 'Electronics',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS product_images (
  id UUID PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  position INT DEFAULT 0
);

-- Reviews and ratings
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES users(id),
  rating INT CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(product_id, buyer_id) -- One review per buyer per product
);
`;
  await pool.query(ddl);
}

export { pool };
