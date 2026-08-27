# Sprint Planning Detallado

## MantenimientoPlus

**Version:** 1.0 | **Fecha:** 26 de Agosto de 2026
**Duracion por Sprint:** 2 semanas (10 dias habiles)
**Equipo Estimado:** 1 Tech Lead, 2 Backend Devs, 1 Frontend Dev, 1 DevOps, 1 QA

---

## Convenciones

- **T:** Tarea tecnica
- **HU:** Historia de usuario
- **Pts:** Story points (Fibonacci: 1, 2, 3, 5, 8, 13)
- **Hrs:** Estimacion en horas
- **Dep:** Dependencias (que debe completarse antes)

---

# SPRINT 0: FUNDAMENTOS

**Objetivo:** Setup completo de infraestructura, herramientas y arquitectura base para que el equipo pueda desarrollar de forma productiva.

**Duration:** Semana 1-2 (10 dias habiles)
**Capacity estimada:** 120 horas equipo / ~80 horas efectivas (con overhead)

---

## Sprint 0 - Dia 1-2: Repository y Herramientas

| ID | Tarea | Hrs | Responsable | Dep | Dependencias |
|---|---|---|---|---|---|
| S0-T01 | Crear repositorio GitHub con README basico | 1 | DevOps | - | - |
| S0-T02 | Configurar branch protection (main, develop) | 1 | DevOps | S0-T01 | - |
| S0-T03 | Crear template de PR y issue | 1 | Tech Lead | S0-T01 | - |
| S0-T04 | Configurar ESLint + Prettier (backend) | 2 | Tech Lead | - | - |
| S0-T05 | Configurar ESLint + Prettier (frontend) | 2 | Tech Lead | - | - |
| S0-T06 | Configurar Husky pre-commit hooks | 2 | Tech Lead | S0-T04, S0-T05 | - |
| S0-T07 | Crear .gitignore completo | 0.5 | Tech Lead | - | - |
| S0-T08 | Crear .env.example con todas las variables | 1 | DevOps | - | - |
| S0-T09 | Crear estructura de carpetas backend | 1 | Tech Lead | - | - |
| S0-T10 | Crear estructura de carpetas frontend | 1 | Tech Lead | - | - |
| **Subtotal** | | **12.5 hrs** | | | |

### Entregables Dia 1-2:
- [ ] Repositorio funcional en GitHub
- [ ] Branch protection configurado
- [ ] Hooks pre-commit funcionando
- [ ] Estructura de carpetas creada

---

## Sprint 0 - Dia 3-4: Docker y Base de Datos

| ID | Tarea | Hrs | Responsable | Dep |
|---|---|---|---|---|
| S0-T11 | Crear Dockerfile backend (multi-stage) | 3 | DevOps | - |
| S0-T12 | Crear Dockerfile frontend (multi-stage) | 2 | DevOps | - |
| S0-T13 | Crear docker-compose.yml (desarrollo) | 3 | DevOps | S0-T11, S0-T12 |
| S0-T14 | Crear docker-compose.prod.yml (produccion) | 2 | DevOps | S0-T13 |
| S0-T15 | Configurar PostgreSQL: crear esquema inicial en Prisma | 4 | Backend Dev | - |
| S0-T16 | Definir modelo ER completo (todas las entidades) | 6 | Backend Dev | - |
| S0-T17 | Crear migraciones Prisma | 3 | Backend Dev | S0-T16 |
| S0-T18 | Configurar Redis: conexion y test | 2 | Backend Dev | - |
| S0-T19 | Crear seed data: tipos de maquina | 2 | Backend Dev | S0-T17 |
| S0-T20 | Crear seed data: tipos de mantenimiento | 2 | Backend Dev | S0-T17 |
| S0-T21 | Crear seed data: usuario admin inicial | 1 | Backend Dev | S0-T17 |
| S0-T22 | Verificar Docker Compose levanta todos los servicios | 2 | DevOps | S0-T13 |
| **Subtotal** | | **30 hrs** | | |

### Entregables Dia 3-4:
- [ ] Docker Compose levantando: app, postgres, redis
- [ ] Prisma schema con todas las entidades
- [ ] Migraciones ejecutadas
- [ ] Seed data cargado
- [ ] Redis funcionando

### Schema Prisma Completo:

```prisma
// Entidades a definir:
// - User (id, name, email, passwordHash, role, isActive, createdAt, updatedAt)
// - MachineType (id, name, description, isActive)
// - Machine (id, code, name, machineTypeId, brand, model, serialNumber, year, dailyHoursAverage, status, createdAt, updatedAt)
// - MaintenanceType (id, name, description, isPreventive, isActive)
// - Maintenance (id, machineId, maintenanceTypeId, technicianId, receivedDate, maintenanceDate, currentHours, description, observations, hoursUntilNext, nextMaintenanceDate, estimatedNextDate, status, completedAt, cancelledAt, cancelReason, createdAt, updatedAt)
// - MaintenanceItem (id, maintenanceId, name, quantity, unitCost, supplier, category)
// - Alert (id, machineId, maintenanceId, type, message, severity, isRead, readAt, readBy, createdAt)
// - Notification (id, userId, title, message, type, isRead, readAt, createdAt)
// - AuditLog (id, userId, action, entityType, entityId, oldValues, newValues, ipAddress, userAgent, createdAt)
// - SystemConfig (id, key, value, description, updatedAt)
```

---

## Sprint 0 - Dia 5-6: Backend Base

| ID | Tarea | Hrs | Responsable | Dep |
|---|---|---|---|---|
| S0-T23 | Configurar Express/Fastify con middleware chain | 3 | Backend Dev | - |
| S0-T24 | Configurar Helmet.js (security headers) | 1 | Backend Dev | S0-T23 |
| S0-T25 | Configurar CORS | 1 | Backend Dev | S0-T23 |
| S0-T26 | Configurar rate limiting (express-rate-limit) | 2 | Backend Dev | S0-T23 |
| S0-T27 | Configurar Winston/Pino logger | 2 | Backend Dev | S0-T23 |
| S0-T28 | Configurar request ID middleware | 1 | Backend Dev | S0-T23 |
| S0-T29 | Crear AppError class personalizada | 2 | Backend Dev | - |
| S0-T30 | Crear error handling middleware | 3 | Backend Dev | S0-T29 |
| S0-T31 | Crear response helper (success, error, paginated) | 2 | Backend Dev | S0-T23 |
| S0-T32 | Configurar Prisma client singleton | 1 | Backend Dev | S0-T15 |
| S0-T33 | Crear health check endpoint | 1 | Backend Dev | S0-T23 |
| S0-T34 | Crear endpoint de test (GET /api/v1/ping) | 0.5 | Backend Dev | S0-T23 |
| S0-T35 | Configurar Sentry para errores backend | 2 | DevOps | S0-T23 |
| **Subtotal** | | **21.5 hrs** | | |

### Entregables Dia 5-6:
- [ ] Backend levantando con todos los middleware
- [ ] Health check funcionando
- [ ] Error handler configurado
- [ ] Logger funcionando
- [ ] Sentry conectado

---

## Sprint 0 - Dia 7-8: Frontend Base

| ID | Tarea | Hrs | Responsable | Dep |
|---|---|---|---|---|
| S0-T36 | Crear proyecto React + TypeScript + Vite | 2 | Frontend Dev | - |
| S0-T37 | Configurar Tailwind CSS | 2 | Frontend Dev | S0-T36 |
| S0-T38 | Instalar y configurar shadcn/ui | 2 | Frontend Dev | S0-T37 |
| S0-T39 | Crear layout base (Sidebar, Header, Main) | 4 | Frontend Dev | S0-T38 |
| S0-T40 | Crear pagina de Login (solo UI, sin logica) | 3 | Frontend Dev | S0-T39 |
| S0-T41 | Crear pagina de Dashboard (solo layout) | 2 | Frontend Dev | S0-T39 |
| S0-T42 | Crear pagina de Maquinas (solo layout) | 2 | Frontend Dev | S0-T39 |
| S0-T43 | Crear pagina de Mantenimientos (solo layout) | 2 | Frontend Dev | S0-T39 |
| S0-T44 | Configurar React Router con rutas base | 2 | Frontend Dev | S0-T39 |
| S0-T45 | Crear componente de Sidebar responsive | 3 | Frontend Dev | S0-T38 |
| S0-T46 | Configurar axios con interceptors | 2 | Frontend Dev | - |
| S0-T47 | Crear API service layer base | 2 | Frontend Dev | S0-T46 |
| **Subtotal** | | **28 hrs** | | |

### Entregables Dia 7-8:
- [ ] Frontend levantando con Vite
- [ ] Tailwind + shadcn configurados
- [ ] Layout base con sidebar, header, main
- [ ] Todas las paginas stub creadas
- [ ] Routing funcionando

---

## Sprint 0 - Dia 9-10: CI/CD y Verificacion

| ID | Tarea | Hrs | Responsable | Dep |
|---|---|---|---|---|
| S0-T48 | Crear pipeline CI: lint + typecheck | 3 | DevOps | - |
| S0-T49 | Crear pipeline CI: unit tests | 2 | DevOps | - |
| S0-T50 | Crear pipeline CI: integration tests | 3 | DevOps | S0-T22 |
| S0-T51 | Crear pipeline CI: security scan (npm audit) | 1 | DevOps | - |
| S0-T52 | Configurar Codecov para coverage | 1 | DevOps | S0-T49 |
| S0-T53 | Crear .github/workflows/ci.yml completo | 2 | DevOps | S0-T48, S0-T49, S0-T50, S0-T51 |
| S0-T54 | Ejecutar CI completo y verificar que pasa | 2 | DevOps | S0-T53 |
| S0-T55 | Configurar Docker Compose en CI | 2 | DevOps | S0-T22 |
| S0-T56 | Documentar setup de desarrollo (README) | 2 | Tech Lead | - |
| S0-T57 | Sprint Review y Retrospective | 2 | Todo el equipo | - |
| **Subtotal** | | **20 hrs** | | |

### Entregables Dia 9-10:
- [ ] Pipeline CI ejecutando: lint, tests, security
- [ ] Coverage report funcionando
- [ ] Documentacion de setup actualizada
- [ ] Sprint Review completada

---

## Sprint 0 - Resumen

| Dia | Enfoque | Horas |
|---|---|---|
| 1-2 | Repository y Herramientas | 12.5 |
| 3-4 | Docker y Base de Datos | 30 |
| 5-6 | Backend Base | 21.5 |
| 7-8 | Frontend Base | 28 |
| 9-10 | CI/CD y Verificacion | 20 |
| **Total** | | **112 hrs** |

### Criterios de Aceptacion Sprint 0:
- [ ] `docker compose up` levanta app, postgres, redis
- [ ] Backend responde en :3000 con health check
- [ ] Frontend renderiza en :80 con todas las paginas stub
- [ ] Prisma migrate ejecuta sin errores
- [ ] Seed data carga correctamente
- [ ] CI pipeline pasa: lint, typecheck, tests
- [ ] Sentry recibe errores de prueba
- [ ] README con instrucciones de setup completo
- [ ] Todo el equipo puede desarrollar en su maquina

---

# SPRINT 1: AUTH + MAQUINAS BASE

**Objetivo:** Sistema de autenticacion completo (login, JWT, RBAC) y CRUD basico de maquinas funcional.

**Duration:** Semana 3-4 (10 dias habiles)
**Capacity estimada:** ~80 horas efectivas

---

## Sprint 1 - Dia 1-2: Auth Backend

| ID | Tarea | Hrs | Responsable | Dep |
|---|---|---|---|---|
| S1-T01 | Crear auth validation schemas (Zod) | 2 | Backend Dev | - |
| S1-T02 | Crear auth service: login (verificar email+password) | 3 | Backend Dev | S0-T32 |
| S1-T03 | Crear auth service: generar access token (15min) | 2 | Backend Dev | S1-T02 |
| S1-T04 | Crear auth service: generar refresh token (7d) | 2 | Backend Dev | S1-T02 |
| S1-T05 | Crear auth service: refresh token flow | 2 | Backend Dev | S1-T04 |
| S1-T06 | Crear auth controller: POST /auth/login | 2 | Backend Dev | S1-T03 |
| S1-T07 | Crear auth controller: POST /auth/refresh | 1 | Backend Dev | S1-T05 |
| S1-T08 | Crear auth controller: POST /auth/logout | 1 | Backend Dev | S1-T05 |
| S1-T09 | Crear auth middleware: verificar JWT | 2 | Backend Dev | S1-T03 |
| S1-T10 | Crear RBAC middleware: verificar permisos por rol | 3 | Backend Dev | S1-T09 |
| S1-T11 | Crear auth routes con middleware chain | 1 | Backend Dev | S1-T06, S1-T07, S1-T08 |
| S1-T12 | Configurar Redis para refresh tokens | 2 | Backend Dev | S0-T18 |
| S1-T13 | Test unitarios: auth service | 3 | Backend Dev | S1-T02 |
| **Subtotal** | | **26 hrs** | | |

### Detalle RBAC:
```typescript
// Roles y permisos:
const PERMISSIONS = {
  Admin: ['*'], // acceso total
  Supervisor: [
    'machines:read', 'machines:create', 'machines:update',
    'maintenances:read', 'maintenances:create', 'maintenances:update',
    'alerts:read', 'alerts:update',
    'reports:read'
  ],
  Technician: [
    'machines:read',
    'maintenances:read', 'maintenances:create', 'maintenances:update_own',
    'alerts:read', 'alerts:update_own'
  ],
  Viewer: [
    'machines:read',
    'maintenances:read',
    'alerts:read',
    'reports:read'
  ]
};
```

### Entregables Dia 1-2:
- [ ] Login genera access + refresh tokens
- [ ] Refresh token renueva access token
- [ ] Logout invalida refresh token
- [ ] Auth middleware verifica JWT
- [ ] RBAC middleware verifica permisos
- [ ] Tests unitarios pasando

---

## Sprint 1 - Dia 3-4: Auth Frontend + Maquinas Backend

| ID | Tarea | Hrs | Responsable | Dep |
|---|---|---|---|---|
| S1-T14 | Crear auth store (Zustand) | 2 | Frontend Dev | - |
| S1-T15 | Crear login page con form y validacion | 3 | Frontend Dev | S0-T40 |
| S1-T16 | Conectar login con API | 2 | Frontend Dev | S1-T14, S1-T06 |
| S1-T17 | Crear ProtectedRoute component | 2 | Frontend Dev | S1-T14 |
| S1-T18 | Configurar axios interceptor (auto-refresh) | 2 | Frontend Dev | S1-T05 |
| S1-T19 | Crear logout flow | 1 | Frontend Dev | S1-T14 |
| S1-T20 | Mostrar/ocultar menu segun rol | 2 | Frontend Dev | S1-T14 |
| S1-T21 | Crear machine validation schemas (Zod) | 2 | Backend Dev | - |
| S1-T22 | Crear machine service: CRUD basico | 4 | Backend Dev | S0-T32 |
| S1-T23 | Crear machine controller: GET /machines (lista paginada) | 2 | Backend Dev | S1-T22 |
| S1-T24 | Crear machine controller: POST /machines | 2 | Backend Dev | S1-T22 |
| S1-T25 | Crear machine controller: GET /machines/:id | 1 | Backend Dev | S1-T22 |
| S1-T26 | Crear machine routes con auth + RBAC | 1 | Backend Dev | S1-T10, S1-T23 |
| S1-T27 | Test unitarios: machine service | 3 | Backend Dev | S1-T22 |
| **Subtotal** | | **29 hrs** | | |

### Entregables Dia 3-4:
- [ ] Login funcional completo (UI + API)
- [ ] Rutas protegidas funcionando
- [ ] Menu segun rol visible
- [ ] CRUD basico de maquinas backend
- [ ] Tests de maquinas pasando

---

## Sprint 1 - Dia 5-6: Maquinas Frontend

| ID | Tarea | Hrs | Responsable | Dep |
|---|---|---|---|---|
| S1-T28 | Crear machines API service (frontend) | 2 | Frontend Dev | S1-T23 |
| S1-T29 | Crear tabla de maquinas con paginacion | 4 | Frontend Dev | S1-T28 |
| S1-T30 | Crear formulario nueva maquina | 4 | Frontend Dev | S1-T28 |
| S1-T31 | Crear validacion de codigo unico en tiempo real | 2 | Frontend Dev | S1-T30 |
| S1-T32 | Crear detalle de maquina (vista) | 3 | Frontend Dev | S1-T28 |
| S1-T33 | Conectar tabla con API (fetch, filtros basicos) | 2 | Frontend Dev | S1-T29 |
| S1-T34 | Conectar formulario con API (POST) | 1 | Frontend Dev | S1-T30 |
| S1-T35 | Crear estados de carga y error | 2 | Frontend Dev | - |
| S1-T36 | Crear componente EmptyState | 1 | Frontend Dev | - |
| **Subtotal** | | **21 hrs** | | |

### Entregables Dia 5-6:
- [ ] Lista de maquinas con paginacion
- [ ] Formulario de nueva maquina funcional
- [ ] Detalle de maquina mostrando datos
- [ ] Estados de carga y error
- [ ] Validacion de codigo unico funcionando

---

## Sprint 1 - Dia 7-8: Integracion y Pulido

| ID | Tarea | Hrs | Responsable | Dep |
|---|---|---|---|---|
| S1-T37 | Integration tests: auth endpoints | 3 | QA | S1-T06 |
| S1-T38 | Integration tests: machine endpoints | 3 | QA | S1-T23 |
| S1-T39 | QA manual: flujo login completo | 2 | QA | S1-T16 |
| S1-T40 | QA manual: flujo crear maquina | 2 | QA | S1-T30 |
| S1-T41 | Fix bugs encontrados en QA | 4 | Backend Dev | S1-T37, S1-T38 |
| S1-T42 | Fix bugs frontend | 3 | Frontend Dev | S1-T39, S1-T40 |
| S1-T43 | Responsive testing en movil | 2 | Frontend Dev | - |
| **Subtotal** | | **19 hrs** | | |

---

## Sprint 1 - Dia 9-10: Deploy y Cierre

| ID | Tarea | Hrs | Responsable | Dep |
|---|---|---|---|---|
| S1-T44 | Deploy a staging (auto) | 1 | DevOps | S1-T41 |
| S1-T45 | Smoke tests en staging | 2 | QA | S1-T44 |
| S1-T46 | Code review de todos los PRs | 3 | Tech Lead | S1-T41 |
| S1-T47 | Merge a develop | 1 | Tech Lead | S1-T46 |
| S1-T48 | Documentar endpoints en Swagger | 2 | Backend Dev | - |
| S1-T49 | Sprint Review y Retrospective | 2 | Todo el equipo | - |
| **Subtotal** | | **11 hrs** | | |

---

## Sprint 1 - Resumen

| Dia | Enfoque | Horas |
|---|---|---|
| 1-2 | Auth Backend | 26 |
| 3-4 | Auth Frontend + Maquinas Backend | 29 |
| 5-6 | Maquinas Frontend | 21 |
| 7-8 | Integracion y Pulido | 19 |
| 9-10 | Deploy y Cierre | 11 |
| **Total** | | **106 hrs** |

### Criterios de Aceptacion Sprint 1:
- [ ] Login con credenciales validas funciona
- [ ] Login con credenciales invalidas muestra error generico
- [ ] 5 intentos fallidos bloquean cuenta por 30 min
- [ ] Token se renueva automaticamente
- [ ] Logout invalida el token
- [ ] Admin puede acceder a todas las rutas
- [ ] Tecnico no puede acceder a /users (403)
- [ ] Maquina se crea con ID unico
- [ ] Codigo interno se valida como unico en tiempo real
- [ ] Lista de maquinas muestra datos con paginacion
- [ ] Detalle de maquina muestra toda la info
- [ ] RBAC funciona en backend y frontend
- [ ] CI/CD passing
- [ ] Deploy a staging exitoso

---

# SPRINT 2: MAQUINAS COMPLETO + USUARIOS

**Objetivo:** CRUD completo de maquinas con busqueda/filtros/exportacion, gestion completa de usuarios, y catalogos funcionales.

**Duration:** Semana 5-6 (10 dias habiles)
**Capacity estimada:** ~80 horas efectivas

---

## Sprint 2 - Dia 1-2: Maquinas Backend Avanzado

| ID | Tarea | Hrs | Responsable | Dep |
|---|---|---|---|---|
| S2-T01 | Crear machine controller: PUT /machines/:id | 2 | Backend Dev | S1-T22 |
| S2-T02 | Crear machine controller: DELETE /machines/:id (soft delete) | 2 | Backend Dev | S1-T22 |
| S2-T03 | Crear busqueda por texto libre (codigo, nombre, marca, modelo) | 3 | Backend Dev | S1-T23 |
| S2-T04 | Crear filtros por estado, tipo, marca | 2 | Backend Dev | S1-T23 |
| S2-T05 | Crear ordenamiento por columnas | 1 | Backend Dev | S1-T23 |
| S2-T06 | Crear exportacion CSV (con filtros aplicados) | 3 | Backend Dev | S2-T03, S2-T04 |
| S2-T07 | Crear cambio de estado con validacion de transiciones | 3 | Backend Dev | S2-T01 |
| S2-T08 | Crear endpoint: GET /machines/:id/history | 2 | Backend Dev | S1-T22 |
| S2-T09 | Test unitarios: maquinas avanzado | 3 | Backend Dev | S2-T01 a S2-T08 |
| **Subtotal** | | **21 hrs** | | |

### Logica de Transiciones de Estado:
```
Activa → En Mantenimiento (al iniciar servicio)
Activa → Inactiva (decision administrativa)
Activa → Dada de Baja (con motivo obligatorio)
En Mantenimiento → Activa (al completar servicio)
En Mantenimiento → Cancelada (con motivo)
Inactiva → Activa (reactivacion)
Dada de Baja → (no transicion, estado final)
```

### Entregables Dia 1-2:
- [ ] Editar maquina funcional
- [ ] Eliminar (soft delete) maquina
- [ ] Busqueda por texto libre funcionando
- [ ] Filtros combinables funcionando
- [ ] Exportacion CSV respetando filtros
- [ ] Cambio de estado con validacion

---

## Sprint 2 - Dia 3-4: Maquinas Frontend Avanzado + Usuarios Backend

| ID | Tarea | Hrs | Responsable | Dep |
|---|---|---|---|---|
| S2-T10 | Crear barra de busqueda con debounce | 2 | Frontend Dev | S2-T03 |
| S2-T11 | Crear dropdowns de filtro (estado, tipo, marca) | 3 | Frontend Dev | S2-T04 |
| S2-T12 | Conectar filtros con API | 2 | Frontend Dev | S2-T10, S2-T11 |
| S2-T13 | Crear boton de exportar CSV en frontend | 1 | Frontend Dev | S2-T06 |
| S2-T14 | Crear form de editar maquina (reutilizar form crear) | 3 | Frontend Dev | S1-T30 |
| S2-T15 | Crear modal de cambio de estado | 2 | Frontend Dev | S2-T07 |
| S2-T16 | Crear modal de confirmacion para eliminar | 1 | Frontend Dev | - |
| S2-T17 | Crear user validation schemas (Zod) | 2 | Backend Dev | - |
| S2-T18 | Crear user service: CRUD completo | 4 | Backend Dev | S0-T32 |
| S2-T19 | Crear user controller: todos los endpoints | 3 | Backend Dev | S2-T18 |
| S2-T20 | Crear user routes con auth + admin only | 1 | Backend Dev | S2-T19 |
| **Subtotal** | | **24 hrs** | | |

### Entregables Dia 3-4:
- [ ] Busqueda en tiempo real funcionando
- [ ] Filtros aplicados y limpiados
- [ ] Exportar CSV desde frontend
- [ ] Editar maquina funcional
- [ ] Cambio de estado funcional
- [ ] CRUD usuarios backend completo

---

## Sprint 2 - Dia 5-6: Usuarios Frontend + Catalogos

| ID | Tarea | Hrs | Responsable | Dep |
|---|---|---|---|---|
| S2-T21 | Crear users API service (frontend) | 1 | Frontend Dev | S2-T19 |
| S2-T22 | Crear tabla de usuarios (solo Admin) | 3 | Frontend Dev | S2-T21 |
| S2-T23 | Crear modal nuevo usuario | 3 | Frontend Dev | S2-T21 |
| S2-T24 | Crear modal editar usuario | 2 | Frontend Dev | S2-T22 |
| S2-T25 | Crear toggle activar/desactivar usuario | 2 | Frontend Dev | S2-T22 |
| S2-T26 | Crear machine type validation schemas | 1 | Backend Dev | - |
| S2-T27 | Crear machine type service: CRUD | 2 | Backend Dev | - |
| S2-T28 | Crear machine type controller + routes | 2 | Backend Dev | S2-T27 |
| S2-T29 | Crear maintenance type validation schemas | 1 | Backend Dev | - |
| S2-T30 | Crear maintenance type service: CRUD | 2 | Backend Dev | - |
| S2-T31 | Crear maintenance type controller + routes | 2 | Backend Dev | S2-T30 |
| **Subtotal** | | **23 hrs** | | |

### Entregables Dia 5-6:
- [ ] Gestion de usuarios completa (Admin)
- [ ] Crear, editar, activar/desactivar usuarios
- [ ] Catalogo de tipos de maquina CRUD
- [ ] Catalogo de tipos de mantenimiento CRUD

---

## Sprint 2 - Dia 7-8: Integracion Completa

| ID | Tarea | Hrs | Responsable | Dep |
|---|---|---|---|---|
| S2-T32 | Integration tests: maquinas avanzado | 3 | QA | S2-T01 |
| S2-T33 | Integration tests: usuarios | 2 | QA | S2-T19 |
| S2-T34 | QA manual: flujo completo maquinas | 3 | QA | S2-T14 |
| S2-T35 | QA manual: gestion de usuarios | 2 | QA | S2-T23 |
| S2-T36 | Fix bugs backend | 3 | Backend Dev | S2-T32 |
| S2-T37 | Fix bugs frontend | 3 | Frontend Dev | S2-T34 |
| S2-T38 | Performance: optimizar query de busqueda | 2 | Backend Dev | - |
| **Subtotal** | | **18 hrs** | | |

---

## Sprint 2 - Dia 9-10: Deploy y Cierre

| ID | Tarea | Hrs | Responsable | Dep |
|---|---|---|---|---|
| S2-T39 | Deploy a staging | 1 | DevOps | S2-T36 |
| S2-T40 | Smoke tests en staging | 2 | QA | S2-T39 |
| S2-T41 | Code review completo | 3 | Tech Lead | S2-T36 |
| S2-T42 | Actualizar Swagger docs | 2 | Backend Dev | - |
| S2-T43 | Sprint Review y Retrospective | 2 | Todo el equipo | - |
| **Subtotal** | | **10 hrs** | | |

---

## Sprint 2 - Resumen

| Dia | Enfoque | Horas |
|---|---|---|
| 1-2 | Maquinas Backend Avanzado | 21 |
| 3-4 | Maquinas Frontend + Usuarios Backend | 24 |
| 5-6 | Usuarios Frontend + Catalogos | 23 |
| 7-8 | Integracion Completa | 18 |
| 9-10 | Deploy y Cierre | 10 |
| **Total** | | **96 hrs** |

### Criterios de Aceptacion Sprint 2:
- [ ] Editar maquina funciona correctamente
- [ ] Busqueda por texto funciona en tiempo real
- [ ] Filtros combinables funcionan
- [ ] Exportar CSV respeta filtros aplicados
- [ ] Transiciones de estado validas
- [ ] Dada de Baja requiere motivo
- [ ] Admin crea, edita y desactiva usuarios
- [ ] Email unico validado
- [ ] Roles se asignan correctamente
- [ ] Catalogos CRUD funcionales
- [ ] CI/CD passing
- [ ] Deploy a staging exitoso

---

# SPRINT 3: MANTENIMIENTOS + ALERTAS

**Objetivo:** Sistema completo de mantenimientos con calculo automatico de proximo servicio y alertas funcionales.

**Duration:** Semana 7-8 (10 dias habiles)
**Capacity estimada:** ~80 horas efectivas

---

## Sprint 3 - Dia 1-2: Mantenimientos Backend

| ID | Tarea | Hrs | Responsable | Dep |
|---|---|---|---|---|
| S3-T01 | Crear maintenance validation schemas | 2 | Backend Dev | - |
| S3-T02 | Crear maintenance service: registrar mantenimiento | 4 | Backend Dev | S0-T32 |
| S3-T03 | Implementar calculo automatico: hours_until_next | 3 | Backend Dev | S3-T02 |
| S3-T04 | Implementar calculo automatico: estimated_next_date | 2 | Backend Dev | S3-T02 |
| S3-T05 | Crear maintenance controller: POST /maintenances | 2 | Backend Dev | S3-T02 |
| S3-T06 | Crear maintenance controller: GET /maintenances (lista) | 2 | Backend Dev | S3-T02 |
| S3-T07 | Crear maintenance controller: GET /maintenances/:id | 1 | Backend Dev | S3-T02 |
| S3-T08 | Crear maintenance controller: PUT /maintenances/:id | 2 | Backend Dev | S3-T02 |
| S3-T09 | Crear logica de cambio de estado de maquina | 3 | Backend Dev | S3-T05 |
| S3-T10 | Crear endpoint: GET /machines/:id/maintenances (historial) | 2 | Backend Dev | S3-T06 |
| S3-T11 | Crear maintenance items (repuestos) service | 3 | Backend Dev | S3-T02 |
| S3-T12 | Test unitarios: maintenance service | 4 | Backend Dev | S3-T02 |
| **Subtotal** | | **30 hrs** | | |

### Logica de Calculo de Proximo Mantenimiento:
```typescript
// Calculo de proximo mantenimiento
function calculateNextMaintenance(
  currentHours: number,
  machineType: MachineType,
  maintenanceType: MaintenanceType
): { hoursUntilNext: number; estimatedNextDate: Date } {
  
  // Obtener intervalo segun tipo de maquina y mantenimiento
  const intervalHours = getMaintenanceInterval(machineType.id, maintenanceType.id);
  
  const hoursUntilNext = intervalHours - currentHours;
  
  // Estimar fecha basado en horas promedio diarias
  const dailyHours = machineType.dailyHoursAverage || 8;
  const daysUntilNext = Math.ceil(hoursUntilNext / dailyHours);
  const estimatedNextDate = new Date();
  estimatedNextDate.setDate(estimatedNextDate.getDate() + daysUntilNext);
  
  return { hoursUntilNext, estimatedNextDate };
}
```

### Entregables Dia 1-2:
- [ ] Registrar mantenimiento con todos los campos
- [ ] Calculo automatico de hours_until_next
- [ ] Calculo automatico de estimated_next_date
- [ ] Lista de mantenimientos con filtros
- [ ] Historial por maquina funcional
- [ ] Repuestos por mantenimiento funcional
- [ ] Tests unitarios pasando

---

## Sprint 3 - Dia 3-4: Mantenimientos Frontend + Alertas Backend

| ID | Tarea | Hrs | Responsable | Dep |
|---|---|---|---|---|
| S3-T13 | Crear maintenances API service (frontend) | 1 | Frontend Dev | S3-T06 |
| S3-T14 | Crear formulario nuevo mantenimiento | 5 | Frontend Dev | S3-T13 |
| S3-T15 | Crear autocomplete de maquina (muestra horas actuales) | 2 | Frontend Dev | S3-T14 |
| S3-T16 | Crear panel de calculo automatico en tiempo real | 2 | Frontend Dev | S3-T14 |
| S3-T17 | Crear tabla de mantenimientos | 3 | Frontend Dev | S3-T13 |
| S3-T18 | Crear detalle de mantenimiento | 2 | Frontend Dev | S3-T13 |
| S3-T19 | Crear alert service: detectar proximos vencimientos | 3 | Backend Dev | S3-T02 |
| S3-T20 | Crear alert service: detectar vencidos | 2 | Backend Dev | S3-T02 |
| S3-T21 | Crear alert controller: GET /alerts | 2 | Backend Dev | S3-T19 |
| S3-T22 | Crear alert controller: PATCH /alerts/:id/read | 1 | Backend Dev | S3-T19 |
| S3-T23 | Crear cron job diario para generar alertas | 2 | Backend Dev | S3-T19 |
| S3-T24 | Crear alert routes con auth | 1 | Backend Dev | S3-T21 |
| **Subtotal** | | **28 hrs** | | |

### Cron Job de Alertas:
```typescript
// cron_jobs/daily-alerts.ts
// Se ejecuta todos los dias a las 6:00 AM UTC

async function generateAlerts() {
  // 1. Buscar mantenimientos proximos a vencer
  const upcomingMaintenances = await prisma.maintenance.findMany({
    where: {
      status: 'COMPLETED',
      nextMaintenanceDate: {
        lte: addDays(new Date(), getGlobalConfig('alert_days_before'))
      }
    }
  });

  // 2. Generar alertas por cada mantenimiento proximo
  for (const maintenance of upcomingMaintenances) {
    await createAlert({
      machineId: maintenance.machineId,
      maintenanceId: maintenance.id,
      type: 'UPCOMING',
      severity: calculateSeverity(maintenance.nextMaintenanceDate),
      message: `Mantenimiento proximo para ${maintenance.machine.name}`
    });
  }

  // 3. Buscar mantenimientos vencidos (fecha pasada sin completar)
  const overdueMaintenances = await prisma.maintenance.findMany({
    where: {
      status: { in: ['SCHEDULED', 'IN_PROGRESS'] },
      nextMaintenanceDate: { lt: new Date() }
    }
  });

  for (const maintenance of overdueMaintenances) {
    await createAlert({
      machineId: maintenance.machineId,
      maintenanceId: maintenance.id,
      type: 'OVERDUE',
      severity: 'CRITICAL',
      message: `Mantenimiento VENCIDO para ${maintenance.machine.name}`
    });
  }
}
```

### Entregables Dia 3-4:
- [ ] Formulario de mantenimiento funcional
- [ ] Autocomplete de maquina mostrando horas
- [ ] Panel de calculo en tiempo real
- [ ] Lista de mantenimientos funcional
- [ ] Alertas generadas automaticamente
- [ ] Alertas de vencimiento funcionando
- [ ] Marcar alerta como leida

---

## Sprint 3 - Dia 5-6: Alertas Frontend + Estados

| ID | Tarea | Hrs | Responsable | Dep |
|---|---|---|---|---|
| S3-T25 | Crear alerts API service (frontend) | 1 | Frontend Dev | S3-T21 |
| S3-T26 | Crear pagina de alertas | 3 | Frontend Dev | S3-T25 |
| S3-T27 | Crear componente de campana de notificaciones | 2 | Frontend Dev | S3-T25 |
| S3-T28 | Conectar campana con contador de alertas | 1 | Frontend Dev | S3-T27 |
| S3-T29 | Crear modal de cambio de estado de mantenimiento | 3 | Frontend Dev | S3-T18 |
| S3-T30 | Implementar flujo: Programado → En Proceso | 2 | Backend Dev | S3-T09 |
| S3-T31 | Implementar flujo: En Proceso → Completado | 2 | Backend Dev | S3-T09 |
| S3-T32 | Implementar flujo: Programado/En Proceso → Cancelado | 2 | Backend Dev | S3-T09 |
| S3-T33 | Crear log de cambio de estado en auditoria | 2 | Backend Dev | S3-T30 |
| **Subtotal** | | **18 hrs** | | |

### Entregables Dia 5-6:
- [ ] Pagina de alertas funcional
- [ ] Campana de notificaciones con contador
- [ ] Alertas marcadas como leidas
- [ ] Estados de mantenimiento funcionando
- [ ] Flujo completo: Programado → En Proceso → Completado
- [ ] Cancelar con motivo registrado
- [ ] Cambios registrados en auditoria

---

## Sprint 3 - Dia 7-8: Integracion

| ID | Tarea | Hrs | Responsable | Dep |
|---|---|---|---|---|
| S3-T34 | Integration tests: maintenances | 3 | QA | S3-T05 |
| S3-T35 | Integration tests: alerts | 2 | QA | S3-T21 |
| S3-T36 | QA manual: flujo completo mantenimiento | 3 | QA | S3-T14 |
| S3-T37 | QA manual: alertas y notificaciones | 2 | QA | S3-T26 |
| S3-T38 | Fix bugs backend | 3 | Backend Dev | S3-T34 |
| S3-T39 | Fix bugs frontend | 3 | Frontend Dev | S3-T36 |
| **Subtotal** | | **16 hrs** | | |

---

## Sprint 3 - Dia 9-10: Deploy y Cierre

| ID | Tarea | Hrs | Responsable | Dep |
|---|---|---|---|---|
| S3-T40 | Deploy a staging | 1 | DevOps | S3-T38 |
| S3-T41 | Smoke tests en staging | 2 | QA | S3-T40 |
| S3-T42 | Code review completo | 3 | Tech Lead | S3-T38 |
| S3-T43 | Actualizar documentacion | 2 | Backend Dev | - |
| S3-T44 | Sprint Review y Retrospective | 2 | Todo el equipo | - |
| **Subtotal** | | **10 hrs** | | |

---

## Sprint 3 - Resumen

| Dia | Enfoque | Horas |
|---|---|---|
| 1-2 | Mantenimientos Backend | 30 |
| 3-4 | Mantenimientos Frontend + Alertas Backend | 28 |
| 5-6 | Alertas Frontend + Estados | 18 |
| 7-8 | Integracion | 16 |
| 9-10 | Deploy y Cierre | 10 |
| **Total** | | **102 hrs** |

### Criterios de Aceptacion Sprint 3:
- [ ] Mantenimiento se registra con todos los campos obligatorios
- [ ] Calculo de proximo mantenimiento es correcto
- [ ] Cambio de maquina a "En Mantenimiento" al iniciar servicio
- [ ] Regreso a "Activa" al completar servicio
- [ ] Cancelar requiere motivo
- [ ] Alertas se generan automaticamente (verificar cron)
- [ ] Campana muestra contador correcto
- [ ] Marcar alerta como leida funciona
- [ ] Alertas de vencido muestran severidad critica
- [ ] Historial de mantenimientos por maquina completo
- [ ] Repuestos registrados correctamente
- [ ] CI/CD passing
- [ ] Deploy a staging exitoso

---

# SPRINT 4: REPORTES + DASHBOARD

**Objetivo:** Dashboard con KPIs reales, reportes funcionales con exportacion PDF/CSV, y historial completo de mantenimientos.

**Duration:** Semana 9-10 (10 dias habiles)
**Capacity estimada:** ~80 horas efectivas

---

## Sprint 4 - Dia 1-3: Dashboard Backend + Reportes Base

| ID | Tarea | Hrs | Responsable | Dep |
|---|---|---|---|---|
| S4-T01 | Crear dashboard service: KPIs calculados | 4 | Backend Dev | - |
| S4-T02 | KPI: Total de maquinas (por estado) | 1 | Backend Dev | S4-T01 |
| S4-T03 | KPI: Mantenimientos del mes | 1 | Backend Dev | S4-T01 |
| S4-T04 | KPI: Alertas activas (por severidad) | 1 | Backend Dev | S4-T01 |
| S4-T05 | KPI: Tecnicos disponibles | 1 | Backend Dev | S4-T01 |
| S4-T06 | Crear dashboard controller: GET /dashboard/kpis | 2 | Backend Dev | S4-T01 |
| S4-T07 | Crear dashboard controller: GET /dashboard/charts | 3 | Backend Dev | S4-T01 |
| S4-T08 | Crear dashboard controller: GET /dashboard/upcoming | 2 | Backend Dev | S4-T01 |
| S4-T09 | Crear dashboard controller: GET /dashboard/alerts | 1 | Backend Dev | S4-T01 |
| S4-T10 | Crear report service: historial por maquina | 3 | Backend Dev | - |
| S4-T11 | Crear report service: mantenimientos por periodo | 3 | Backend Dev | - |
| S4-T12 | Crear report controller: GET /reports/:type | 2 | Backend Dev | S4-T10 |
| S4-T13 | Crear exportacion PDF (puppeteer o pdfmake) | 4 | Backend Dev | - |
| S4-T14 | Crear exportacion CSV para reportes | 2 | Backend Dev | - |
| **Subtotal** | | **30 hrs** | | |

### KPIs del Dashboard:
```sql
-- Total maquinas por estado
SELECT status, COUNT(*) FROM machines GROUP BY status;

-- Mantenimientos del mes actual
SELECT COUNT(*) FROM maintenances 
WHERE MONTH(created_at) = MONTH(CURRENT_DATE());

-- Alertas activas por severidad
SELECT severity, COUNT(*) FROM alerts 
WHERE is_read = false GROUP BY severity;

-- Tecnicos disponibles (rol Technician + activos)
SELECT COUNT(*) FROM users 
WHERE role = 'TECHNICIAN' AND is_active = true;

-- Mantenimientos por tipo (grafico barras)
SELECT mt.name, COUNT(*) 
FROM maintenances m 
JOIN maintenance_types mt ON m.maintenance_type_id = mt.id
WHERE m.created_at >= DATE_SUB(CURRENT_DATE(), INTERVAL 1 MONTH)
GROUP BY mt.name;

-- Tendencia ultimos 6 meses (grafico linea)
SELECT DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*)
FROM maintenances
WHERE created_at >= DATE_SUB(CURRENT_DATE(), INTERVAL 6 MONTH)
GROUP BY month ORDER BY month;
```

### Entregables Dia 1-3:
- [ ] Dashboard KPIs calculados correctamente
- [ ] Graficos con datos reales
- [ ] Proximos mantenimientos en dashboard
- [ ] Alertas activas en dashboard
- [ ] Reporte historial por maquina
- [ ] Reporte por periodo
- [ ] Exportacion PDF funcionando
- [ ] Exportacion CSV funcionando

---

## Sprint 4 - Dia 4-5: Dashboard Frontend + Reportes Frontend

| ID | Tarea | Hrs | Responsable | Dep |
|---|---|---|---|---|
| S4-T15 | Crear dashboard API service (frontend) | 1 | Frontend Dev | S4-T06 |
| S4-T16 | Crear componente KPI cards (4 cards) | 3 | Frontend Dev | S4-T15 |
| S4-T17 | Crear grafico de barras (Recharts) | 3 | Frontend Dev | S4-T15 |
| S4-T18 | Crear grafico de linea (Recharts) | 3 | Frontend Dev | S4-T15 |
| S4-T19 | Crear lista de proximos mantenimientos | 2 | Frontend Dev | S4-T15 |
| S4-T20 | Crear lista de alertas activas | 1 | Frontend Dev | S4-T15 |
| S4-T21 | Crear reports API service (frontend) | 1 | Frontend Dev | S4-T12 |
| S4-T22 | Crear pagina de reportes con tipos | 2 | Frontend Dev | S4-T21 |
| S4-T23 | Crear filtros de reporte (maquina, fecha, tipo) | 3 | Frontend Dev | S4-T22 |
| S4-T24 | Crear area de resultados (tabla + graficos) | 3 | Frontend Dev | S4-T23 |
| S4-T25 | Crear botones de exportar PDF y CSV | 2 | Frontend Dev | S4-T24 |
| **Subtotal** | | **24 hrs** | | |

### Entregables Dia 4-5:
- [ ] Dashboard completo con KPIs reales
- [ ] Graficos de barras y linea funcionales
- [ ] Listas de proximos y alertas en dashboard
- [ ] Pagina de reportes con tipos
- [ ] Filtros de reporte funcionales
- [ ] Exportar PDF y CSV desde frontend

---

## Sprint 4 - Dia 6-7: Reportes Avanzados + Historial

| ID | Tarea | Hrs | Responsable | Dep |
|---|---|---|---|---|
| S4-T26 | Crear reporte de cumplimiento | 3 | Backend Dev | - |
| S4-T27 | Crear reporte de estado de flota | 2 | Backend Dev | - |
| S4-T28 | Crear reporte de carga de tecnicos | 2 | Backend Dev | - |
| S4-T29 | Crear paginacion de historial de mantenimientos | 2 | Backend Dev | S3-T10 |
| S4-T30 | Crear busqueda avanzada de mantenimientos | 2 | Backend Dev | S3-T06 |
| S4-T31 | Crear pagina de historial completo (frontend) | 3 | Frontend Dev | S4-T29 |
| S4-T32 | Crear filtros de historial (maquina, fecha, estado, tipo) | 2 | Frontend Dev | S4-T30 |
| S4-T33 | Crear detalle de mantenimiento (vista completa) | 2 | Frontend Dev | S4-T29 |
| **Subtotal** | | **18 hrs** | | |

### Entregables Dia 6-7:
- [ ] Reporte de cumplimiento (preventivos vs completados)
- [ ] Reporte de estado de flota (resumen)
- [ ] Reporte de carga de tecnicos
- [ ] Historial completo de mantenimientos
- [ ] Busqueda avanzada funcionando
- [ ] Detalle completo de cada mantenimiento

---

## Sprint 4 - Dia 8-10: Integracion + Deploy

| ID | Tarea | Hrs | Responsable | Dep |
|---|---|---|---|---|
| S4-T34 | Integration tests: dashboard + reports | 3 | QA | S4-T06 |
| S4-T35 | QA manual: dashboard completo | 2 | QA | S4-T16 |
| S4-T36 | QA manual: reportes y exportaciones | 2 | QA | S4-T22 |
| S4-T37 | Fix bugs backend | 3 | Backend Dev | S4-T34 |
| S4-T38 | Fix bugs frontend | 2 | Frontend Dev | S4-T35 |
| S4-T39 | Deploy a staging | 1 | DevOps | S4-T37 |
| S4-T40 | Smoke tests en staging | 1 | QA | S4-T39 |
| S4-T41 | Code review | 2 | Tech Lead | S4-T37 |
| S4-T42 | Sprint Review y Retrospective | 2 | Todo el equipo | - |
| **Subtotal** | | **18 hrs** | | |

---

## Sprint 4 - Resumen

| Dia | Enfoque | Horas |
|---|---|---|
| 1-3 | Dashboard Backend + Reportes Base | 30 |
| 4-5 | Dashboard Frontend + Reportes Frontend | 24 |
| 6-7 | Reportes Avanzados + Historial | 18 |
| 8-10 | Integracion + Deploy | 18 |
| **Total** | | **90 hrs** |

### Criterios de Aceptacion Sprint 4:
- [ ] Dashboard muestra 4 KPIs con datos reales
- [ ] Grafico de barras muestra mantenimientos por tipo
- [ ] Grafico de linea muestra tendencia 6 meses
- [ ] Proximos mantenimientos muestra top 5
- [ ] Alertas activas muestra top 5
- [ ] Reporte historial por maquina funcional
- [ ] Reporte por periodo con filtros
- [ ] Reporte de cumplimiento calculado correctamente
- [ ] Exportar PDF tiene formato profesional
- [ ] Exportar CSV tiene datos correctos
- [ ] Historial completo paginado y filtrado
- [ ] CI/CD passing
- [ ] Deploy a staging exitoso

---

# SPRINT 5: AUDITORIA + UX

**Objetivo:** Sistema de auditoria completo, configuracion del sistema, UX polish y responsive completo.

**Duration:** Semana 11-12 (10 dias habiles)
**Capacity estimada:** ~80 horas efectivas

---

## Sprint 5 - Dia 1-3: Auditoria Backend + Config

| ID | Tarea | Hrs | Responsable | Dep |
|---|---|---|---|---|
| S5-T01 | Crear audit middleware: interceptar CRUD | 4 | Backend Dev | - |
| S5-T02 | Implementar logging de old_values | 3 | Backend Dev | S5-T01 |
| S5-T03 | Implementar logging de new_values | 2 | Backend Dev | S5-T01 |
| S5-T04 | Crear audit service: consulta con filtros | 3 | Backend Dev | - |
| S5-T05 | Crear audit controller: GET /audit | 2 | Backend Dev | S5-T04 |
| S5-T06 | Crear audit controller: GET /audit/:id (detalle) | 1 | Backend Dev | S5-T04 |
| S5-T07 | Crear audit export CSV | 2 | Backend Dev | S5-T05 |
| S5-T08 | Crear audit routes (admin only) | 1 | Backend Dev | S5-T05 |
| S5-T09 | Crear config service: leer/actualizar system_config | 3 | Backend Dev | - |
| S5-T10 | Crear config controller: GET /config | 1 | Backend Dev | S5-T09 |
| S5-T11 | Crear config controller: PUT /config | 2 | Backend Dev | S5-T09 |
| S5-T12 | Crear config routes (admin only) | 1 | Backend Dev | S5-T11 |
| S5-T13 | Crear notifications service: CRUD in-app | 3 | Backend Dev | - |
| S5-T14 | Crear notifications controller + routes | 2 | Backend Dev | S5-T13 |
| **Subtotal** | | **30 hrs** | | |

### Audit Middleware:
```typescript
// middleware/audit.ts
// Intercepts todas las operaciones CRUD y registra en audit_logs

async function auditMiddleware(req, res, next) {
  const userId = req.user?.id;
  const action = getActionFromMethod(req.method);
  const entityType = getEntityTypeFromPath(req.path);
  
  // Para UPDATE: capturar valores anteriores
  let oldValues = null;
  if (req.method === 'PUT' || req.method === 'PATCH') {
    oldValues = await getEntityById(entityType, req.params.id);
  }
  
  // Para DELETE: capturar valores anteriores
  if (req.method === 'DELETE') {
    oldValues = await getEntityById(entityType, req.params.id);
  }
  
  // Capturar valores nuevos (del body o respuesta)
  const newValues = req.method !== 'GET' ? req.body : null;
  
  // Registrar en audit_logs (append-only)
  await prisma.auditLog.create({
    data: {
      userId,
      action,
      entityType,
      entityId: req.params.id,
      oldValues: oldValues ? JSON.stringify(oldValues) : null,
      newValues: newValues ? JSON.stringify(newValues) : null,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    }
  });
  
  next();
}
```

### Entregables Dia 1-3:
- [ ] Todas las operaciones CRUD se registran en audit_logs
- [ ] Auditoria captura old_values y new_values
- [ ] Auditoria es inmutable (no se puede editar/eliminar)
- [ ] Pagina de auditoria con filtros funcional
- [ ] Configuracion del sistema CRUD funcional
- [ ] Notificaciones in-app CRUD funcional

---

## Sprint 5 - Dia 4-5: Auditoria Frontend + Config Frontend

| ID | Tarea | Hrs | Responsable | Dep |
|---|---|---|---|---|
| S5-T15 | Crear audit API service (frontend) | 1 | Frontend Dev | S5-T05 |
| S5-T16 | Crear pagina de auditoria (tabla) | 3 | Frontend Dev | S5-T15 |
| S5-T17 | Crear filtros de auditoria (usuario, accion, entidad, fecha) | 3 | Frontend Dev | S5-T16 |
| S5-T18 | Crear vista expandible de detalle (JSON diff) | 3 | Frontend Dev | S5-T16 |
| S5-T19 | Crear exportar CSV desde frontend | 1 | Frontend Dev | S5-T07 |
| S5-T20 | Crear config API service (frontend) | 1 | Frontend Dev | S5-T10 |
| S5-T21 | Crear pagina de configuracion con tabs | 3 | Frontend Dev | S5-T20 |
| S5-T22 | Crear tab General (nombre empresa, logo, timezone) | 2 | Frontend Dev | S5-T21 |
| S5-T23 | Crear tab Alertas (dias de anticipacion) | 2 | Frontend Dev | S5-T21 |
| S5-T24 | Crear tab Seguridad (timeout, politica contrasenas) | 2 | Frontend Dev | S5-T21 |
| S5-T25 | Crear notifications API service (frontend) | 1 | Frontend Dev | S5-T14 |
| S5-T26 | Crear bandeja de notificaciones | 2 | Frontend Dev | S5-T25 |
| **Subtotal** | | **27 hrs** | | |

### Entregables Dia 4-5:
- [ ] Pagina de auditoria con filtros
- [ ] Vista de JSON diff expandible
- [ ] Exportar CSV de auditoria
- [ ] Configuracion con tabs funcionales
- [ ] Bandeja de notificaciones

---

## Sprint 5 - Dia 6-7: UX Polish + Responsive

| ID | Tarea | Hrs | Responsable | Dep |
|---|---|---|---|---|
| S5-T27 | Crear componente Toast (success, error, warning, info) | 2 | Frontend Dev | - |
| S5-T28 | Crear componente Spinner/Loading | 1 | Frontend Dev | - |
| S5-T29 | Crear componente EmptyState generico | 1 | Frontend Dev | - |
| S5-T30 | Crear componente Skeleton loading para tablas | 2 | Frontend Dev | - |
| S5-T31 | Agregar toasts a todas las acciones CRUD | 3 | Frontend Dev | S5-T27 |
| S5-T32 | Agregar loading states a todas las paginas | 2 | Frontend Dev | S5-T28 |
| S5-T33 | Agregar empty states a todas las listas | 1 | Frontend Dev | S5-T29 |
| S5-T34 | Responsive: test movil (< 768px) todas las paginas | 3 | Frontend Dev | - |
| S5-T35 | Responsive: test tablet (768-1024px) todas las paginas | 2 | Frontend Dev | - |
| S5-T36 | Fix issues de responsive en movil | 3 | Frontend Dev | S5-T34 |
| S5-T37 | Fix issues de responsive en tablet | 2 | Frontend Dev | S5-T35 |
| S5-T38 | Accessibility: agregar aria-labels, roles | 2 | Frontend Dev | - |
| S5-T39 | Accessibility: test con screen reader basico | 1 | Frontend Dev | - |
| **Subtotal** | | **25 hrs** | | |

### Entregables Dia 6-7:
- [ ] Toast notifications en todas las acciones
- [ ] Loading states en todas las paginas
- [ ] Empty states en todas las listas
- [ ] Responsive funciona en movil
- [ ] Responsive funciona en tablet
- [ ] Responsive funciona en desktop
- [ ] Accessibility basica implementada

---

## Sprint 5 - Dia 8-10: Integracion + Deploy

| ID | Tarea | Hrs | Responsable | Dep |
|---|---|---|---|---|
| S5-T40 | Integration tests: audit + config | 3 | QA | S5-T05 |
| S5-T41 | QA manual: auditoria completa | 2 | QA | S5-T16 |
| S5-T42 | QA manual: configuracion | 1 | QA | S5-T21 |
| S5-T43 | QA responsive completo (3 dispositivos) | 3 | QA | S5-T34 |
| S5-T44 | Fix bugs backend | 2 | Backend Dev | S5-T40 |
| S5-T45 | Fix bugs frontend | 3 | Frontend Dev | S5-T41 |
| S5-T46 | Deploy a staging | 1 | DevOps | S5-T44 |
| S5-T47 | Smoke tests en staging | 1 | QA | S5-T46 |
| S5-T48 | Code review | 2 | Tech Lead | S5-T44 |
| S5-T49 | Sprint Review y Retrospective | 2 | Todo el equipo | - |
| **Subtotal** | | **20 hrs** | | |

---

## Sprint 5 - Resumen

| Dia | Enfoque | Horas |
|---|---|---|
| 1-3 | Auditoria Backend + Config | 30 |
| 4-5 | Auditoria Frontend + Config Frontend | 27 |
| 6-7 | UX Polish + Responsive | 25 |
| 8-10 | Integracion + Deploy | 20 |
| **Total** | | **102 hrs** |

### Criterios de Aceptacion Sprint 5:
- [ ] Todas las acciones CRUD se registran en auditoria
- [ ] Auditoria es inmutable
- [ ] Filtros de auditoria funcionan correctamente
- [ ] JSON diff visible y claro
- [ ] Configuracion se persiste y aplica
- [ ] Notificaciones in-app funcionan
- [ ] Toast aparece en exito y error
- [ ] Loading states funcionales
- [ ] Empty states informativos
- [ ] Responsive funciona en 3 breakpoints
- [ ] Accessibility basica verificada
- [ ] CI/CD passing
- [ ] Deploy a staging exitoso

---

# SPRINT 6: LAUNCH (GO-LIVE)

**Objetivo:** Testing completo, auditoria de seguridad, despliegue a produccion, capacitacion y monitoreo post-lanzamiento.

**Duration:** Semana 13-14 (10 dias habiles)
**Capacity estimada:** ~80 horas efectivas

---

## Sprint 6 - Dia 1-3: Testing Completo

| ID | Tarea | Hrs | Responsable | Dep |
|---|---|---|---|---|
| S6-T01 | Tests E2E: flujo completo login → dashboard | 3 | QA | - |
| S6-T02 | Tests E2E: CRUD maquinas completo | 3 | QA | - |
| S6-T03 | Tests E2E: CRUD mantenimientos completo | 3 | QA | - |
| S6-T04 | Tests E2E: alertas y notificaciones | 2 | QA | - |
| S6-T05 | Tests E2E: reportes y exportaciones | 2 | QA | - |
| S6-T06 | Tests E2E: auditoria y configuracion | 2 | QA | - |
| S6-T07 | Tests E2E: RBAC (todos los roles) | 3 | QA | - |
| S6-T08 | Tests E2E: responsive (3 dispositivos) | 2 | QA | - |
| S6-T09 | Fix bugs criticos encontrados | 4 | Backend Dev | S6-T01 a S6-T08 |
| S6-T10 | Fix bugs altos encontrados | 3 | Frontend Dev | S6-T01 a S6-T08 |
| **Subtotal** | | **27 hrs** | | |

### Checklist de Pruebas E2E:
```
[ ] Login exitoso
[ ] Login fallido (credenciales incorrectas)
[ ] Bloqueo por intentos fallidos
[ ] Refresh token automatico
[ ] Logout completo
[ ] RBAC: Admin ve todo
[ ] RBAC: Technician no ve admin
[ ] RBAC: Viewer solo lee
[ ] Crear maquina
[ ] Editar maquina
[ ] Buscar maquina
[ ] Filtrar maquinas
[ ] Exportar CSV maquinas
[ ] Cambiar estado maquina
[ ] Crear mantenimiento
[ ] Calcular proximo servicio
[ ] Cambiar estado mantenimiento
[ ] Completar mantenimiento
[ ] Cancelar mantenimiento
[ ] Ver historial
[ ] Ver alertas
[ ] Marcar alerta leida
[ ] Dashboard KPIs
[ ] Dashboard graficos
[ ] Reporte historial
[ ] Reporte periodo
[ ] Reporte cumplimiento
[ ] Exportar PDF
[ ] Exportar CSV reportes
[ ] Auditoria registros
[ ] Auditoria filtros
[ ] Configuracion general
[ ] Configuracion alertas
[ ] Responsive movil
[ ] Responsive tablet
```

### Entregables Dia 1-3:
- [ ] Todos los escenarios E2E ejecutados
- [ ] Bugs criticos corregidos
- [ ] Bugs altos corregidos
- [ ] Checklist completo al 100%

---

## Sprint 6 - Dia 4-5: Seguridad

| ID | Tarea | Hrs | Responsable | Dep |
|---|---|---|---|---|
| S6-T11 | Security scan: OWASP ZAP baseline | 3 | DevOps | - |
| S6-T12 | Security scan: OWASP ZAP full | 3 | DevOps | S6-T11 |
| S6-T13 | Pentesting manual: SQL injection | 2 | QA | - |
| S6-T14 | Pentesting manual: XSS stored | 2 | QA | - |
| S6-T15 | Pentesting manual: broken access control | 2 | QA | - |
| S6-T16 | Pentesting manual: IDOR | 2 | QA | - |
| S6-T17 | Pentesting manual: CSRF | 1 | QA | - |
| S6-T18 | Pentesting manual: business logic | 2 | QA | - |
| S6-T19 | Fix vulnerabilidades encontradas | 4 | Backend Dev | S6-T11 a S6-T18 |
| S6-T20 | Verificar headers de seguridad | 1 | DevOps | S6-T19 |
| **Subtotal** | | **22 hrs** | | |

### Checklist de Seguridad:
```
[ ] SQL Injection: todos los inputs sanitizados
[ ] XSS Stored: todos los outputs escapados
[ ] CSRF: tokens funcionando
[ ] Broken Access Control: RBAC verificado
[ ] IDOR: usuarios no acceden a datos de otros
[ ] Brute Force: rate limiting funcionando
[ ] JWT: tokens no se pueden falsificar
[ ] Headers: todos los headers de seguridad presentes
[ ] HTTPS: redireccion forzada
[ ] Passwords: nunca en logs
[ ] Sensitive data: encriptada en reposo
```

### Entregables Dia 4-5:
- [ ] OWASP ZAP scan completado
- [ ] Pentesting manual completado
- [ ] Vulnerabilidades criticas corregidas
- [ ] Vulnerabilidades altas corregidas
- [ ] Headers de seguridad verificados

---

## Sprint 6 - Dia 6-7: Performance + Produccion

| ID | Tarea | Hrs | Responsable | Dep |
|---|---|---|---|---|
| S6-T21 | Load testing: 50 usuarios concurrentes | 3 | DevOps | - |
| S6-T22 | Load testing: 100 usuarios concurrentes | 3 | DevOps | S6-T21 |
| S6-T23 | Optimizar queries lentas (si las hay) | 4 | Backend Dev | S6-T21 |
| S6-T24 | Configurar SSL en produccion | 2 | DevOps | - |
| S6-T25 | Configurar DNS en produccion | 1 | DevOps | - |
| S6-T26 | Verificar backup automatico | 2 | DevOps | - |
| S6-T27 | Verificar monitoreo y alertas | 2 | DevOps | - |
| S6-T28 | Deploy a produccion | 2 | DevOps | S6-T24 |
| S6-T29 | Smoke tests en produccion | 2 | QA | S6-T28 |
| **Subtotal** | | **21 hrs** | | |

### Load Testing Results Esperados:
```
Escenario: 100 usuarios concurrentes
Duracion: 5 minutos

Metricas objetivo:
- Login: < 2s promedio
- Dashboard load: < 3s promedio
- GET /machines: < 500ms P95
- POST /maintenances: < 1s P95
- GET /reports: < 5s P95
- Error rate: < 1%
```

### Entregables Dia 6-7:
- [ ] Load testing completado
- [ ] Queries optimizadas
- [ ] SSL configurado y funcionando
- [ ] DNS configurado
- [ ] Backup automatico verificado
- [ ] Monitoreo activo
- [ ] Deploy a produccion exitoso
- [ ] Smoke tests pasando

---

## Sprint 6 - Dia 8-9: Capacitacion

| ID | Tarea | Hrs | Responsable | Dep |
|---|---|---|---|---|
| S6-T30 | Sesion 1: Capacitacion Admin/Supervisor | 3 | PO + QA | S6-T28 |
| S6-T31 | Sesion 2: Capacitacion Tecnicos | 2 | PO + QA | S6-T28 |
| S6-T32 | Sesion 3: Capacitacion Gerentes (solo lectura) | 2 | PO + QA | S6-T28 |
| S6-T33 | Recoger feedback de usuarios | 2 | PO | S6-T30 a S6-T32 |
| S6-T34 | Crear FAQ basado en preguntas | 2 | PO | S6-T33 |
| S6-T35 | Actualizar manual de usuario | 2 | PO | S6-T33 |
| **Subtotal** | | **13 hrs** | | |

### Entregables Dia 8-9:
- [ ] 3 sesiones de capacitacion completadas
- [ ] Feedback de usuarios documentado
- [ ] FAQ creado
- [ ] Manual de usuario actualizado

---

## Sprint 6 - Dia 10: Cierre

| ID | Tarea | Hrs | Responsable | Dep |
|---|---|---|---|---|
| S6-T36 | Verificar metricas post-lanzamiento (1 semana) | 1 | DevOps | - |
| S6-T37 | Revisar errores en Sentry | 1 | Backend Dev | - |
| S6-T38 | Revisar feedback de usuarios | 1 | PO | - |
| S6-T39 | Documentar lessons learned | 2 | Tech Lead | - |
| S6-T40 | Planificar proximos features (backlog) | 2 | PO | - |
| S6-T41 | Sprint Review y Retrospective final | 2 | Todo el equipo | - |
| S6-T42 | Celebration! | 1 | Todo el equipo | - |
| **Subtotal** | | **9 hrs** | | |

### Entregables Dia 10:
- [ ] Metricas de post-lanzamiento revisadas
- [ ] Errores en Sentry bajo control
- [ ] Feedback inicial de usuarios procesado
- [ ] Lessons learned documentados
- [ ] Proximos features priorizados

---

## Sprint 6 - Resumen

| Dia | Enfoque | Horas |
|---|---|---|
| 1-3 | Testing Completo | 27 |
| 4-5 | Seguridad | 22 |
| 6-7 | Performance + Produccion | 21 |
| 8-9 | Capacitacion | 13 |
| 10 | Cierre | 9 |
| **Total** | | **92 hrs** |

### Criterios de Aceptacion Sprint 6 (GO-LIVE):
- [ ] 0 bugs criticos en produccion
- [ ] 0 bugs altos en produccion
- [ ] Todos los tests E2E passing
- [ ] OWASP ZAP scan sin criticos
- [ ] Pentesting completado sin vulnerabilidades criticas
- [ ] Load testing: 100 usuarios sin degradacion
- [ ] Uptime > 99.5% en primera semana
- [ ] SSL funcionando correctamente
- [ ] Backup automatico ejecutandose
- [ ] Monitoreo y alertas activos
- [ ] 100% de usuarios capacitados
- [ ] FAQ y manual de usuario actualizados
- [ ] Post-mortem de lanzamiento completado

---

# RESUMEN GENERAL

## Horas por Sprint

| Sprint | Horas | Enfoque Principal |
|---|---|---|
| Sprint 0 | 112 hrs | Fundamentos, infraestructura |
| Sprint 1 | 106 hrs | Auth + Maquinas base |
| Sprint 2 | 96 hrs | Maquinas completo + Usuarios |
| Sprint 3 | 102 hrs | Mantenimientos + Alertas |
| Sprint 4 | 90 hrs | Reportes + Dashboard |
| Sprint 5 | 102 hrs | Auditoria + UX + Responsive |
| Sprint 6 | 92 hrs | Testing + Seguridad + Launch |
| **Total** | **700 hrs** | **14 semanas** |

## Equipo y分配 de Horas

| Rol | Personas | Horas/Sprint | Total Proyecto |
|---|---|---|---|
| Tech Lead | 1 | 15-20 hrs | ~120 hrs |
| Backend Dev | 2 | 30-35 hrs | ~240 hrs |
| Frontend Dev | 1 | 25-30 hrs | ~200 hrs |
| DevOps | 1 | 10-15 hrs | ~80 hrs |
| QA | 1 | 10-15 hrs | ~80 hrs |
| PO (parcial) | 1 | 5-10 hrs | ~60 hrs |

## Criterios de Finalizacion Global

El proyecto se considera COMPLETADO cuando:

1. [ ] Todas las historias de usuario completadas
2. [ ] 0 bugs criticos/altos abiertos
3. [ ] Tests automatizados > 80% coverage
4. [ ] Pentesting completado sin vulnerabilidades criticas
5. [ ] Load testing: 100 usuarios sin degradacion
6. [ ] Produccion desplegada y estable
7. [ ] Usuarios capacitados
8. [ ] Documentacion completa
9. [ ] Monitoreo activo
10. [ ] Backups verificados

---

*Sprint Planning Detallado v1.0 - 26/08/2026*
