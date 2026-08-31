#!/usr/bin/env bash
#
# Setup para desplegar MantenimientoPlus (SOLUCIONES EL INCA) dentro de un
# Samsung Galaxy A32 via Termux, SIN Docker y SIN root.
#
# Uso:
#   1) Copia este repo al telefono (con backend/dist y frontend/dist ya compilados):
#      - git clone https://github.com/Gakuus/solucioneselinca.git  (en Termux)
#      - o: termux-setup-storage  y copia el repo a ~/storage/shared, luego a ~
#   2) Instala Termux desde F-Droid (NO desde Play Store, esta deprecado).
#   3) cd solucioneselinca && bash termux-setup.sh
#
# Notas:
#   - Prisma puede fallar en Termux (bionic libc). Si `npx prisma generate`
#     falla, el backend no podra arrancar. Ese es el unico bloqueador real.
#   - Los exports PDF/Excel usan puppeteer (Chromium). Con PUPPETEER_SKIP_DOWNLOAD=1
#     esa funcionalidad no estara disponible. Instalar `pkg install chromium`
#     y ajustar la ruta en el backend si se quiere PDF.
#   - El script NO maneja encendido automatico. Usar termux-services si se quiere.

set -euo pipefail

PROJECT_DIR="${1:-$HOME/solucioneselinca}"
PGDATA="$HOME/.postgres"
PGPORT="${PGPORT:-5432}"
API_PORT="${API_PORT:-3001}"
WEB_PORT="${WEB_PORT:-5173}"
DB_USER="termux"
DB_PASS="termux123"
DB_NAME="mantenimientoplus"

log()  { echo -e "\n\e[1;32m==>\e[0m $*"; }
warn() { echo -e "\n\e[1;33m[!]\e[0m $*"; }
die()  { echo -e "\e[1;31m[ERROR]\e[0m $*" >&2; exit 1; }

# Wake lock: evita que Android duerma la CPU con pantalla apagada.
command -v termux-wake-lock >/dev/null 2>&1 && termux-wake-lock || true

log "Instalando paquetes base (Node LTS, PostgreSQL, Redis)"
pkg update -y
pkg install -y nodejs-lts postgresql redis openssl
# Opcional si se quieren exportar PDFs (pesado, ~500MB):
# pkg install -y chromium

[ -d "$PROJECT_DIR" ] || die "No existe $PROJECT_DIR. Clona o copia el repo primero."

# ---------------------------------------------------------------------------
# 1. PostgreSQL
# ---------------------------------------------------------------------------
log "Iniciando PostgreSQL (data dir: $PGDATA)"
if [ ! -d "$PGDATA" ]; then
  mkdir -p "$PGDATA"
  initdb -D "$PGDATA" --locale=C --encoding=UTF8 >/dev/null
fi

if ! pg_ctl -D "$PGDATA" status >/dev/null 2>&1; then
  pg_ctl -D "$PGDATA" -l "$PGDATA/postgres.log" -o "-p $PGPORT -k $PREFIX/tmp" start >/dev/null
fi

# Crear usuario + base si no existen.
if ! psql -h "$PREFIX/tmp" -p "$PGPORT" -U "$(whoami)" -lqt | cut -d'|' -f1 | grep -qw "$DB_NAME"; then
  createuser -h "$PREFIX/tmp" -p "$PGPORT" -s "$DB_USER" 2>/dev/null || true
  psql -h "$PREFIX/tmp" -p "$PGPORT" -U "$(whoami)" -c "ALTER USER $DB_USER WITH PASSWORD '$DB_PASS';" >/dev/null
  createdb -h "$PREFIX/tmp" -p "$PGPORT" -O "$DB_USER" "$DB_NAME"
fi

# ---------------------------------------------------------------------------
# 2. Redis
# ---------------------------------------------------------------------------
log "Iniciando Redis"
if ! redis-cli ping >/dev/null 2>&1; then
  redis-server --daemonize yes >/dev/null
fi

# ---------------------------------------------------------------------------
# 3. Backend
# ---------------------------------------------------------------------------
log "Instalando dependencias del backend (sin descargar Chromium de puppeteer)"
cd "$PROJECT_DIR/backend"

if [ ! -d node_modules ]; then
  PUPPETEER_SKIP_DOWNLOAD=1 npm install --no-audit --no-fund
fi

# .env del backend
JWT_SECRET=$(head -c 48 /dev/urandom | base64 | tr -d '\n')
JWT_REFRESH_SECRET=$(head -c 48 /dev/urandom | base64 | tr -d '\n')
cat > .env <<EOF
NODE_ENV=development
PORT=$API_PORT
DATABASE_URL=postgresql://$DB_USER:$DB_PASS@localhost:$PGPORT/$DB_NAME
REDIS_URL=redis://localhost:6379
JWT_SECRET=$JWT_SECRET
JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d
CORS_ORIGIN=http://localhost:$WEB_PORT
EOF

log "Generando cliente Prisma y ejecutando migraciones"
npx prisma generate || warn "prisma generate fallo (libc). Revisa el backend."
npx prisma migrate deploy || die "prisma migrate deploy fallo. Sin BD no hay despliegue."

log "Sembrando datos iniciales"
npm run db:seed >/dev/null

if [ ! -d dist ]; then
  log "Compilando backend (lento en el telefono)..."
  npm run build
fi

log "Arrancando backend en el puerto $API_PORT"
[ -f "$PROJECT_DIR/backend/.backend.pid" ] && kill "$(cat "$PROJECT_DIR/backend/.backend.pid")" 2>/dev/null || true
nohup node dist/app.js > "$PROJECT_DIR/backend/backend.log" 2>&1 &
echo $! > "$PROJECT_DIR/backend/.backend.pid"

# ---------------------------------------------------------------------------
# 4. Frontend
# ---------------------------------------------------------------------------
cd "$PROJECT_DIR/frontend"

if [ ! -d dist ]; then
  log "Compilando frontend (lento en el telefono, mejor compilar en el PC)..."
  npm install --no-audit --no-fund
  npm run build
fi

# Micro servidor estatico con fallback SPA (sin nginx/node_modules extra).
cat > serve.mjs <<'EOF'
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize, sep } from 'node:path';

const root = process.cwd();
const port = parseInt(process.env.PORT || '5173', 10);
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.json': 'application/json', '.map': 'application/json' };

createServer(async (req, res) => {
  try {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    p = p === '/' ? '/index.html' : p;
    const file = normalize(join(root, ...p.split('/'))).replace('..' + sep, '');
    let data = await readFile(file).catch(() => null);
    if (data === null) data = await readFile(join(root, 'index.html'));
    res.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream' });
    res.end(data);
  } catch {
    res.writeHead(500); res.end('500');
  }
}).listen(port, '0.0.0.0', () => console.log(`Frontend en http://localhost:${port}`));
EOF

[ -f "$PROJECT_DIR/frontend/.frontend.pid" ] && kill "$(cat "$PROJECT_DIR/frontend/.frontend.pid")" 2>/dev/null || true
PORT="$WEB_PORT" nohup node serve.mjs > frontend.log 2>&1 &
echo $! > "$PROJECT_DIR/frontend/.frontend.pid"

# ---------------------------------------------------------------------------
# 5. Resumen
# ---------------------------------------------------------------------------
IP=$(ip route get 1 2>/dev/null | awk '{print $NF; exit}')
log "Despliegue listo"
echo "  Frontend : http://localhost:$WEB_PORT   (o http://$IP:$WEB_PORT en tu red)"
echo "  Backend  : http://localhost:$API_PORT/api/v1/health"
echo "  Usuarios : admin@inca.com / Admin123!  (admin)"
echo ""
echo "Para detener:  kill \$(cat backend/.backend.pid) ; kill \$(cat frontend/.frontend.pid)"
echo "Para reinciar postgres/redis:  pg_ctl -D $PGDATA start ; redis-server --daemonize yes"
echo ""
warn "Si prisma generate fallo: no es posible correr Prisma en Termux (libc). Este es el unico bloqueador real.
  Opciones: (a) migrar el backend a un driver sin Prisma, o (b) correr el backend en tu PC y solo servir el frontend desde el telefono."