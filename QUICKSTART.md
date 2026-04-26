# Quick Start Guide - MzansiMart

## Prerequisites

- Docker Desktop installed and **running**
- Node.js 18+ (for local development)

---

## Option 1: Start with Docker (Recommended)

### Step 1: Start Docker Desktop
Make sure Docker Desktop is running on your Windows machine.

### Step 2: Start all services
```bash
cd E:\2026\ClickPaySA\marketplace_full_autopilot
docker compose up -d
```

This will start:
- **API Backend** → http://localhost:3000
- **Frontend** → http://localhost (port 80)
- **Database** (PostgreSQL)
- **Redis** (cache)
- **ML Service** (NSFW detection)

### Step 3: Run database migrations
```bash
docker compose exec api node src/migrate.js
```

### Step 4: Create admin user (optional)
```bash
docker compose exec api node src/seed-admin.js
```

**Admin credentials:**
- Email: `admin@mzansimart.co.za`
- Password: `Admin@123`

### Step 5: Open the frontend
Open your browser and go to: **http://localhost**

---

## Option 2: Local Development (Without Docker)

### Step 1: Start Frontend Only
```bash
cd E:\2026\ClickPaySA\marketplace_full_autopilot\frontend
npm install
npm run dev
```

Frontend will be available at: **http://localhost:5173**

**Note:** API endpoints will not work without the backend running.

### Step 2: Start Backend (Optional)
In a separate terminal:
```bash
cd E:\2026\ClickPaySA\marketplace_full_autopilot\api
npm install
npm run dev
```

Backend will be available at: **http://localhost:3000**

**Note:** You'll need PostgreSQL and Redis running separately.

---

## Viewing the Frontend

Once started, you can:

1. **Browse Products** → Homepage shows product listings
2. **Search** → Use the search bar to find products
3. **Sign Up** → Click "Login / Sign Up" → Create account
4. **Google Login** → Click "Continue with Google" (requires OAuth setup)
5. **Seller Center** → Create an account and become a seller
6. **Admin Dashboard** → Login with admin credentials

---

## Stopping Services

### Docker:
```bash
docker compose down
```

### Local Dev:
Press `Ctrl+C` in the terminal running npm commands

---

## Troubleshooting

### Docker Desktop not running
**Error:** `The system cannot find the file specified`

**Solution:** Start Docker Desktop from Windows Start Menu

### Port already in use
**Error:** `Port 3000 is already allocated`

**Solution:** 
```bash
# Stop existing containers
docker compose down

# Or kill the process using the port
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Frontend shows "Failed to fetch"
**Cause:** Backend is not running

**Solution:** Make sure Docker services are running or start backend separately

---

## Quick Commands

```bash
# View logs
docker compose logs -f api
docker compose logs -f frontend

# Restart a service
docker compose restart api

# Rebuild after code changes
docker compose build api
docker compose up -d api

# Check service status
docker compose ps

# Stop everything
docker compose down

# Remove all containers and volumes (fresh start)
docker compose down -v
```

---

## Project Structure

```
marketplace_full_autopilot/
├── api/              → Backend (Node.js + Fastify)
├── frontend/         → Frontend (React + Vite + Tailwind)
├── ml/               → ML Service (Python + FastAPI)
├── README.md         → Project overview
├── PRD.md            → Product requirements + design system
├── STYLING.md        → Design system documentation
├── DEPLOYMENT_CHECKLIST.md → Complete deployment guide
├── GOOGLE_OAUTH_SETUP.md   → Google login setup
└── docker-compose.yml      → Service orchestration
```

---

## Next Steps

1. ✅ Start the services (Docker or local)
2. ✅ Open http://localhost (Docker) or http://localhost:5173 (local)
3. 🔧 Set up Google OAuth (see GOOGLE_OAUTH_SETUP.md)
4. 🔧 Configure PayFast credentials (see DEPLOYMENT_CHECKLIST.md)
5. 🚀 Deploy to production (see DEPLOYMENT_CHECKLIST.md)

---

## Support

- **Full Deployment Guide:** DEPLOYMENT_CHECKLIST.md
- **Design System:** STYLING.md
- **API Documentation:** API_CREDENTIALS.md
- **Architecture:** ARCHITECTURE.md

---

**Last Updated:** December 24, 2025  
**Status:** Production Ready ✅
