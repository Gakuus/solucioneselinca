# Documento de DevOps e Infraestructura

## MantenimientoPlus

**Version:** 1.0 | **Fecha:** 26 de Agosto de 2026

---

## 1. Docker

### 1.1 Arquitectura de Contenedores

```
┌─────────────────────────────────────────┐
│           docker-compose.yml            │
├─────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐    │
│  │   app        │  │   frontend   │    │
│  │   Node.js    │  │   React/Nginx│    │
│  │   :3000      │  │   :80        │    │
│  └──────┬───────┘  └──────────────┘    │
│         │                               │
│  ┌──────┴───────┐  ┌──────────────┐    │
│  │  postgres    │  │    redis     │    │
│  │  :5432       │  │    :6379     │    │
│  └──────────────┘  └──────────────┘    │
└─────────────────────────────────────────┘
```

### 1.2 Dockerfile Backend (multi-stage)

```dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# Stage 2: Production
FROM node:20-alpine AS production
WORKDIR /app
RUN addgroup -g 1001 -S appgroup && adduser -S appuser -u 1001
COPY --from=builder --chown=appuser:appgroup /app/dist ./dist
COPY --from=builder --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:appgroup /app/package.json ./
USER appuser
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1
CMD ["node", "dist/app.js"]
```

### 1.3 Dockerfile Frontend (multi-stage)

```dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Production
FROM nginx:alpine AS production
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s CMD curl -f http://localhost/ || exit 1
```

### 1.4 docker-compose.yml (Desarrollo)

```yaml
version: '3.8'
services:
  app:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://user:pass@postgres:5432/mantenimientoplus
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=${JWT_SECRET}
      - NODE_ENV=development
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started
    volumes:
      - ./backend/src:/app/src

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - app

  postgres:
    image: postgres:15-alpine
    ports:
      - "5432:5432"
    environment:
      POSTGRES_DB: mantenimientoplus
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U user -d mantenimientoplus"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

### 1.5 docker-compose.prod.yml (Produccion)

```yaml
version: '3.8'
services:
  app:
    build: ./backend
    deploy:
      replicas: 2
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - JWT_SECRET=${JWT_SECRET}
      - NODE_ENV=production
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
      - ./frontend/dist:/usr/share/nginx/html
    depends_on:
      - app
    restart: unless-stopped

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: ${DB_NAME}
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD}
    restart: unless-stopped

volumes:
  postgres_data:
```

---

## 2. CI/CD

### 2.1 Pipeline de GitHub Actions

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_DB: test_db
          POSTGRES_USER: test_user
          POSTGRES_PASSWORD: test_pass
        ports: ['5432:5432']
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run test:unit -- --coverage
      - run: npm run test:integration
        env:
          DATABASE_URL: postgresql://test_user:test_pass@localhost:5432/test_db
      - uses: codecov/codecov-action@v3

  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm audit --audit-level=high
      - uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          severity: 'HIGH,CRITICAL'

  build-and-push:
    needs: [lint-and-test, security]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - uses: docker/build-push-action@v5
        with:
          push: true
          tags: registry.example.com/mantenimientoplus:${{ github.sha }}
```

### 2.2 Stages del Pipeline

| Stage | Trigger | Actions |
|---|---|---|
| Lint | Todo push | ESLint, Prettier |
| Unit Tests | Todo push | Jest --coverage |
| Integration Tests | Todo push | Tests con BD de prueba |
| Security Scan | Todo push | npm audit, Trivy |
| Build | PR merge | Docker build |
| Push Image | Push a main | Docker push a registry |
| Deploy Staging | Push a develop | Deploy automatico a staging |
| Deploy Production | Tag release | Deploy manual aprobado |

---

## 3. Ambientes

### 3.1 Descripcion de Ambientes

| Ambiente | URL | Proposito | Datos |
|---|---|---|---|
| Development | localhost:3000 | Desarrollo local | Datos de prueba |
| Staging | staging.mantenimientoplus.com | QA y UAT | Copia anonimizada de prod |
| Production | app.mantenimientoplus.com | Produccion | Datos reales |

### 3.2 Promocion de Codigo

```
feature branch -> develop (dev) -> main (staging) -> release tag (production)
     |                |                |                      |
  PR review       Auto deploy      Auto deploy         Manual approve
```

---

## 4. Monitoreo

### 4.1 Stack de Monitoreo

| Capa | Herramienta | Metricas |
|---|---|---|
| APM | Prometheus + Grafana | Request rate, error rate, latency |
| Logs | ELK Stack / Loki | Logs estructurados, busqueda |
| Uptime | UptimeRobot / Pingdom | Disponibilidad HTTP |
| Errores | Sentry | Errores JavaScript y backend |
| Infra | Docker metrics | CPU, memoria, disco |

### 4.2 Dashboards de Grafana

**Dashboard 1: Application Overview**
- Request rate (req/s)
- Error rate (4xx, 5xx)
- Response time (P50, P95, P99)
- Active users

**Dashboard 2: Infrastructure**
- CPU usage per container
- Memory usage per container
- Network I/O
- Disk usage

**Dashboard 3: Database**
- Connection pool
- Query latency
- Slow queries
- Table sizes

### 4.3 Alertas de Monitoreo

| Condicion | Severidad | Accion |
|---|---|---|
| HTTP 5xx > 1% por 5 min | Critica | Email + Slack |
| Response P95 > 1s por 5 min | Alta | Email |
| CPU > 80% por 10 min | Media | Email |
| Memory > 85% por 5 min | Alta | Email |
| Disk > 85% | Alta | Email |
| Uptime check falla | Critica | Email + SMS |
| Database connections > 80% | Alta | Email |

---

## 5. Logging

### 5.1 Formato de Log

```json
{
  "timestamp": "2026-08-26T10:30:00.000Z",
  "level": "info",
  "message": "Maintenance created",
  "service": "maintenance-service",
  "traceId": "abc123",
  "userId": "uuid-user",
  "requestId": "req-xyz",
  "method": "POST",
  "path": "/api/v1/maintenances",
  "statusCode": 201,
  "duration": 45
}
```

### 5.2 Niveles de Log

| Nivel | Uso |
|---|---|
| error | Errores que requieren atencion |
| warn | Advertencias potencialmente problematicas |
| info | Eventos normales del sistema |
| debug | Informacion detallada para debugging (solo dev) |

### 5.3 Retencion

| Tipo | Retencion | Almacenamiento |
|---|---|---|
| Application logs | 30 dias | Disco local / CloudWatch |
| Audit logs | 2 anos | PostgreSQL + backup |
| Access logs (nginx) | 90 dias | Disco local / S3 |
| Error logs (Sentry) | 1 ano | Sentry cloud |

---

## 6. Backups

### 6.1 Estrategia de Backups

| Componente | Frecuencia | Metodo | Retencion |
|---|---|---|---|
| PostgreSQL full | Diario 2:00 AM UTC | pg_dump | 30 dias |
| PostgreSQL WAL | Continuo | Archiving | 7 dias |
| Redis (RDB) | Cada hora | SAVE | 24 horas |
| S3/Files | Diario | S3 sync | 30 dias |
| Config files | Semanal | Git | Indefinido |

### 6.2 Script de Backup

```bash
#!/bin/bash
# backup.sh - Ejecutado via cron diario
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/postgres"
FILENAME="mantenimientoplus_${DATE}.sql.gz"

pg_dump $DATABASE_URL | gzip > "${BACKUP_DIR}/${FILENAME}"

# Subir a S3
aws s3 cp "${BACKUP_DIR}/${FILENAME}" s3://backups-bucket/postgres/

# Limpiar backups viejos (mas de 30 dias)
find ${BACKUP_DIR} -name "*.sql.gz" -mtime +30 -delete

# Notificar
curl -X POST $SLACK_WEBHOOK -d "{\"text\": \"Backup completado: ${FILENAME}\"}"
```

### 6.3 Restauracion

```bash
# Restaurar desde backup
gunzip -c /backups/postgres/mantenimientoplus_20260826.sql.gz | psql $DATABASE_URL
```

---

## 7. Disaster Recovery

### 7.1 RTO y RPO

| Metrica | Objetivo |
|---|---|
| RTO (Recovery Time Objective) | < 4 horas |
| RPO (Recovery Point Objective) | < 24 horas |

### 7.2 Plan de Recuperacion

| Escenario | Accion | Tiempo Estimado |
|---|---|---|
| App container caido | Docker restart automatico | < 1 minuto |
| Base de datos corrupta | Restore desde ultimo backup | 1-2 horas |
| Servidor completo caido | Levantar en nueva instancia + restore | 2-4 horas |
| Data breach | Aislar, rotar credenciales, investigar | 1-4 horas |
| Perdida total | Restore completo desde S3 cross-region | 2-4 horas |

### 7.3 Runbook de Recuperacion

1. **Detectar fallo** via monitoreo (Grafana alert)
2. **Notificar** al equipo via Slack/email
3. **Diagnosticar** nivel de impacto
4. **Ejecutar plan** segun escenario
5. **Verificar** integridad de datos
6. **Comunicar** resolucion a stakeholders
7. **Documentar** post-mortem

---

## 8. Nginx Config

```nginx
upstream app {
    server app1:3000;
    server app2:3000;
}

server {
    listen 80;
    server_name app.mantenimientoplus.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name app.mantenimientoplus.com;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;

    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Gzip
    gzip on;
    gzip_types text/plain application/json application/javascript text/css;

    # Frontend
    location / {
        root /usr/share/nginx/html;
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

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=100r/m;
    location /api/auth/ {
        limit_req zone=api burst=5 nodelay;
        proxy_pass http://app;
    }
}
```

---

*Documento DevOps v1.0 - 26/08/2026*
