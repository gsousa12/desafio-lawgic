set -e
echo "Aguarde a aplicação de migrações e seed no banco de dados..."

echo "⏳ Aguardando PostgreQl..."
while ! nc -z postgres 5432; do
  sleep 1
done
echo "✅ Conectado com sucesso!"

# Executar migrations
echo "📦 Aguarde enquanto aplico as migrations..."
pnpm prisma:deploy

# Executar seed
echo "🌱 Aplicando seed no banco de dados..."
pnpm prisma:seed

echo "🎯 Iniciando API..."
exec pnpm start:prod