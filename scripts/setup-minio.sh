#!/bin/bash

# Script para configurar bucket no MinIO
echo "🪣 Configurando bucket no MinIO..."

# Aguardar MinIO estar pronto
sleep 5

# Instalar MinIO client no container
docker-compose exec -T minio sh -c "
    # Criar alias para o MinIO local
    mc alias set local http://localhost:9000 ${MINIO_ROOT_USER:-minioadmin} ${MINIO_ROOT_PASSWORD:-minioadmin}
    
    # Criar bucket se não existir
    mc mb local/${MINIO_BUCKET_NAME:-uploads} --ignore-existing
    
    # Configurar política pública para o bucket (opcional, para desenvolvimento)
    mc anonymous set download local/${MINIO_BUCKET_NAME:-uploads}
    
    echo '✅ Bucket configurado com sucesso!'
"
