CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE sellers (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  kyc_status TEXT DEFAULT 'pending',
  payout_delay_days INT DEFAULT 7
);

CREATE TABLE listings (
  id UUID PRIMARY KEY,
  seller_id UUID REFERENCES sellers(id),
  title TEXT,
  price NUMERIC,
  status TEXT DEFAULT 'draft'
);

CREATE TABLE orders (
  id UUID PRIMARY KEY,
  buyer_id UUID REFERENCES users(id),
  total NUMERIC,
  status TEXT,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE ledger (
  id UUID PRIMARY KEY,
  order_id UUID,
  platform_fee NUMERIC,
  seller_amount NUMERIC
);