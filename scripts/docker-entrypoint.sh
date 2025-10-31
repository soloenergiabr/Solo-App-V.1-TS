#!/bin/sh
set -e

echo "🚀 Iniciando aplicação Solo Energy..."

# Aguarda o postgres estar pronto
echo "⏳ Aguardando PostgreSQL..."
until nc -z postgres 5432; do
  echo "PostgreSQL ainda não está pronto - aguardando..."
  sleep 2
done
echo "✅ PostgreSQL está pronto!"

# Aguarda o Redis estar pronto
echo "⏳ Aguardando Redis..."
until nc -z redis 6379; do
  echo "Redis ainda não está pronto - aguardando..."
  sleep 2
done
echo "✅ Redis está pronto!"

# Gera o Prisma Client
echo "📦 Gerando Prisma Client..."
npx prisma generate

# Roda as migrations
echo "🔄 Rodando migrations..."
npx prisma migrate deploy

# Inicia a aplicação
echo "🎉 Iniciando aplicação Next.js..."
exec "$@"
