API Credentials Guide

This guide shows where to obtain the credentials the app requires. Copy values into `api/.env` or set them in your hosting provider.

1) JWT Secret
- Purpose: Signs your JWT tokens securely.
- How to create: Use a secure random string generator (32+ chars). Example: `openssl rand -hex 32`

2) PostgreSQL
- Purpose: Primary data storage.
- Options:
  - Use managed Postgres: ElephantSQL, Amazon RDS, DigitalOcean Managed DB
  - Run locally via `docker compose up db`
- Use host/port/user/password/database in envs: `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`

3) Redis
- Purpose: Rate limits, verification codes, ephemeral state.
- Options:
  - Managed Redis: Upstash, Redis Labs, Amazon ElastiCache
  - Run locally via `docker compose up redis`
- Set `REDIS_URL` (e.g., `redis://redis:6379` or `redis://:password@host:port`) in env.

4) PayFast (South Africa) — Payments
- Purpose: Process buyer payments and receive IPN webhooks.
- Developer (sandbox) flow:
  - Sign up at https://www.payfast.co.za/ (or use sandbox docs)
  - For sandbox testing, refer to: https://developers.payfast.co.za/
  - Obtain: `merchant id`, `merchant key`, and optionally `passphrase`.
- Set envs: `PAYFAST_MERCHANT_ID`, `PAYFAST_MERCHANT_KEY`, `PAYFAST_PASSPHRASE`, `PAYFAST_BASE_URL` (for sandbox `https://sandbox.payfast.co.za`)

5) Supabase (recommended for OAuth & Images)
- Purpose: Handle Google login (OAuth), store product images.
- Steps:
  - Create account at https://app.supabase.com/
  - Create a new Project -> Settings -> API
  - Copy `Project URL`, `Service Role Key`, `anon public` key
  - Enable Google OAuth: Authentication -> Providers -> Google -> Enable, add Client ID/Secret (get from Google Console at https://console.cloud.google.com/)
  - Create Storage bucket named `images` (public)
- Set envs: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY` (for client), `SUPABASE_BUCKET=images`
- Supabase docs: https://supabase.com/docs

6) Sentry (optional) — Error Reporting
- Purpose: Capture exceptions and performance traces.
- Create a project at https://sentry.io/ and copy the DSN
- Set env: `SENTRY_DSN`

7) Other Notes
- For production HTTPS, configure a reverse proxy (nginx/Caddy) and ensure `ALLOW_HTTP_DEV=false`.
- For PayFast IPNs, ensure your notify URL is publicly reachable and configured in PayFast dashboard.

If you want, I can walk you through creating any of these accounts and copy the exact fields you need to paste into `.env`.
