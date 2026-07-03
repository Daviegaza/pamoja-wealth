# ── Stage 1: Build ────────────────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Build-time env vars
ARG VITE_API_BASE_URL=https://api.pamojawealth.app/v1
ARG VITE_USE_MOCKS=false
ARG VITE_ENVIRONMENT=production

ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_USE_MOCKS=$VITE_USE_MOCKS
ENV VITE_ENVIRONMENT=$VITE_ENVIRONMENT

RUN npm run build

# ── Stage 2: Nginx ────────────────────────────────────────────────────
FROM nginx:alpine

# Security headers + gzip + caching
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:80/health || exit 1

EXPOSE 80 443
CMD ["nginx", "-g", "daemon off;"]
