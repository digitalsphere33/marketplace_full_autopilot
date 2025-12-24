Deployment Notes

1) Build images (production):
   docker compose build

2) Start services:
   docker compose up -d

3) Environment variables (example):
   - PGHOST=db
   - PGPORT=5432
   - PGUSER=postgres
   - PGPASSWORD=postgres
   - PGDATABASE=postgres
   - REDIS_URL=redis://redis:6379
   - JWT_SECRET=<your_jwt_secret>
   - PAYFAST_MERCHANT_ID=
   - PAYFAST_MERCHANT_KEY=
   - PAYFAST_PASSPHRASE=
   - PLATFORM_COMMISSION_PERCENT=10
   - ALLOW_HTTP_DEV=false (production)

4) HTTPS: front the `frontend` static site with an HTTPS reverse proxy (nginx/Caddy).

5) Database migrations: run `docker compose exec api node src/migrate.js` or `cd api && npm run migrate`.

6) Payout worker: run ledger payout worker to process scheduled payouts (simulated until payment integration implemented):
   - One-off: `docker compose exec api node bin/run_worker.js once`
   - Continuous: `docker compose exec api node bin/run_worker.js loop`

7) Monitoring: forward logs via `docker compose logs -f api` or attach to a log collector.

8) Rollback: use previous Docker image tag and `docker compose up -d`.
