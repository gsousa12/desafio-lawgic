# Stage 1: Dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Instalar pnpm
RUN npm install -g pnpm@latest

# Copiar arquivos de dependência
COPY .env package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Instalar dependências
RUN pnpm install --frozen-lockfile

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

# Instalar pnpm
RUN npm install -g pnpm@latest

# Copiar dependências instaladas
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Gerar Prisma Client
RUN pnpm prisma:generate

# Build da aplicação
RUN pnpm build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app

# Instalar pnpm e adicionar user não-root
RUN npm install -g pnpm@latest && \
    addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Copiar arquivos necessários
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/pnpm-workspace.yaml ./pnpm-workspace.yaml

# Copiar schema e seed do Prisma
COPY --from=builder /app/src/database/prisma ./src/database/prisma

# Copiar script de entrada
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

# Definir usuário
USER nestjs

# Expor porta
EXPOSE 3000

# Comando de entrada
ENTRYPOINT ["./docker-entrypoint.sh"]