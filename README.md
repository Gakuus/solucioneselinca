# MantenimientoPlus

Plataforma web responsive para la gestión de mantenimiento preventivo y correctivo de maquinaria de construcción.

[![CI/CD](https://github.com/Gakuus/solucioneselinca/actions/workflows/ci.yml/badge.svg)](https://github.com/Gakuus/solucioneselinca/actions/workflows/ci.yml)

---

## Tabla de Contenidos

- [Stack Tecnológico](#stack-tecnológico)
- [Prerrequisitos](#prerrequisitos)
- [Inicio Rápido (Desarrollo)](#inicio-rápido-desarrollo)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Variables de Entorno](#variables-de-entorno)
- [Desarrollo](#desarrollo)
- [Base de Datos](#base-de-datos)
- [Testing](#testing)
- [Despliegue (Producción)](#despliegue-producción)
- [Monitoreo y Logs](#monitoreo-y-logs)
- [Troubleshooting](#troubleshooting)
- [Equipo](#equipo)

---

## Stack Tecnológico

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Frontend | React + TypeScript | 18.x |
| UI | Tailwind CSS + shadcn/ui | 3.x |
| Backend | Node.js + Express | 20 LTS |
| ORM | Prisma | 5.x |
| Base de Datos | PostgreSQL | 15 |
| Cache | Redis | 7 |
| Auth | JWT (bcrypt 12 rounds) | - |
| Container | Docker + Docker Compose | - |
| CI/CD | GitHub Actions | - |

---

## Prerrequisitos

### Para Desarrollo Local

| Requisito | Versión Mínima | Verificar |
|-----------|---------------|-----------|
| Node.js | 20.x | `node --version` |
| npm | 10.x | `npm --version` |
| Docker | 24.x | `docker --version` |
| Docker Compose | v2.x | `docker compose version` |
| Git | 2.x | `git --version` |

### Para Despliegue en Producción

| Requisito | Descripción |
|-----------|-------------|
| Servidor | Ubuntu 22.04 LTS, 2+ CPU, 4GB+ RAM, 40GB SSD |
| Docker | 24.x instalado |
| Dominio | DNS apuntando al servidor |
| SSL | Certificado (Let's Encrypt recomendado) |

---

## Inicio Rápido (Desarrollo)

### 1. Clonar el Repositorio

```bash
git clone https://github.com/Gakuus/solucioneselinca.git
cd solucioneselinca
```

### 2. Configurar Variables de Entorno

```bash
cp .env.example .env
```

Edita el archivo `.env` con tus valores. Para desarrollo local, los valores por defecto funcionan.

### 3. Levantar Servicios (PostgreSQL + Redis)

```bash
docker compose up -d postgres redis
```

Verifica que los servicios estén corriendo:

```bash
docker compose ps
```

Deberías ver:
```
NAME                    STATUS
solucioneselinca-postgres-1   running (healthy)
solucioneselinca-redis-1      running
```

### 4. Instalar Dependencias

**Backend:**
```bash
cd backend
npm install
```

**Frontend (en otra terminal):**
```bash
cd frontend
npm install
```

### 5. Configurar Base de Datos

```bash
cd backend

# Generar cliente de Prisma
npx prisma generate

# Ejecutar migraciones
npx prisma migrate dev

# Cargar datos iniciales (tipos de máquina, tipos de mantenimiento, usuario admin)
npx prisma db seed
```

### 6. Iniciar en Desarrollo

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

El servidor arranca en `http://localhost:3000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

El frontend arranca en `http://localhost:5173`

### 7. Acceder a la Aplicación

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000
- **Health Check:** http://localhost:3000/health
- **Prisma Studio:** `npx prisma studio` (en backend/)

### Credenciales de Prueba

| Rol | Email | Contraseña |
|-----|-------|------------|
| Admin | admin@mantenimientoplus.com | Admin123! |
| Supervisor | supervisor@mantenimientoplus.com | Super123! |
| Técnico | tecnico@mantenimientoplus.com | Tech123! |

---

## Estructura del Proyecto

```
solucioneselinca/
├── backend/                    # API REST
│   ├── src/
│   │   ├── app.ts             # Punto de entrada
│   │   ├── config/            # Configuración (env, db, redis, cors)
│   │   ├── modules/           # Módulos de negocio
│   │   │   ├── auth/          # Autenticación
│   │   │   ├── users/         # Gestión de usuarios
│   │   │   ├── machines/      # Gestión de máquinas
│   │   │   ├── maintenances/  # Gestión de mantenimientos
│   │   │   ├── alerts/        # Sistema de alertas
│   │   │   ├── reports/       # Generación de reportes
│   │   │   ├── audit/         # Auditoría
│   │   │   └── config/        # Configuración del sistema
│   │   └── shared/            # Código compartido
│   │       ├── middleware/     # Auth, errors, logging
│   │       ├── utils/         # Utilidades
│   │       ├── errors/        # Clases de error
│   │       └── routes/        # Rutas compartidas
│   ├── prisma/
│   │   ├── schema.prisma      # Esquema de base de datos
│   │   └── seed.ts            # Datos iniciales
│   ├── Dockerfile
│   └── package.json
│
├── frontend/                   # Aplicación React
│   ├── src/
│   │   ├── components/        # Componentes reutilizables
│   │   │   ├── ui/            # shadcn/ui components
│   │   │   ├── layout/        # Sidebar, Header, MainLayout
│   │   │   └── auth/          # ProtectedRoute
│   │   ├── pages/             # Páginas de la aplicación
│   │   ├── stores/            # Estado global (Zustand)
│   │   ├── hooks/             # Custom hooks
│   │   ├── services/          # Capa de API
│   │   ├── types/             # Tipos TypeScript
│   │   └── utils/             # Utilidades
│   ├── Dockerfile
│   └── package.json
│
├── docs/                       # Documentación empresarial
│   ├── 01-product-discovery/   # Visión, Canvas, Stakeholders
│   ├── 02-prd/                 # PRD completo
│   ├── 03-requisitos/          # RF y RNF
│   ├── 04-historias-usuario/   # User Stories
│   ├── 05-product-backlog/     # Backlog priorizado
│   ├── 06-arquitectura/        # Arquitectura del sistema
│   ├── 07-modelo-datos/        # Modelo ER + SQL
│   ├── 08-seguridad/           # Política de seguridad
│   ├── 09-api-design/          # Diseño de API REST
│   ├── 10-ux-ui/               # Diseño UX/UI
│   ├── 11-qa/                  # Plan de pruebas
│   ├── 12-devops/              # Infraestructura
│   ├── 13-roadmap/             # Roadmap + Sprint Planning
│   └── 14-documentacion-final/ # Manuales y guías
│
├── .github/workflows/          # CI/CD Pipeline
│   └── ci.yml
│
├── docker-compose.yml          # Servicios de desarrollo
├── .env.example                # Variables de entorno ejemplo
├── .gitignore
└── README.md
```

---

## Variables de Entorno

Copia `.env.example` a `.env` y configura:

```bash
# ============================================
# APPLICATION
# ============================================
NODE_ENV=development          # development | production | test
PORT=3000

# ============================================
# DATABASE
# ============================================
DATABASE_URL=postgresql://user:password@localhost:5432/mantenimientoplus

# ============================================
# REDIS
# ============================================
REDIS_URL=redis://localhost:6379

# ============================================
# JWT AUTHENTICATION
# ============================================
JWT_SECRET=tu-clave-secreta-minimo-32 caracteres
JWT_REFRESH_SECRET=tu-clave-refresh-minimo-32 caracteres
JWT_EXPIRATION=15m            # Access token: 15 minutos
JWT_REFRESH_EXPIRATION=7d     # Refresh token: 7 días

# ============================================
# CORS
# ============================================
CORS_ORIGIN=http://localhost:5173

# ============================================
# RATE LIMITING
# ============================================
RATE_LIMIT_WINDOW_MS=60000    # 1 minuto
RATE_LIMIT_MAX_REQUESTS=100   # 100 requests por ventana

# ============================================
# SENTRY (opcional)
# ============================================
# SENTRY_DSN=https://your-sentry-dsn
```

### Generar Secretos Seguros

```bash
# Generar JWT_SECRET
openssl rand -base64 32

# Generar JWT_REFRESH_SECRET
openssl rand -base64 32
```

---

## Desarrollo

### Comandos Disponibles

**Backend (`cd backend`):**

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Iniciar en desarrollo con hot-reload |
| `npm run build` | Compilar TypeScript |
| `npm start` | Iniciar en producción |
| `npm run lint` | Verificar código con ESLint |
| `npm run lint:fix` | Auto-corregir problemas de lint |
| `npm test` | Ejecutar tests unitarios |
| `npm run test:watch` | Tests en modo watch |
| `npm run test:coverage` | Tests con reporte de cobertura |
| `npm run test:integration` | Tests de integración |
| `npx prisma studio` | Abrir Prisma Studio (UI de BD) |
| `npx prisma migrate dev` | Crear migración |
| `npx prisma db seed` | Cargar datos iniciales |

**Frontend (`cd frontend`):**

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Iniciar servidor de desarrollo |
| `npm run build` | Compilar para producción |
| `npm run preview` | Vista previa de la build |
| `npm run lint` | Verificar código con ESLint |

### Arquitectura Backend

El backend sigue el patrón **Capas**:

```
Request → Middleware → Controller → Service → Repository → Prisma → PostgreSQL
```

**Middleware Chain:**
1. CORS
2. Helmet (security headers)
3. Rate Limiter
4. Body Parser
5. Request Logger
6. Request ID
7. Auth (JWT)
8. RBAC (permisos)
9. Validation (Zod)
10. Controller
11. Error Handler

### Agregar Nuevo Módulo

1. Crear carpeta en `backend/src/modules/<nombre>/`
2. Crear archivos:
   - `<nombre>.controller.ts`
   - `<nombre>.service.ts`
   - `<nombre>.routes.ts`
   - `<nombre>.validation.ts`
3. Registrar rutas en `app.ts`
4. Crear migración si hay cambios en BD

### Convenciones de Código

- **TypeScript:** Estricto (`strict: true`)
- **Linting:** ESLint + Prettier
- **Naming:**
  - Archivos: `kebab-case.ts`
  - Clases: `PascalCase`
  - Funciones: `camelCase`
  - Variables: `camelCase`
  - Constantes: `UPPER_SNAKE_CASE`
- **Commits:** [Conventional Commits](https://www.conventionalcommits.org/)
  - `feat:` nueva funcionalidad
  - `fix:` corrección de bug
  - `docs:` documentación
  - `refactor:` refactorización
  - `test:` tests
  - `chore:` mantenimiento

---

## Base de Datos

### Esquema Entity-Relationship

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│    users     │     │   machines   │     │ machine_types│
├─────────────┤     ├──────────────┤     ├──────────────┤
│ id (UUID)    │◄─┐  │ id (UUID)    │  ┌─│ id (UUID)    │
│ name         │  │  │ code (UK)    │  │  │ name (UK)    │
│ email (UK)   │  │  │ name         │◄─┘  │ description  │
│ password_hash│  │  │ machine_type │     │ is_active    │
│ role         │  │  │ brand        │     └──────────────┘
│ is_active    │  │  │ model        │
│ created_at   │  │  │ status       │
│ updated_at   │  │  │ ...          │
└─────────────┘  │  └──────┬───────┘
                 │         │
                 │         │ 1:N
                 │         ▼
                 │  ┌──────────────┐     ┌──────────────────┐
                 │  │ maintenances │     │ maintenance_types│
                 │  ├──────────────┤     ├──────────────────┤
                 │  │ id (UUID)    │  ┌─│ id (UUID)        │
                 └──│ technician_id│  │  │ name (UK)        │
                    │ machine_id   │◄─┘  │ is_preventive    │
                    │ maint_type_id│     │ is_active        │
                    │ status       │     └──────────────────┘
                    │ ...          │
                    └──────┬───────┘
                           │
                           │ 1:N
                           ▼
                    ┌──────────────┐
                    │maintenance_  │
                    │   items      │
                    ├──────────────┤
                    │ id (UUID)    │
                    │ maintenance_id│
                    │ name         │
                    │ quantity     │
                    │ unit_cost    │
                    └──────────────┘

┌─────────────┐     ┌──────────────┐     ┌──────────────────┐
│   alerts     │     │ audit_logs   │     │ system_config    │
├─────────────┤     ├──────────────┤     ├──────────────────┤
│ id (UUID)    │     │ id (UUID)    │     │ id (UUID)        │
│ machine_id   │     │ user_id      │     │ key (UK)         │
│ type         │     │ action       │     │ value (JSON)     │
│ severity     │     │ entity_type  │     │ description      │
│ is_read      │     │ entity_id    │     │ updated_at       │
│ created_at   │     │ old_values   │     └──────────────────┘
└─────────────┘     │ new_values   │
                    │ ip_address   │
                    │ created_at   │
                    └──────────────┘
```

### Comandos de BD

```bash
# Abrir Prisma Studio (interfaz visual)
npx prisma studio

# Crear migración después de cambiar schema.prisma
npx prisma migrate dev --name descripcion_cambio

# Aplicar migraciones en producción
npx prisma migrate deploy

# Resetear base de datos (CUIDADO: borra todos los datos)
npx prisma migrate reset

# Regenerar cliente de Prisma
npx prisma generate

# Cargar datos iniciales
npx prisma db seed
```

### Backup Local

```bash
# Crear backup
pg_dump -U user -d mantenimientoplus > backup_$(date +%Y%m%d).sql

# Restaurar backup
psql -U user -d mantenimientoplus < backup_20240101.sql
```

---

## Testing

### Ejecutar Tests

```bash
# Tests unitarios
cd backend
npm test

# Tests con cobertura
npm run test:coverage

# Tests en modo watch (re-ejecuta al guardar)
npm run test:watch

# Tests de integración (requiere BD)
npm run test:integration
```

### Cobertura de Código

El objetivo es mantener **> 80% de cobertura**. Al ejecutar `npm run test:coverage`, se genera un reporte en `backend/coverage/`.

### Tests E2E (Playwright)

```bash
# Instalar Playwright (futuro)
npx playwright install

# Ejecutar tests E2E
npx playwright test
```

### QA Manual - Checklist

Antes de cada release, verificar:

- [ ] Login/logout funcional
- [ ] CRUD de máquinas completo
- [ ] CRUD de mantenimientos completo
- [ ] Alertas se generan correctamente
- [ ] Reportes se exportan (PDF/CSV)
- [ ] Responsive en móvil, tablet, desktop
- [ ] RBAC: cada rol solo ve lo que debe
- [ ] Auditoría registra todas las acciones

---

## Despliegue (Producción)

### Opción 1: Docker Compose (Recomendado para un solo servidor)

#### 1. Preparar el Servidor

```bash
# Conectar al servidor
ssh usuario@tu-servidor

# Clonar el repositorio
git clone https://github.com/Gakuus/solucioneselinca.git
cd solucioneselinca

# Crear archivo de producción
cp .env.example .env
nano .env  # Configurar valores de producción
```

#### 2. Configurar `.env` para Producción

```bash
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:password_segura@postgres:5432/mantenimientoplus
REDIS_URL=redis://redis:6379
JWT_SECRET=<generar_con_openssl_rand_base64_32>
JWT_REFRESH_SECRET=<generar_con_openssl_rand_base64_32>
CORS_ORIGIN=https://app.mantenimientoplus.com
```

#### 3. Levantar Servicios

```bash
# Build y levantar todo
docker compose -f docker-compose.prod.yml up -d --build

# Verificar estado
docker compose -f docker-compose.prod.yml ps

# Ejecutar migraciones
docker compose -f docker-compose.prod.yml exec app npx prisma migrate deploy

# Cargar datos iniciales
docker compose -f docker-compose.prod.yml exec app npx prisma db seed
```

#### 4. Configurar Nginx + SSL

```bash
# Instalar Nginx y Certbot
sudo apt update
sudo apt install nginx certbot python3-certbot-nginx

# Crear configuración de Nginx
sudo nano /etc/nginx/sites-available/mantenimientoplus
```

**Configuración Nginx:**

```nginx
upstream app {
    server 127.0.0.1:3000;
}

server {
    listen 80;
    server_name app.mantenimientoplus.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name app.mantenimientoplus.com;

    ssl_certificate /etc/letsencrypt/live/app.mantenimientoplus.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/app.mantenimientoplus.com/privkey.pem;

    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Gzip
    gzip on;
    gzip_types text/plain application/json application/javascript text/css;

    # Frontend
    location / {
        root /var/www/mantenimientoplus/frontend;
        try_files $uri $uri/ /index.html;
    }

    # API
    location /api/ {
        proxy_pass http://app;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Habilitar sitio
sudo ln -s /etc/nginx/sites-available/mantenimientoplus /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Obtener certificado SSL
sudo certbot --nginx -d app.mantenimientoplus.com
```

### Opción 2: Docker Swarm (Múltiples servidores)

```bash
# Inicializar swarm
docker swarm init

# Desplegar stack
docker stack deploy -c docker-compose.prod.yml mantenimientoplus

# Ver servicios
docker service ls
```

### Opción 3: Kubernetes

Ver `docs/12-devops/devops-infraestructura.md` para configuración completa de K8s.

### Verificación Post-Despliegue

```bash
# Verificar health check
curl https://app.mantenimientoplus.com/api/v1/health

# Ver logs
docker compose -f docker-compose.prod.yml logs -f app

# Verificar métricas
curl https://app.mantenimientoplus.com/api/v1/ping
```

---

## Monitoreo y Logs

### Health Check

```bash
# Endpoint de salud
curl http://localhost:3000/health

# Respuesta esperada:
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 12345.678,
  "services": {
    "database": "ok",
    "redis": "ok"
  }
}
```

### Logs

```bash
# Ver logs del backend (desarrollo)
docker compose logs -f app

# Ver logs de PostgreSQL
docker compose logs -f postgres

# Ver logs de Redis
docker compose logs -f redis

# Filtrar logs por nivel
docker compose logs app | grep "error"
```

### Sentry (Errores)

Si configuraste Sentry en `.env`, los errores se reportan automáticamente en:
- Frontend: Errores de JavaScript
- Backend: Errores no capturados

### Grafana + Prometheus (Opcional)

Para monitoreo avanzado, ver `docs/12-devops/devops-infraestructura.md`.

---

## Troubleshooting

### Problemas Comunes

**1. Error: "Cannot find module"**
```bash
# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

**2. Error: "Database connection refused"**
```bash
# Verificar que PostgreSQL esté corriendo
docker compose ps

# Reiniciar PostgreSQL
docker compose restart postgres
```

**3. Error: "EADDRINUSE: address already in use :::3000"**
```bash
# Matar proceso en el puerto 3000
lsof -ti:3000 | xargs kill -9
```

**4. Error: "JWT secret must be at least 32 characters"**
```bash
# Generar nuevos secretos
openssl rand -base64 32
# Actualizar en .env
```

**5. Migraciones fallan**
```bash
# Resetear base de datos (CUIDADO: borra datos)
npx prisma migrate reset

# O eliminar migraciones y recrear
rm -rf prisma/migrations
npx prisma migrate dev --name init
```

**6. Frontend no conecta al backend**
- Verificar que el backend esté corriendo en puerto 3000
- Verificar `CORS_ORIGIN` en `.env`
- Verificar proxy en `vite.config.ts`

### Limpiar Todo

```bash
# Detener servicios
docker compose down

# Eliminar volúmenes (borra datos de BD)
docker compose down -v

# Reinstalar dependencias
cd backend && rm -rf node_modules && npm install
cd frontend && rm -rf node_modules && npm install

# Recrear BD
cd backend
npx prisma migrate dev
npx prisma db seed
```

---

## Equipo

| Rol | Responsabilidades |
|-----|-------------------|
| Tech Lead | Arquitectura, code review, decisiones técnicas |
| Backend Dev (2) | API, lógica de negocio, base de datos |
| Frontend Dev (1) | UI/UX, componentes, routing |
| DevOps (1) | CI/CD, Docker, monitoreo, despliegue |
| QA (1) | Tests, QA manual, automatización |

---

## Licencia

Propietario - Gakuus

---

## Soporte

- **Issues:** [GitHub Issues](https://github.com/Gakuus/solucioneselinca/issues)
- **Documentación:** Ver carpeta `docs/`
