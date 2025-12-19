# MzansiMart – SA Multi‑Vendor Marketplace (MVP)

Revenue‑first MVP following PRD/ARCHITECTURE/STYLING/PAYMENTS/GAMEPLAN.

## Stack
- API: Node.js + Fastify, JWT, PostgreSQL, Redis
- ML: FastAPI NSFW moderation (Falconsai model plug‑in)
- Frontend: React + Vite + Tailwind + Framer Motion (PWA)
- Orchestration: Docker Compose OR local dev

## Quick Start (Local Development - Recommended)

**Prerequisites:**
- Node.js 20 LTS (for Fastify compatibility)
- Python 3.11+

**Start Services:**

1. **ML Service** (Terminal 1):
```powershell
cd ml
pip install -r requirements.txt
python -m uvicorn app:app --host 0.0.0.0 --port 8000
```

2. **API Service** (Terminal 2):
```powershell
cd api
npm install
npm run dev
```

3. **Frontend** (Terminal 3):
```powershell
cd frontend
npm install
npm run dev
```

Access: http://localhost:5173

## Environment
API uses `api/.env` with safe dev defaults (pg-mem + in-memory Redis).

Key vars:
- `PG*` Postgres settings
- `REDIS_URL` Redis connection
- `JWT_SECRET` JWT signing key
- `PAYFAST_*` gateway settings (sandbox by default)
- `PLATFORM_COMMISSION_PERCENT` platform fee percent
- `AI_PROVIDER=anthropic`, `AI_MODEL=claude-sonnet-4.5` (global enable)

## API Endpoints (MVP)
- `POST /auth/register` → `{email,password}`
- `POST /auth/login` → JWT
- `POST /sellers` → create seller (JWT)
- `GET /listings` → browse
- `POST /listings` → create listing (NSFW moderated) (JWT)
- `POST /checkout` → create order & PayFast redirect (JWT)
- `POST /webhooks/payfast` → IPN handler
- `GET /admin/*` → simple dashboards (admin JWT)
- `POST /disputes` → open dispute (JWT)

## Payments (PayFast Split)
- Commission auto‑computed by `PLATFORM_COMMISSION_PERCENT`.
- IPN verifies signature and writes `orders` and `ledger`.
> Adjust field names to exact PayFast docs during Final Setup.

## NSFW Moderation
- FastAPI tries Falconsai `nsfw_image_detection` if installed.
- Fallback heuristic blocks tiny images (demo only).

## Frontend
Minimal listings page in `frontend/src/pages/App.jsx` with mobile‑first Tailwind styling and PWA.

## Testing (MVP Smoke)

**1. Seller Onboarding:**
- Navigate to Onboarding tab
- Register with email/password
- Login to get JWT token
- Create seller account
- Request verification code (displayed in dev)
- Confirm verification

**2. Create Listing:**
- Use Listings tab (after onboarding)
- Add title, price, image URL
- NSFW images will be blocked and logged

**3. Checkout Flow:**
- Go to Checkout tab
- Enter JWT token, seller ID, and total amount
- Click "Create PayFast Payment"
- Capture the PayFast redirect URL (sandbox)

**4. Simulate Payment (IPN):**
```powershell
cd api
$env:ORDER_ID = "order-id-from-checkout"
npm run simulate:ipn
```

**5. Admin Dashboard:**
```powershell
# Promote yourself to admin (dev only)
Invoke-RestMethod -Method POST -Uri http://localhost:3000/admin/promote `
  -Headers @{ Authorization = "Bearer YOUR_JWT_TOKEN" }
```
- View stats, orders, ledger entries, and flagged items in Admin tab

**6. Buyer Order Tracking:**
- Orders tab → enter JWT → view your orders

## Final Setup (Human Input Only)
1. Add PayFast live merchant credentials in production `.env`
2. Configure domain + HTTPS reverse proxy
3. Set `ALLOW_HTTP_DEV=false` for production
4. Create admin user manually in database
5. Optional: add SnapScan QR payments

## Production Deployment Checklist
- [ ] Install Docker Desktop OR setup PostgreSQL + Redis
- [ ] Update `docker-compose.yml` with production settings
- [ ] Set production environment variables
- [ ] Configure HTTPS (Let's Encrypt + Nginx/Caddy)
- [ ] Add PayFast live credentials
- [ ] Test one real transaction end-to-end
- [ ] Onboard 10-20 initial sellers
- [ ] Monitor admin dashboard daily
