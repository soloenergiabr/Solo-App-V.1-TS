#!/bin/sh
# Backup diario do banco e dos PDFs. Roda dentro do container "backup" do
# docker-compose.prod.yml. Restaurar o banco:
#   gunzip -c backups/db-AAAAMMDD-HHMM.sql.gz | docker exec -i solo-energy-postgres-prod psql -U <user> -d <db>
set -eu

KEEP_DAYS="${BACKUP_KEEP_DAYS:-14}"
HOUR="${BACKUP_HOUR:-3}"

run_backup() {
    stamp="$(date +%Y%m%d-%H%M)"
    echo "[backup] $stamp iniciando"
    # Escreve em .tmp e renomeia: um dump pela metade nunca parece valido.
    pg_dump --no-owner --no-privileges | gzip > "/backups/db-$stamp.sql.gz.tmp"
    mv "/backups/db-$stamp.sql.gz.tmp" "/backups/db-$stamp.sql.gz"
    if [ -d /minio-data ]; then
        tar -czf "/backups/files-$stamp.tar.gz.tmp" -C /minio-data .
        mv "/backups/files-$stamp.tar.gz.tmp" "/backups/files-$stamp.tar.gz"
    fi
    find /backups -name '*.gz' -mtime +"$KEEP_DAYS" -delete
    echo "[backup] $stamp concluido"
}

# Um backup ao subir o container e depois um por dia na hora BACKUP_HOUR.
run_backup || echo "[backup] falhou, tenta de novo no proximo ciclo"
while true; do
    now_h="$(date +%H | sed 's/^0//')"; now_m="$(date +%M | sed 's/^0//')"
    wait_s=$(( ((HOUR - ${now_h:-0} + 24) % 24) * 3600 - ${now_m:-0} * 60 ))
    [ "$wait_s" -le 0 ] && wait_s=$(( wait_s + 86400 ))
    sleep "$wait_s"
    run_backup || echo "[backup] falhou, tenta de novo no proximo ciclo"
done
