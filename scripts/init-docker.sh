#!/bin/bash

echo "🐳 Inicializando ambiente Docker para Solo Energy..."
echo ""

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar se Docker está instalado
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker não está instalado!${NC}"
    echo "Por favor, instale o Docker: https://docs.docker.com/get-docker/"
    exit 1
fi

# Verificar se Docker Compose está instalado
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose não está instalado!${NC}"
    echo "Por favor, instale o Docker Compose: https://docs.docker.com/compose/install/"
    exit 1
fi

echo -e "${GREEN}✅ Docker e Docker Compose encontrados${NC}"
echo ""

# Verificar se arquivo .env existe
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  Arquivo .env não encontrado${NC}"
    echo "Criando .env a partir do env.docker.example..."
    cp env.docker.example .env
    echo -e "${GREEN}✅ Arquivo .env criado${NC}"
    echo -e "${YELLOW}⚠️  Por favor, revise o arquivo .env e ajuste as variáveis conforme necessário${NC}"
    echo ""
else
    echo -e "${GREEN}✅ Arquivo .env encontrado${NC}"
    echo ""
fi

# Parar containers existentes
echo "🛑 Parando containers existentes..."
docker-compose down 2>/dev/null
echo ""

# Limpar volumes antigos (opcional)
read -p "Deseja limpar volumes antigos? Isso irá apagar todos os dados! (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🗑️  Removendo volumes antigos..."
    docker-compose down -v
    echo -e "${GREEN}✅ Volumes removidos${NC}"
    echo ""
fi

# Build das imagens
echo "🔨 Buildando imagens Docker..."
docker-compose build
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erro ao buildar imagens${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Imagens buildadas com sucesso${NC}"
echo ""

# Iniciar serviços
echo "🚀 Iniciando serviços..."
docker-compose up -d
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erro ao iniciar serviços${NC}"
    exit 1
fi
echo ""

# Aguardar serviços ficarem prontos
echo "⏳ Aguardando serviços ficarem prontos..."
sleep 10

# Verificar status dos containers
echo ""
echo "📊 Status dos containers:"
docker-compose ps
echo ""

# Mostrar URLs de acesso
echo -e "${GREEN}✅ Ambiente Docker inicializado com sucesso!${NC}"
echo ""
echo "🌐 URLs de acesso:"
echo "  - Aplicação Next.js: http://localhost:3000"
echo "  - MinIO Console: http://localhost:9001 (minioadmin/minioadmin)"
echo "  - MailHog UI: http://localhost:8025"
echo "  - PostgreSQL: localhost:6001"
echo ""
echo "📝 Comandos úteis:"
echo "  - Ver logs: make logs ou docker-compose logs -f"
echo "  - Parar serviços: make down ou docker-compose down"
echo "  - Acessar shell: make shell ou docker-compose exec app sh"
echo "  - Ver todos os comandos: make help"
echo ""
echo "📚 Para mais informações, consulte o arquivo DOCKER.md"
