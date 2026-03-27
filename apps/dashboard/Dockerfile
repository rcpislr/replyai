FROM node:18-alpine AS builder

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
COPY apps/dashboard ./apps/dashboard
COPY packages ./packages

RUN npm install -g pnpm && pnpm install --frozen-lockfile

WORKDIR /app/apps/dashboard
RUN pnpm build

FROM node:18-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
COPY apps/dashboard ./apps/dashboard
COPY packages ./packages

RUN npm install -g pnpm && pnpm install --frozen-lockfile --prod

COPY --from=builder /app/apps/dashboard/.next ./apps/dashboard/.next

EXPOSE 3002

CMD ["sh", "-c", "cd apps/dashboard && npm start"]
