# Documentacion Tecnica

## MantenimientoPlus

**Version:** 1.0 | **Fecha:** 26 de Agosto de 2026

---

## 1. Stack Tecnologico

| Capa | Tecnologia | Version |
|---|---|---|
| Frontend | React + TypeScript | 18.x |
| UI Components | shadcn/ui + Tailwind CSS | 3.x |
| Backend | Node.js + Express/Fastify | 20 LTS |
| ORM | Prisma | 5.x |
| Base de Datos | PostgreSQL | 15 |
| Cache | Redis | 7 |
| Auth | JWT (bcrypt 12 rounds) | - |
| Container | Docker + Docker Compose | - |
| CI/CD | GitHub Actions | - |
| Monitoring | Prometheus + Grafana | - |
| Error Tracking | Sentry | - |

---

## 2. Estructura del Proyecto

```
mantenimientoplus/
├── backend/
│   ├── src/
│   │   ├── app.ts
│   │   ├── server.ts
│   │   ├── config/
│   │   │   ├── database.ts
│   │   │   ├── redis.ts
│   │   │   ├── env.ts
│   │   │   └── cors.ts
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── auth.routes.ts
│   │   │   │   ├── auth.middleware.ts
│   │   │   │   └── auth.validation.ts
│   │   │   ├── users/
│   │   │   ├── machines/
│   │   │   ├── maintenances/
│   │   │   ├── alerts/
│   │   │   ├── reports/
│   │   │   ├── audit/
│   │   │   └── config/
│   │   ├── shared/
│   │   │   ├── middleware/
│   │   │   ├── utils/
│   │   │   ├── errors/
│   │   │   └── types/
│   │   └── prisma/
│   │       ├── schema.prisma
│   │       └── migrations/
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/           # shadcn components
│   │   │   ├── layout/
│   │   │   ├── auth/
│   │   │   ├── machines/
│   │   │   ├── maintenances/
│   │   │   ├── reports/
│   │   │   └── dashboard/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── stores/           # Zustand state
│   │   ├── types/
│   │   └── utils/
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
├── docker-compose.prod.yml
├── nginx/
└── docs/
```

---

## 3. Arquitectura Backend

### 3.1 Patron Capas
```
Controller -> Service -> Repository -> Prisma -> PostgreSQL
    ↓
Middleware (auth, validation, error handling)
```

### 3.2 Middleware Chain
1. CORS
2. Helmet (security headers)
3. Rate Limiter
4. Body Parser
5. Request Logger
6. Auth (JWT verification)
7. RBAC (permission check)
8. Validation (Zod schemas)
9. Controller
10. Error Handler

### 3.3 Manejo de Errores
```typescript
// Clase AppError personalizada
class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code: string,
    public isOperational: boolean = true
  ) {
    super(message);
  }
}

// Errores tipados
// HTTP 400 - ValidationError
// HTTP 401 - UnauthorizedError
// HTTP 403 - ForbiddenError
// HTTP 404 - NotFoundError
// HTTP 409 - ConflictError
// HTTP 429 - RateLimitError
// HTTP 500 - InternalServerError
```

---

## 4. Modelo de Base de Datos

### 4.1 Entidades Principales

| Entidad | Descripcion | Registros Estimados |
|---|---|---|
| users | Usuarios del sistema | 50-200 |
| machines | Maquinaria registrada | 100-500 |
| maintenances | Servicios realizados | 1000-5000/anio |
| maintenance_items | Repuestos por mantenimiento | 3000-15000/anio |
| maintenance_types | Catalogo de tipos | 20-50 |
| machine_types | Catalogo de tipos | 20-50 |
| alerts | Alertas generadas | 500-2000/anio |
| notifications | Notificaciones in-app | 1000-5000/anio |
| audit_logs | Registro de auditoria | 10000-50000/anio |
| system_config | Configuracion del sistema | 20-50 |

### 4.2 Indices Clave

```sql
-- Maquinas
CREATE INDEX idx_machines_code ON machines(code);
CREATE INDEX idx_machines_status ON machines(status);
CREATE INDEX idx_machines_machine_type_id ON machines(machine_type_id);

-- Mantenimientos
CREATE INDEX idx_maintenances_machine_id ON maintenances(machine_id);
CREATE INDEX idx_maintenances_status ON maintenances(status);
CREATE INDEX idx_maintenances_scheduled_date ON maintenances(scheduled_date);
CREATE INDEX idx_maintenances_next_maintenance_date ON maintenances(next_maintenance_date);

-- Auditoria
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- Alertas
CREATE INDEX idx_alerts_machine_id ON alerts(machine_id);
CREATE INDEX idx_alerts_is_read ON alerts(is_read);
CREATE INDEX idx_alerts_type ON alerts(type);
```

---

## 5. API Endpoints Resumen

| Modulo | Method | Endpoint | Auth | Rol |
|---|---|---|---|---|
| Auth | POST | /api/v1/auth/login | No | - |
| Auth | POST | /api/v1/auth/refresh | Si | All |
| Auth | POST | /api/v1/auth/logout | Si | All |
| Auth | POST | /api/v1/auth/change-password | Si | All |
| Users | GET | /api/v1/users | Si | Admin |
| Users | POST | /api/v1/users | Si | Admin |
| Users | PUT | /api/v1/users/:id | Si | Admin |
| Users | DELETE | /api/v1/users/:id | Si | Admin |
| Machines | GET | /api/v1/machines | Si | All |
| Machines | POST | /api/v1/machines | Si | Admin,Super |
| Machines | PUT | /api/v1/machines/:id | Si | Admin,Super |
| Machines | DELETE | /api/v1/machines/:id | Si | Admin |
| Maintenances | GET | /api/v1/maintenances | Si | All |
| Maintenances | POST | /api/v1/maintenances | Si | Admin,Super,Tech |
| Maintenances | PUT | /api/v1/maintenances/:id | Si | Admin,Super,Tech |
| Alerts | GET | /api/v1/alerts | Si | All |
| Alerts | PATCH | /api/v1/alerts/:id/read | Si | All |
| Reports | GET | /api/v1/reports/:type | Si | All |
| Audit | GET | /api/v1/audit | Si | Admin |
| Config | GET | /api/v1/config | Si | Admin |
| Config | PUT | /api/v1/config | Si | Admin |

---

## 6. Seguridad

### 6.1 Headers HTTP (Helmet)
- Content-Security-Policy
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
- Strict-Transport-Security: max-age=31536000
- Referrer-Policy: strict-origin-when-cross-origin

### 6.2 Rate Limiting
- General API: 100 requests/min per IP
- Login: 10 requests/min per IP
- Password reset: 3 requests/hour per email

### 6.3 Auditoria Inmutable
- Cada operacion CRUD crea un registro en audit_logs
- Los registros no se pueden editar ni eliminar
- Almacena: user_id, action, entity_type, entity_id, old_values, new_values, ip_address

---

*Documentacion Tecnica v1.0*
