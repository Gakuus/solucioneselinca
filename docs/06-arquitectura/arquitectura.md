# Documento de Arquitectura de Software

## MantenimientoPlus

**Version:** 1.0 | **Fecha:** 26 de Agosto de 2026
**Arquitecto:** [Tech Lead]

---

## 1. Arquitectura Logica

### 1.1 Patron Arquitectonico: Clean Architecture + Modular Monolith

**Decision:** Se implementa un Modular Monolith con separacion por dominios (modulos bounded context).

**Justificacion:**
- Complejidad actual no justifica microservicios
- Monolito modular permite desacoplamiento interno
- Facilita testing, deployment y mantenimiento
- Permite migrar a microservicios en el futuro si es necesario

### 1.2 Capas de la Arquitectura

```
┌─────────────────────────────────────────────────────┐
│                  PRESENTATION LAYER                 │
│  React SPA + Responsive Design                      │
│  Componentes: Login, Dashboard, Maquinas,           │
│  Mantenimientos, Reportes, Configuracion            │
├─────────────────────────────────────────────────────┤
│                  API GATEWAY LAYER                  │
│  Express.js / Fastify                               │
│  - Routing, Rate Limiting, CORS, Auth Middleware    │
│  - Request Validation (Joi/Zod)                     │
│  - Error Handling                                   │
├─────────────────────────────────────────────────────┤
│                  APPLICATION LAYER                  │
│  Services (Logica de negocio)                       │
│  - AuthService, MachineService, MaintenanceService  │
│  - AlertService, ReportService, AuditService        │
│  - NotificationService, CatalogService              │
├─────────────────────────────────────────────────────┤
│                  DOMAIN LAYER                       │
│  Entities, Value Objects, Domain Events             │
│  - User, Machine, Maintenance, Alert                │
│  - Business Rules (calculo proximo mantenimiento)   │
├─────────────────────────────────────────────────────┤
│                  INFRASTRUCTURE LAYER               │
│  - PostgreSQL (primary database)                    │
│  - Redis (caching, session, job queue)              │
│  - File Storage (exports, backups)                  │
│  - Email Service (notificaciones)                   │
└─────────────────────────────────────────────────────┘
```

### 1.3 Modulos del Sistema

| Modulo | Responsabilidad | Dependencias |
|---|---|---|
| Auth | Autenticacion, autorizacion, sesiones | User |
| User | CRUD de usuarios, roles | Auth |
| Machine | CRUD de maquinas, estados | Catalog |
| Maintenance | CRUD de mantenimientos, calculos | Machine, User, Catalog |
| Alert | Generacion y gestion de alertas | Maintenance, Machine |
| Report | Generacion de reportes y exportacion | Machine, Maintenance |
| Audit | Registro y consulta de auditoria | User |
| Catalog | Gestion de catalogos configurables | - |
| Notification | Notificaciones in-app | Alert |
| Config | Parametros del sistema | - |

---

## 2. Arquitectura Fisica

### 2.1 Diagrama de Despliegue

```
                    INTERNET
                       │
                       ▼
              ┌────────────────┐
              │  LOAD BALANCER │  (Nginx / Traefik)
              │  (SSL Terminate)│
              └───────┬────────┘
                      │
         ┌────────────┼────────────┐
         │            │            │
         ▼            ▼            ▼
   ┌──────────┐ ┌──────────┐ ┌──────────┐
   │  APP #1  │ │  APP #2  │ │  APP #3  │
   │ Docker   │ │ Docker   │ │ Docker   │
   │ Node.js  │ │ Node.js  │ │ Node.js  │
   └────┬─────┘ └────┬─────┘ └────┬─────┘
        │             │             │
        └─────────────┼─────────────┘
                      │
         ┌────────────┼────────────┐
         │            │            │
         ▼            ▼            ▼
   ┌──────────┐ ┌──────────┐ ┌──────────┐
   │PostgreSQL│ │  Redis   │ │  S3/MinIO│
   │ Primary  │ │ Cache +  │ │ Backups  │
   │ + Replica│ │ Queue    │ │ + Files  │
   └──────────┘ └──────────┘ └──────────┘
```

### 2.2 Especificaciones de Infraestructura

**Ambiente de Desarrollo:**
- Docker Compose local
- PostgreSQL 15 (contenedor)
- Redis 7 (contenedor)
- Node.js 20 LTS

**Ambiente de Staging:**
- 1 instancia cloud (2 vCPU, 4GB RAM)
- PostgreSQL managed (AWS RDS / Azure DB)
- Redis managed (AWS ElastiCache / Azure Cache)
- Storage: S3 / Blob Storage

**Ambiente de Produccion:**
- 2+ instancias cloud (4 vCPU, 8GB RAM cada una)
- PostgreSQL managed con read replica
- Redis managed con replicacion
- Load balancer (ALB / Azure LB)
- Storage: S3 / Blob Storage
- CDN para assets estaticos

### 2.3 Justificacion de Tecnologias

| Componente | Tecnologia | Justificacion |
|---|---|---|
| Frontend | React 18 + TypeScript | Ecosistema maduro, componentes reutilizables, tipado |
| UI Library | Tailwind CSS + shadcn/ui | Rapidez de desarrollo, responsive nativo |
| Backend | Node.js + Express/Fastify | Alto rendimiento I/O, TypeScript compartido |
| Base de Datos | PostgreSQL 15 | ACID, JSON support, extensions, fiabilidad |
| Cache | Redis 7 | Sesiones, cache de catalogos, job queue |
| ORM | Prisma / TypeORM | Type safety, migraciones, schemas |
| Auth | JWT + bcrypt | Estandar de la industria, stateless |
| Testing | Jest + Playwright | Unit + E2E testing |
| CI/CD | GitHub Actions | Integracion nativa, pipelines flexibles |
| Container | Docker | Consistencia entre ambientes |

---

## 3. Arquitectura de Software

### 3.1 Estructura del Proyecto Backend

```
src/
├── config/              # Configuracion de la app
│   ├── database.ts      # Conexion a BD
│   ├── redis.ts         # Conexion a Redis
│   ├── env.ts           # Variables de entorno
│   └── cors.ts          # Configuracion CORS
├── middleware/          # Middleware globales
│   ├── auth.ts          # Verificacion JWT
│   ├── rbac.ts          # Control de acceso
│   ├── rateLimiter.ts   # Rate limiting
│   ├── validator.ts     # Validacion de requests
│   ├── errorHandler.ts  # Manejo de errores
│   └── audit.ts         # Logging de auditoria
├── modules/             # Modulos de negocio
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.routes.ts
│   │   └── auth.validation.ts
│   ├── user/
│   │   ├── user.controller.ts
│   │   ├── user.service.ts
│   │   ├── user.routes.ts
│   │   └── user.validation.ts
│   ├── machine/
│   │   ├── machine.controller.ts
│   │   ├── machine.service.ts
│   │   ├── machine.routes.ts
│   │   └── machine.validation.ts
│   ├── maintenance/
│   │   ├── maintenance.controller.ts
│   │   ├── maintenance.service.ts
│   │   ├── maintenance.routes.ts
│   │   └── maintenance.validation.ts
│   ├── alert/
│   │   ├── alert.controller.ts
│   │   ├── alert.service.ts
│   │   ├── alert.routes.ts
│   │   └── alert.scheduler.ts
│   ├── report/
│   │   ├── report.controller.ts
│   │   ├── report.service.ts
│   │   └── report.routes.ts
│   ├── audit/
│   │   ├── audit.controller.ts
│   │   ├── audit.service.ts
│   │   └── audit.routes.ts
│   ├── catalog/
│   │   ├── catalog.controller.ts
│   │   ├── catalog.service.ts
│   │   └── catalog.routes.ts
│   └── notification/
│       ├── notification.controller.ts
│       ├── notification.service.ts
│       └── notification.routes.ts
├── shared/              # Utilidades compartidas
│   ├── errors/          # Clases de error custom
│   ├── types/           # TypeScript types
│   ├── utils/           # Funciones utilitarias
│   └── constants/       # Constantes del sistema
├── jobs/                # Tareas programadas
│   ├── alertChecker.ts  # Generacion diaria de alertas
│   ├── backupJob.ts     # Backup automatico
│   └── cleanupJob.ts    # Limpieza de datos
└── app.ts               # Entry point
```

### 3.2 Estructura del Proyecto Frontend

```
src/
├── components/          # Componentes reutilizables
│   ├── ui/              # Button, Input, Select, Table, etc.
│   ├── layout/          # Sidebar, Header, Footer
│   └── shared/          # AlertCard, StatusBadge, etc.
├── pages/               # Paginas/views
│   ├── Login/
│   ├── Dashboard/
│   ├── Machines/
│   ├── Maintenance/
│   ├── Reports/
│   ├── Users/
│   ├── Audit/
│   └── Settings/
├── hooks/               # Custom React hooks
│   ├── useAuth.ts
│   ├── useMachines.ts
│   └── usePagination.ts
├── services/            # API client
│   ├── api.ts           # Axios instance
│   ├── auth.service.ts
│   ├── machine.service.ts
│   └── maintenance.service.ts
├── store/               # State management
│   ├── authStore.ts     # Zustand store
│   └── alertStore.ts
├── types/               # TypeScript types
├── utils/               # Utilidades
└── App.tsx
```

### 3.3 Patrones de Diseno

| Patron | Uso | Justificacion |
|---|---|---|
| Repository Pattern | Acceso a datos | Desacoplamiento de ORM, testable |
| Service Layer | Logica de negocio | Separacion de responsabilidades |
| DTO Pattern | Transferencia de datos | Validacion y transformacion |
| Middleware Chain | Cross-cutting concerns | Auth, logging, validacion |
| Observer Pattern | Alertas y notificaciones | Desacoplamiento de eventos |
| Strategy Pattern | Calculos de mantenimiento | Intercambiable segun tipo |
| Factory Pattern | Creacion de reportes | Multiples formatos de salida |

---

## 4. Arquitectura de Datos

### 4.1 Estrategia de Base de Datos

- **Motor:** PostgreSQL 15
- **Patron:** Database per service (monolito = 1 DB con schema separation)
- **Esquema:** Un esquema por modulo (auth, machine, maintenance, etc.)
- **Migraciones:** Prisma Migrate o TypeORM migrations
- **Backup:** Diario automatico + snapshot semanal

### 4.2 Estrategia de Cache

| Datos | TTL | Invalidacion |
|---|---|---|
| Catalogos | 1 hora | On update |
| Dashboard KPIs | 5 minutos | On data change |
| Sesiones de usuario | 7 dias | On logout |
| Tokens invalidados | 15 minutos | Auto-expire |
| Reportes frecuentes | 10 minutos | On data change |

### 4.3 Estrategia de Auditoria

- Tabla append-only (sin UPDATE/DELETE)
- Almacena: tabla, registro_id, accion, usuario_id, fecha, ip, datos_antes, datos_despues
- Indexada por fecha y usuario para consultas rapidas
- Partitioned por mes si excede 10M registros

---

## 5. Arquitectura de Seguridad

### 5.1 Capas de Seguridad

```
[Internet] -> [WAF/CDN] -> [Load Balancer (SSL)] -> [Rate Limiter] -> [CORS] -> [Auth Middleware] -> [RBAC Middleware] -> [Validator] -> [Controller] -> [Service] -> [DB]
```

### 5.2 Componentes de Seguridad

| Componente | Implementacion |
|---|---|
| SSL/TLS | Certificado Let's Encrypt, HSTS |
| Authentication | JWT (access 15min + refresh 7d) |
| Authorization | RBAC con permisos por endpoint |
| Rate Limiting | express-rate-limit (5/min login, 100/min general) |
| Input Validation | Joi/Zod schema validation |
| SQL Injection | Prisma ORM (parameterized queries) |
| XSS | React auto-escaping + CSP headers |
| CSRF | SameSite cookies + Origin validation |
| Password Hashing | bcrypt with 12 rounds |
| Headers | Helmet.js (CSP, HSTS, X-Frame-Options) |

### 5.3 Flujo de Autenticacion

```
1. User -> POST /api/v1/auth/login {email, password}
2. Controller -> Validate input
3. Service -> Find user by email
4. Service -> Compare password with bcrypt
5. Service -> Generate JWT (15min) + Refresh Token (7d)
6. Service -> Store refresh token hash in DB
7. Service -> Log login event in audit
8. Response -> {accessToken, refreshToken}
```

---

## 6. Decisiones Arquitectonicas (ADR)

### ADR-001: Modular Monolith sobre Microservicios

- **Estado:** Aceptada
- **Contexto:** Sistema de tamano moderado, equipo pequeno (3 devs)
- **Decision:** Modular Monolith con bounded contexts
- **Consecuencias:** Menor complejidad operativa, despliegue unitario, posibilidad de extraer modulos en el futuro

### ADR-002: PostgreSQL como base de datos principal

- **Estado:** Aceptada
- **Contexto:** Necesidad de ACID, integridad referencial, consultas complejas
- **Decision:** PostgreSQL 15
- **Consecuencias:** Madurez, fiabilidad, extensions (JSON, full-text search), sin licencia comercial

### ADR-003: React + TypeScript para frontend

- **Estado:** Aceptada
- **Contexto:** Necesidad de SPA responsive, ecosistema amplio
- **Decision:** React 18 con TypeScript
- **Consecuencias:** Reutilizacion de tipos con backend, ecosistema de componentes, curva de aprendizaje moderada

### ADR-004: JWT para autenticacion stateless

- **Estado:** Aceptada
- **Contexto:** API REST, posibilidad de multiples clientes
- **Decision:** JWT con access token + refresh token
- **Consecuencias:** Escalabilidad horizontal, sin sesiones en servidor, manejo de expiracion

### ADR-005: Docker para containerizacion

- **Estado:** Aceptada
- **Contexto:** Consistencia entre ambientes, CI/CD
- **Decision:** Docker multi-stage builds + docker-compose
- **Consecuencias:** Portabilidad, reproduccion de ambientes,.learning curve minima

### ADR-006: Prisma como ORM

- **Estado:** Aceptada
- **Contexto:** Type safety, migraciones, documentacion automatica
- **Decision:** Prisma con PostgreSQL
- **Consecuencias:** Schema como source of truth, migraciones versionadas, generacion de tipos TypeScript

---

## 7. Consideraciones de Rendimiento

### 7.1 Estrategias de Optimizacion

| Area | Estrategia | Implementacion |
|---|---|---|
| Base de datos | Indices optimizados | Indices en columnas de filtro y FK |
| Base de datos | Query optimization | EXPLAIN ANALYZE, evitacion de N+1 |
| API | Paginacion | Cursor-based o offset-based |
| API | Filtering server-side | Filtrado en query, no en memoria |
| Frontend | Lazy loading | React.lazy + Suspense |
| Frontend | Code splitting | Por ruta |
| Cache | Redis | Catalogos, KPIs, sesiones |
| Assets | CDN | Assets estaticos via CDN |
| Network | Compresion | gzip/brotli en respuestas |

### 7.2 Metricas de Rendimiento

| Metrica | Target | Herramienta |
|---|---|---|
| API P50 | < 100ms | APM (New Relic/Datadog) |
| API P95 | < 500ms | APM |
| Page Load | < 3s | Lighthouse |
| First Contentful Paint | < 1.5s | Lighthouse |
| DB Query P95 | < 100ms | pg_stat_statements |

---

*Arquitectura de Software v1.0 - 26/08/2026*
