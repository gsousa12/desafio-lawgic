# Dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN npm install -g pnpm@latest
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# Builder
FROM node:20-alpine AS builder
WORKDIR /app
RUN npm install -g pnpm@latest
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm prisma:generate
RUN pnpm build

# Runner
FROM node:20-alpine AS runner
WORKDIR /app
RUN apk add --no-cache libc6-compat netcat-openbsd dos2unix && \
    npm install -g pnpm@latest && \
    addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Artefatos da build
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/pnpm-workspace.yaml ./pnpm-workspace.yaml

# Prisma schema
COPY --from=builder /app/src/database/prisma ./src/database/prisma

# EntryPoint
COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN dos2unix /app/docker-entrypoint.sh && chmod 0755 /app/docker-entrypoint.sh

USER nestjs
EXPOSE 3000

# Commands
ENTRYPOINT ["/app/docker-entrypoint.sh"]