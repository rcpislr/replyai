FROM node:18-alpine AS builder

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
COPY apps/admin ./apps/admin
COPY packages ./packages

RUN npm install -g pnpm && pnpm install --frozen-lockfile

WORKDIR /app/apps/admin
RUN pnpm build

FROM node:18-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
COPY apps/admin ./apps/admin
COPY packages ./packages

RUN npm install -g pnpm && pnpm install --frozen-lockfile --prod

COPY --from=builder /app/apps/admin/.next ./apps/admin/.next

EXPOSE 3003

CMD ["sh", "-c", "cd apps/admin && npm start"]
