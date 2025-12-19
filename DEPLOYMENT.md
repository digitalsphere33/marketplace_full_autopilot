# MzansiMart Deployment Guide

## Development (Current State)

**Status:** ✅ Complete - Ready for local testing

**What's Built:**
- ✅ Backend API with all routes (auth, sellers, listings, checkout, admin, disputes, orders, webhooks)
- ✅ ML NSFW moderation service
- ✅ Frontend with all pages (onboarding, listings, checkout, orders, admin)
- ✅ PayFast split payment integration
- ✅ Claude Sonnet 4.5 AI globally enabled
- ✅ Database schema with in-memory fallback
- ✅ PWA configuration

**Run Locally:**
```powershell
# Terminal 1: ML Service
cd ml
pip install -r requirements.txt
python -m uvicorn app:app --host 0.0.0.0 --port 8000

# Terminal 2: API
cd api
npm install
npm run dev

# Terminal 3: Frontend
cd frontend
npm install
npm run dev
```

Access: http://localhost:5173

## Week 1 Goals (Per GAMEPLAN.md)

- [x] Payment gateway setup (PayFast sandbox configured)
- [x] Database + backend skeleton (complete with all routes)
- [ ] One successful test transaction (ready to test - follow README smoke test)

## Week 2 Goals

- [x] Listings + checkout (implemented)
- [x] Seller onboarding (implemented with KYC verification)
- [x] Admin dashboard (implemented)

## Week 3 Goals

- [x] NSFW screening (ML service ready)
- [ ] Seller limits (schema ready, enforcement to be added)
- [ ] Production deployment (requires human input)

## Production Setup

### Prerequisites
1. Domain name registered
2. Server/VPS with:
   - Ubuntu 22.04 LTS
   - 2GB+ RAM
   - Docker + Docker Compose installed
3. PayFast merchant account (live credentials)
4. Email service (for notifications)

### Step 1: Server Setup
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt install docker-compose-plugin

# Clone repository
git clone <your-repo-url>
cd marketplace_full_autopilot
```

### Step 2: Environment Configuration
```bash
cd api
cp .env.example .env
nano .env
```

Update these critical values:
```env
NODE_ENV=production
ALLOW_HTTP_DEV=false
USE_PGMEM=false

# Database (use real PostgreSQL)
PGHOST=db
PGPORT=5432
PGUSER=mzansimart
PGPASSWORD=<strong-password>
PGDATABASE=mzansimart

# Redis
REDIS_URL=redis://redis:6379

# JWT
JWT_SECRET=<generate-strong-secret>

# PayFast LIVE credentials
PAYFAST_MERCHANT_ID=<your-live-merchant-id>
PAYFAST_MERCHANT_KEY=<your-live-merchant-key>
PAYFAST_PASSPHRASE=<your-live-passphrase>
PAYFAST_BASE_URL=https://www.payfast.co.za
PLATFORM_COMMISSION_PERCENT=10

# AI
AI_PROVIDER=anthropic
AI_MODEL=claude-sonnet-4.5
ANTHROPIC_API_KEY=<your-key-if-using-ai>
```

### Step 3: Update docker-compose.yml

Remove `USE_PGMEM=true` and configure real Postgres:
```yaml
services:
  db:
    image: postgres:15
    environment:
      POSTGRES_USER: mzansimart
      POSTGRES_PASSWORD: ${PGPASSWORD}
      POSTGRES_DB: mzansimart
    volumes:
      - pgdata:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  pgdata:
```

### Step 4: HTTPS with Nginx

Install Nginx and Certbot:
```bash
sudo apt install nginx certbot python3-certbot-nginx
```

Configure Nginx (`/etc/nginx/sites-available/mzansimart`):
```nginx
server {
    listen 80;
    server_name yourdomain.co.za;

    location / {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Forwarded-Proto https;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
    }
}
```

Enable HTTPS:
```bash
sudo ln -s /etc/nginx/sites-available/mzansimart /etc/nginx/sites-enabled/
sudo certbot --nginx -d yourdomain.co.za
sudo systemctl restart nginx
```

### Step 5: Launch Services
```bash
docker compose up -d --build
docker compose logs -f
```

### Step 6: Create Admin User
```bash
docker compose exec api node -e "
const { pool } = require('./src/db.js');
const { v4: uuid } = require('uuid');
const bcrypt = require('bcryptjs');

(async () => {
  const id = uuid();
  const email = 'admin@mzansimart.co.za';
  const hash = await bcrypt.hash('CHANGE_THIS_PASSWORD', 10);
  await pool.query('INSERT INTO users(id,email,role,password_hash) VALUES(\$1,\$2,\$3,\$4)', 
    [id, email, 'admin', hash]);
  console.log('Admin created:', email);
  process.exit(0);
})();
"
```

### Step 7: Test Live Transaction
1. Login as a seller
2. Create a listing
3. Make a test purchase with real payment
4. Verify commission split in admin dashboard
5. Check PayFast dashboard for split confirmation

### Step 8: Onboard Sellers
- Manually onboard 10-20 trusted sellers initially
- Verify their business information
- Set payout delays for new sellers (7 days default)

## Monitoring

**Check logs:**
```bash
docker compose logs -f api
docker compose logs -f ml
```

**Database backup:**
```bash
docker compose exec db pg_dump -U mzansimart mzansimart > backup.sql
```

**Monitor PayFast:**
- Check daily in PayFast merchant dashboard
- Verify split payments are working
- Review any failed transactions

## Troubleshooting

**API won't start:**
- Check `docker compose logs api`
- Verify all environment variables are set
- Ensure JWT_SECRET is configured

**Payments not splitting:**
- Verify PayFast live credentials
- Check webhook signature validation
- Review PayFast split payment documentation
- Ensure merchant account supports splits

**NSFW detection not working:**
- Install actual Falconsai package in ml/requirements.txt
- Check ML service logs
- Verify image URLs are accessible

## Support & Maintenance

**Regular tasks:**
- Monitor admin dashboard daily
- Review flagged items
- Process disputes
- Backup database weekly
- Update dependencies monthly

**Scaling:**
- Add Redis for sessions at scale
- Use managed PostgreSQL (e.g., DigitalOcean)
- Add CDN for images
- Enable horizontal scaling with load balancer
