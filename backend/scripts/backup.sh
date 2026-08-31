#!/usr/bin/env bash
#
# backup.sh — Respaldo automático de la base de datos PostgreSQL.
#
# Crea un volcado comprimido (pg_dump + gzip) con fecha y hora en el nombre,
# y conserva únicamente los últimos KEEP_BACKUPS respaldos (rotación), para
# que los datos nunca se pierdan por corrupción, borrado accidental o fallo
# del disco.
#
# Uso:
#   ./backup.sh                  # genera un backup ahora
#   ./backup.sh --keep 10        # genera backup y conserva los últimos 10
#   ./backup.sh --container mp-postgres  # fuerza el uso de un contenedor postgres concreto
#
# Funcionamiento:
#   - Si hay `pg_dump` disponible en el host, lo usa directamente.
#   - Si no (por ejemplo Postgres corre en Docker), lo ejecuta dentro del
#     contenedor postgres vía `docker exec` (el contenedor sí trae pg_dump).
#   - El contenedor se detecta automáticamente (CONTAINER) o se puede fijar
#     con --container.
#
# Programación con cron (backup diario, ejemplo a las 3:00 AM):
#   0 3 * * * cd /ruta/al/proyecto/backend && ./scripts/backup.sh >> /var/log/mantenimientoplus_backup.log 2>&1
#

set -euo pipefail

# ---------- Configuración ----------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
ENV_FILE="$BACKEND_DIR/.env"

# Carpeta destino de los backups (por defecto /backups/backend en la raíz del repo)
PROJECT_ROOT="$(cd "$BACKEND_DIR/.." && pwd)"
BACKUP_DIR="${BACKUP_DIR:-$PROJECT_ROOT/backups/backend}"

# Cantidad de backups a conservar (rotación automática)
KEEP_BACKUPS="${KEEP_BACKUPS:-14}"

# Contenedor postgres a usar si pg_dump no está en el host (entorno Docker).
# Se detecta automáticamente si se deja vacío, o se fija con --container.
CONTAINER="${CONTAINER:-}"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --keep)
      KEEP_BACKUPS="$2"
      shift 2
      ;;
    --container)
      CONTAINER="$2"
      shift 2
      ;;
    *)
      echo "Argumento desconocido: $1"
      exit 1
      ;;
  esac
done

# ---------- Cargar DATABASE_URL ----------
if [[ ! -f "$ENV_FILE" ]]; then
  echo "ERROR: No se encontró $ENV_FILE" >&2
  exit 1
fi

# Extraer la línea DATABASE_URL limpiando comillas opcionales y el prefijo export
DATABASE_URL="$(grep -E '^DATABASE_URL=' "$ENV_FILE" | head -1 | sed 's/^DATABASE_URL=//; s/^export[[:space:]]*//; s/^"//; s/"$//')"
if [[ -z "$DATABASE_URL" ]]; then
  echo "ERROR: DATABASE_URL no está definido en $ENV_FILE" >&2
  exit 1
fi

# ---------- Parsear DATABASE_URL ----------
# Formato: postgresql://usuario:password@host:puerto/basedatos
if [[ "$DATABASE_URL" =~ ^postgres(ql)?://([^:]+):([^@]*)@([^:]+):([0-9]+)/([^?]+) ]]; then
  PGUSER="${BASH_REMATCH[2]}"
  PGPASSWORD="${BASH_REMATCH[3]}"
  PGHOST="${BASH_REMATCH[4]}"
  PGPORT="${BASH_REMATCH[5]}"
  PGDATABASE="${BASH_REMATCH[6]}"
else
  echo "ERROR: No se pudo interpretar DATABASE_URL" >&2
  exit 1
fi

export PGPASSWORD

# ---------- Crear carpeta de destino ----------
mkdir -p "$BACKUP_DIR"

# ---------- Determinar cómo ejecutar pg_dump ----------
if command -v pg_dump >/dev/null 2>&1; then
  # pg_dump disponible en el host
  run_pg_dump() {
    pg_dump -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDATABASE" --no-owner --no-privileges
  }
  echo "Usando pg_dump del sistema operativo."
else
  # Sin pg_dump local: usar el contenedor postgres vía docker exec
  if ! command -v docker >/dev/null 2>&1; then
    echo "ERROR: No hay pg_dump disponible y no se encontró docker. Instala postgresql-client o docker." >&2
    exit 1
  fi

  # Detectar contenedor postgres si no se especificó
  if [[ -z "$CONTAINER" ]]; then
    CONTAINER="$(docker ps --format '{{.Names}}' | grep -iE 'postgres|mysql|db' | head -1 || true)"
  fi

  if [[ -z "$CONTAINER" ]]; then
    echo "ERROR: No se pudo detectar el contenedor postgres. Pásalo con --container <nombre>." >&2
    exit 1
  fi

  if ! docker exec "$CONTAINER" true 2>/dev/null; then
    echo "ERROR: El contenedor '$CONTAINER' no está corriendo o no es accesible." >&2
    exit 1
  fi

  # NOTA: dentro del contenedor la DB suele usar hostname local y su propio user.
  # Si el contenedor usa una DB con credenciales propias, se puede sobreescribir
  # PGUSER/PGPASSWORD/PGDATABASE con variables de entorno antes de llamar.
  CONTAINER_DB="${PGDATABASE:-mantenimientoplus}"
  CONTAINER_USER="${PGUSER:-mantenimientoplus}"

  run_pg_dump() {
    docker exec -e PGPASSWORD="$PGPASSWORD" "$CONTAINER" \
      pg_dump -U "$CONTAINER_USER" -d "$CONTAINER_DB" --no-owner --no-privileges
  }
  echo "Usando pg_dump del contenedor '$CONTAINER'."
fi

# ---------- Generar backup con fecha ----------
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
OUTPUT_FILE="$BACKUP_DIR/mantenimientoplus_$TIMESTAMP.sql.gz"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Iniciando backup de '$PGDATABASE' -> $OUTPUT_FILE"

# pg_dump: respaldo lógico completo con datos y estructura.
# Se puede restaurar con:  gunzip -c <archivo>.sql.gz | psql -d basedatos
if run_pg_dump | gzip > "$OUTPUT_FILE.tmp"; then
  mv "$OUTPUT_FILE.tmp" "$OUTPUT_FILE"
  SIZE="$(du -h "$OUTPUT_FILE" | cut -f1)"
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] Backup completado correctamente ($SIZE)"
else
  rm -f "$OUTPUT_FILE.tmp"
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: Falló la generación del backup" >&2
  exit 1
fi

# ---------- Rotación: conservar solo los últimos KEEP_BACKUPS ----------
COUNT="$(ls -1 "$BACKUP_DIR"/mantenimientoplus_*.sql.gz 2>/dev/null | wc -l)"
if [[ "$COUNT" -gt "$KEEP_BACKUPS" ]]; then
  ls -1t "$BACKUP_DIR"/mantenimientoplus_*.sql.gz | tail -n +$((KEEP_BACKUPS + 1)) | while read -r old; do
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Eliminando backup viejo: $(basename "$old")"
    rm -f "$old"
  done
fi

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Backup finalizado. Total backups en '$BACKUP_DIR': $(ls -1 "$BACKUP_DIR"/mantenimientoplus_*.sql.gz 2>/dev/null | wc -l)"
