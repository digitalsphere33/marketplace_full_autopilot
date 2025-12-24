# Production multi-stage Dockerfile for frontend (Vite build + Nginx)
FROM node:20-alpine AS builder
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend ./frontend
WORKDIR /app/frontend
RUN npm run build

FROM nginx:stable-alpine AS runner
COPY --from=builder /app/frontend/dist /usr/share/nginx/html
# Copy a minimal nginx config if needed later
EXPOSE 80
CMD ["/usr/sbin/nginx", "-g", "daemon off;"]
