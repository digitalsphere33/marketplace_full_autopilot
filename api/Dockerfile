# Production-ready multi-stage Dockerfile for API
FROM node:20-alpine AS builder
WORKDIR /app
COPY api/package.json api/package-lock.json ./
RUN npm ci --only=production
COPY api ./api
WORKDIR /app/api
# no build step required for node; keep node_modules from install

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/api /app/api
ENV NODE_ENV=production
WORKDIR /app/api
EXPOSE 3000
CMD ["node", "src/index.js"]
