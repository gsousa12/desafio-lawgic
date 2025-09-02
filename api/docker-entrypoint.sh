#!/bin/sh
set -e

echo "Aguarde a aplicação de migrações e seed no banco de dados..."

echo "⏳ Aguardando PostgreSQL..."
while ! nc -z -w 1 postgres 5432; do
  sleep 1
done
echo "✅ Conectado com sucesso!"

# Executar migrations
echo "📦 Aplicando migrations..."
pnpm prisma:deploy

# Executar seed
echo "🌱 Aplicando seed..."
pnpm prisma:seed

echo "🎯 Iniciando API..."
exec pnpm start:prod