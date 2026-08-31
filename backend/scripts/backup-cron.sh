#!/usr/bin/env bash
#
# backup-cron.sh — Proceso de respaldo periódico para ejecutar dentro de un
# contenedor Docker. Repite el respaldo cada BACKUP_INTERVAL_HOURS horas.
#
# Variables de entorno:
#   DATABASE_URL          Cadena de conexión PostgreSQL (obligatoria)
#   BACKUP_INTERVAL_HOURS Horas entre respaldos (default: 24)
#   KEEP_BACKUPS          Cantidad de respaldos a conservar (default: 14)
#   BACKUP_DIR            Carpeta destino (default: /backups)
#
# La restauración se hace con:
#   gunzip -c <archivo>.sql.gz | psql "$DATABASE_URL"
#

set -euo pipefail

INTERVAL_HOURS="${BACKUP_INTERVAL_HOURS:-24}"
KEEP_BACKUPS="${KEEP_BACKUPS:-14}"
BACKUP_DIR="${BACKUP_DIR:-/backups}"
INTERVAL_SECONDS=$((INTERVAL_HOURS * 3600))

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "ERROR: DATABASE_URL no está definida" >&2
  exit 1
fi

mkdir -p "$BACKUP_DIR"

dump_db() {
  TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
  OUTPUT_FILE="$BACKUP_DIR/mantenimientoplus_$TIMESTAMP.sql.gz"

  echo "[$(date '+%Y-%m-%d %H:%M:%S')] Ejecutando backup -> $OUTPUT_FILE"

  if pg_dump "$DATABASE_URL" --no-owner --no-privileges | gzip > "$OUTPUT_FILE.tmp"; then
    mv "$OUTPUT_FILE.tmp" "$OUTPUT_FILE"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Backup OK ($(du -h "$OUTPUT_FILE" | cut -f1))"
  else
    rm -f "$OUTPUT_FILE.tmp"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR generando backup" >&2
  fi

  # Rotación
  COUNT="$(ls -1 "$BACKUP_DIR"/mantenimientoplus_*.sql.gz 2>/dev/null | wc -l)"
  if [[ "$COUNT" -gt "$KEEP_BACKUPS" ]]; then
    ls -1t "$BACKUP_DIR"/mantenimientoplus_*.sql.gz | tail -n +$((KEEP_BACKUPS + 1)) | while read -r old; do
      rm -f "$old"
      echo "[$(date '+%Y-%m-%d %H:%M:%S')] Backup viejo eliminado: $(basename "$old")"
    done
  fi
}

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Contenedor de backup iniciado. Intervalo: ${INTERVAL_HOURS}h. DB: ${DATABASE_URL%%@*}@***"

# Primer respaldo inmediato
dump_db

# Luego respaldar en cada intervalo
while true; do
  sleep "$INTERVAL_SECONDS"
  dump_db
done
