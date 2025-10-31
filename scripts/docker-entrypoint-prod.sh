#!/bin/sh
set -e

echo "🚀 Iniciando aplicação Solo Energy (Produção)..."

# Aguarda o postgres estar pronto
echo "⏳ Aguardando PostgreSQL..."
max_attempts=30
attempt=0

while [ $attempt -lt $max_attempts ]; do
  if nc -z postgres 5432 2>/dev/null; then
    echo "✅ PostgreSQL está pronto!"
    break
  fi
  attempt=$((attempt + 1))
  echo "PostgreSQL ainda não está pronto - aguardando... ($attempt/$max_attempts)"
  sleep 2
done

if [ $attempt -eq $max_attempts ]; then
  echo "❌ Timeout aguardando PostgreSQL"
  exit 1
fi

# Gera o Prisma Client (caso não tenha sido gerado)
echo "📦 Gerando Prisma Client..."
npx prisma generate || true

# Roda as migrations
echo "🔄 Rodando migrations..."
npx prisma migrate deploy

# Roda o seed (apenas se não existir usuário master)
echo "🌱 Verificando seed..."
npx tsx prisma/seed.ts || echo "⚠️  Seed já foi executado ou falhou (continuando...)"

# Inicia a aplicação
echo "🎉 Iniciando aplicação Next.js..."
exec "$@"
