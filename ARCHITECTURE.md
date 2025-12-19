# ARCHITECTURE.md

## System Overview
Frontend (React) → API Gateway → Services → Database

## Services
- Auth Service (JWT)
- Marketplace Service (Listings, Orders)
- Payment Service (Webhooks, Split logic)
- ML Service (NSFW detection)

## Storage
- PostgreSQL (primary data)
- Redis (sessions, rate limits)
- Object storage (images)

## Payment Flow
1. Buyer pays via PayFast
2. PayFast splits funds
3. Platform commission retained
4. Seller balance updated after delay

## Security
- HTTPS enforced
- Webhook signature verification
- Role-based access