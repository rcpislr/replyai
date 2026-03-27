# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy root files
COPY package.json pnpm-lock.yaml ./
COPY apps/api ./apps/api
COPY packages ./packages

# Install dependencies
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Build
WORKDIR /app/apps/api
RUN pnpm build

# Runtime stage
FROM node:18-alpine

WORKDIR /app

# Install runtime dependencies only
COPY package.json pnpm-lock.yaml ./
COPY apps/api ./apps/api
COPY packages ./packages

RUN npm install -g pnpm && pnpm install --frozen-lockfile --prod

# Copy built files
COPY --from=builder /app/apps/api/dist ./apps/api/dist

EXPOSE 3001

CMD ["node", "apps/api/dist/index.js"]
