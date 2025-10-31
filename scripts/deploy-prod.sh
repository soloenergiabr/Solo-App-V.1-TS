#!/bin/bash

echo "🚀 Deploy de Produção - Solo Energy"
echo ""

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Verificar se .env existe
if [ ! -f .env ]; then
    echo -e "${RED}❌ Arquivo .env não encontrado!${NC}"
    echo "Crie um arquivo .env com as variáveis de produção"
    exit 1
fi

echo -e "${GREEN}✅ Arquivo .env encontrado${NC}"
echo ""

# Confirmar deploy
read -p "⚠️  Tem certeza que deseja fazer deploy em PRODUÇÃO? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deploy cancelado"
    exit 0
fi

# Parar containers antigos
echo "🛑 Parando containers antigos..."
docker-compose -f docker-compose.prod.yml down
echo ""

# Build das imagens
echo "🔨 Buildando imagens de produção..."
docker-compose -f docker-compose.prod.yml build --no-cache
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erro ao buildar imagens${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Build concluído${NC}"
echo ""

# Iniciar serviços
echo "🚀 Iniciando serviços de produção..."
docker-compose -f docker-compose.prod.yml up -d
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erro ao iniciar serviços${NC}"
    exit 1
fi
echo ""

# Aguardar serviços
echo "⏳ Aguardando serviços ficarem prontos..."
sleep 15

# Rodar migrations
echo "🔄 Rodando migrations..."
docker-compose -f docker-compose.prod.yml exec -T app npx prisma migrate deploy
if [ $? -ne 0 ]; then
    echo -e "${YELLOW}⚠️  Erro ao rodar migrations. Continue manualmente.${NC}"
fi
echo ""

# Status
echo "📊 Status dos containers:"
docker-compose -f docker-compose.prod.yml ps
echo ""

echo -e "${GREEN}✅ Deploy concluído!${NC}"
echo ""
echo "🌐 Aplicação rodando em: http://localhost:3000"
echo ""
echo "📝 Comandos úteis:"
echo "  - Ver logs: docker-compose -f docker-compose.prod.yml logs -f"
echo "  - Parar: docker-compose -f docker-compose.prod.yml down"
echo "  - Restart: docker-compose -f docker-compose.prod.yml restart"
