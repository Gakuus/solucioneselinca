# Auditoría de Seguridad OWASP Top 10

## SOLUCIONES EL INCA — Sistema de Gestión de Mantenimiento

**Versión:** 1.0 | **Fecha:** 27 de Agosto de 2026
**Responsable:** Security Engineer
**Alcance:** Backend (Node + Express + Prisma + PostgreSQL + Redis) y Frontend (React + Vite)

---

## 1. Resumen Ejecutivo

Se realizó una auditoría de seguridad del sistema basada en el **OWASP Top 10 (2021)**, tanto en el backend (API REST) como en el frontend (SPA React). Se identificaron **8 hallazgos**: 1 de severidad **Crítica (C1)**, 2 **Altos (H1–H2, H5)**, y hallazgos **Medios/Bajos (M5, L1, L4, H3)**. Todos fueron corregidos, verificados con chequeos de TypeScript y desplegados.

| Hallazgo | Severidad | Estado |
|---|---|---|
| C1 — Privilegio de escalada vía `role` en registro | Crítica | ✅ Corregido |
| H1 — Ausencia de rate limiting en autenticación | Alta | ✅ Corregido |
| H2 — Sin bloqueo de cuenta por fuerza bruta | Alta | ✅ Corregido |
| H5 — Secretos JWT débilmente predeterminados | Alta | ✅ Corregido |
| HIGH — Exfiltración de tokens en exportación CSV | Alta | ✅ Corregido |
| H3 — Control de acceso insuficiente en alertas | Media | ✅ Corregido |
| M5 — Parámetros de URL sin validación | Media | ✅ Corregido |
| L1 — Múltiples instancias de PrismaClient | Baja | ✅ Corregido |
| L4 — Registro de auditoría incompleto | Baja | ✅ Corregido |

---

## 2. Metodología

La auditoría siguió el **OWASP Testing Guide** con énfasis en el **OWASP Top 10 (2021)**:

1. **Revisión de código** de cada módulo (auth, users, machines, maintenances, alerts, catalogs, scheduling, reports, audit).
2. **Análisis de arquitectura** de autenticación/sesión (JWT, refresh tokens, cookies).
3. **Verificación de controles** de autorización (RBAC), validación de entradas y logging.
4. **Corrección** de hallazgos priorizados por severidad.
5. **Verificación** con `tsc --noEmit` (backend y frontend) antes del despliegue.

---

## 3. Hallazgos y Correcciones

### 3.1 C1 — Escalada de Privilegios vía `role` en Registro (Crítica)

**Categoría OWASP:** A01 — Broken Access Control

**Descripción:**
El schema de registro (`registerSchema`) aceptaba el campo `role` del request. Un atacante podía enviar `role: "ADMIN"` al registrarse y obtener una cuenta con privilegios administrativos sin autorización, comprometiendo por completo el sistema.

**Corrección:**
- Se eliminó `role` del `registerSchema` (`auth.validation.ts`).
- El método `register()` de `auth.service.ts` siempre asigna `role: 'VIEWER'` independientemente del payload.
- El `role` solo puede ser asignado por un administrador mediante `PUT /users/:id`.

**Archivos modificados:**
- `backend/src/modules/auth/auth.validation.ts`
- `backend/src/modules/auth/auth.service.ts`

---

### 3.2 H1 — Ausencia de Rate Limiting en Autenticación (Alta)

**Categoría OWASP:** A07 — Identification and Authentication Failures

**Descripción:**
Los endpoints públicos de autenticación (`/auth/login`, `/auth/register`, `/auth/refresh-token`) no tenían limitación de velocidad, permitiendo ataques de fuerza bruta de contraseña y relleno de credenciales (credential stuffing) a escala.

**Corrección:**
- Se creó `authRateLimiter` con límite de **10 peticiones / ventana de 60 segundos** por IP.
- Se montó en las rutas pública de login, register y refresh-token (`auth.routes.ts`).

**Archivos modificados:**
- `backend/src/modules/auth/auth.routes.ts`

---

### 3.3 H2 — Ausencia de Bloqueo de Cuenta (Alta)

**Categoría OWASP:** A07 — Identification and Authentication Failures

**Descripción:**
No existía mecanismo de bloqueo de cuenta por intentos fallidos. Un atacante podía intentar contraseñas ilimitadamente contra una cuenta específica sin consecuencias.

**Corrección:**
- Se implementó contador de intentos fallidos con clave Redis `fail:{userId}` (ventana de 15 minutos).
- Tras **5 intentos fallidos** se crea la clave `lock:{userId}` por **15 minutos**, bloqueando el login.
- Un login exitoso limpia ambas claves.
- Las cuentas bloqueadas reciben mensaje de error con tiempo restante de bloqueo (basado en el TTL).

**Archivos modificados:**
- `backend/src/modules/auth/auth.service.ts`

---

### 3.4 H5 — Secretos JWT Débilmente Configurados (Alta)

**Categoría OWASP:** A02 — Cryptographic Failures

**Descripción:**
Los secretos de firma JWT (`JWT_SECRET`, `JWT_REFRESH_SECRET`) usaban valores predeterminados débiles/predecibles. Si se mantuvieran en producción, un atacante podría forjar access/refresh tokens y autenticarse como cualquier usuario.

**Corrección:**
- Se rotaron `JWT_SECRET` y `JWT_REFRESH_SECRET` en `backend/.env` a valores aleatorios de alta entropía generados con `openssl rand -base64 48`.
- El archivo `.env` está cubierto por `.gitignore` (no se sube al repositorio).

**Archivos modificados:**
- `backend/.env` (gitignored)

---

### 3.5 HIGH — Exfiltración de Tokens en Exportación CSV (Alta)

**Categoría OWASP:** A02 Cryptographic Failures / A07 Identification Failures

**Descripción:**
Los servicios de exportación CSV de frontend (`machines.ts`, `reports.ts`) leían el token desde `localStorage` usando `localStorage.getItem('auth-storage')`. Esto era frágil y, en caso de persistir tokens en storage, los expondría a scripts XSS.

**Corrección:**
- Se centralizó el acceso al token mediante `api.getAccessToken()`, que lee el access token **en memoria** (nunca persistido en localStorage).
- Se eliminaron las lecturas directas de `localStorage` en las exportaciones.

**Archivos modificados:**
- `frontend/src/services/machines.ts`
- `frontend/src/services/reports.ts`
- `frontend/src/services/api.ts`

---

### 3.6 H3 — Control de Acceso Insuficiente en Alertas (Media)

**Categoría OWASP:** A01 — Broken Access Control

**Descripción:**
Las rutas de lectura de alertas (stats, listado, detalle) no verificaban el rol del usuario. Cualquier usuario autenticado, incluidos los de rol VIEWER, podía acceder a estadísticas y detalle de alertas sin autorización. Las rutas `/:id` y `/:id/read` además tenían parámetros sin validar.

**Corrección:**
- Las rutas GET de alertas (`/stats`, `/`, `/:id`) ahora exigen rol `ADMIN`/`SUPERVISOR`/`TECHNICIAN`.
- Se agregó `idParamSchema` (UUID) a las rutas `/:id` y `/:id/read`.

**Archivos modificados:**
- `backend/src/modules/alerts/alerts.routes.ts`

---

### 3.7 M5 — Parámetros de URL sin Validación (Media)

**Categoría OWASP:** A01 — Broken Access Control / A04 Insecure Design

**Descripción:**
Muchas rutas con parámetros de ruta `:id` (users, catalogs, audit, scheduling, maintenances, alerts) no validaban que el valor fuera un UUID. Esto podía permitir solicitudes malformadas, abuso de endpoints y comportamiento inconsistente.

**Corrección:**
- Se creó `paramSchemas.ts` con:
  - `idParamSchema` → valida `id` como UUID.
  - `idAndItemIdParamSchema` → valida `id` y `itemId` como UUID.
- Se aplicó `validate({ params: idParamSchema })` a todas las rutas `/:id` y `/:id/...` de los módulos: users, catalogs, audit, scheduling, machines, maintenances, alerts.

**Archivos modificados:**
- `backend/src/shared/middleware/paramSchemas.ts` (nuevo)
- `backend/src/modules/users/users.routes.ts`
- `backend/src/modules/catalogs/catalogs.routes.ts`
- `backend/src/modules/audit/audit.routes.ts`
- `backend/src/modules/scheduling/scheduling.routes.ts`
- `backend/src/modules/machines/machines.routes.ts`
- `backend/src/modules/maintenances/maintenances.routes.ts`
- `backend/src/modules/alerts/alerts.routes.ts`

---

### 3.8 L1 — Múltiples Instancias de PrismaClient (Baja)

**Categoría OWASP:** A09 — Security Logging and Monitoring Failures

**Descripción:**
`audit.service.ts` creaba su propio `new PrismaClient()` independiente del singleton compartido de la aplicación. Esto generaba conexiones duplicadas a la base de datos (agotamiento de conexiones en alta carga) y configuración inconsistente.

**Corrección:**
- Se reemplazó por el singleton compartido `prisma` importado desde `config/database`.

**Archivos modificados:**
- `backend/src/modules/audit/audit.service.ts`

---

### 3.9 L4 — Registro de Auditoría Incompleto (Baja)

**Categoría OWASP:** A09 — Security Logging and Monitoring Failures

**Descripción:**
Los módulos de catálogos (tipos de máquina/mantenimiento) y scheduling (programaciones) no registraban eventos de auditoría en sus operaciones de escritura, dejando huecos en el trail de auditoría para cumplimiento e investigación forense.

**Corrección:**
- Se agregó `auditService.log()` a las operaciones CREATE/UPDATE/DELETE de:
  - Catálogos: tipos de máquina y tipos de mantenimiento.
  - Scheduling: crear, editar, eliminar, toggle de activación y ejecución.

**Archivos modificados:**
- `backend/src/modules/catalogs/catalogs.controller.ts`
- `backend/src/modules/scheduling/scheduling.controller.ts`

---

## 4. Controles Defensivos Implementados (Estado Actual)

### 4.1 Autenticación y Sesión

| Control | Implementación |
|---|---|
| Hashing de contraseñas | bcrypt, 12 rounds |
| Access token JWT | 15 min, almacenado en memoria (JS), no persistido |
| Refresh token | 7 días, httpOnly cookie + Redis `refresh:{userId}` |
| Rotación de refresh | Nuevo token por renovación, revocación del anterior |
| Renovación | Refresh proactivo 60s antes de expirar + interceptor 401 con cola |
| Bloqueo de cuenta | 5 intentos fallidos → bloqueo 15 min (Redis `fail:`/`lock:`) |
| Rate limiting auth | 10 req/60s en login/register/refresh |
| Secretos JWT | Alta entropía (openssl rand -base64 48), gitignored |

### 4.2 Autorización (RBAC)

| Rol | Permisos |
|---|---|
| ADMIN | Acceso total, gestión de usuarios/roles, auditoría |
| SUPERVISOR | CRUD máquinas/mantenimientos, reportes, alertas |
| TECHNICIAN | Crear/leer mantenimientos asignados, reportes limitados |
| VIEWER | Solo lectura autorizada |

- Middleware `authorize(...roles)` en cada ruta.
- Autoregistro siempre crea cuentas VIEWER (sin escalación).
- El export de máquinas/reportes restringido a ADMIN/SUPERVISOR.

### 4.3 Validación de Entradas

- **Backend:** Zod para schemas de body, query y params (UUID).
- **Frontend:** Validación de formularios (UX) + validación en backend (seguridad).
- Principio: nunca confiar en la validación del frontend.
- Parámetros de ruta (`:id`) validados como UUID en todos los módulos.

### 4.4 Registro de Auditoría

Tabla `AuditLog` append-only (sin UPDATE/DELETE) con:
- user_id, action (CREATE/UPDATE/DELETE/LOGIN...), entity_type, entity_id.
- old_values / new_values, ip_address, user_agent, timestamp.
- Registra operaciones de: auth, users, machines, maintenances, alerts, catálogos y scheduling, reportes.

---

## 5. Mapa OWASP Top 10 → Estado

| ID | Categoría | Estado |
|---|---|---|
| A01 | Broken Access Control | ✅ Corregido (RBAC completo, validación de params, autoregistro sin escalación) |
| A02 | Cryptographic Failures | ✅ Corregido (secretos rotados, tokens en memoria, bcrypt 12 rounds, TLS) |
| A03 | Injection | ✅ Mitigado (ORM Prisma parameterized, React auto-escaping, sanitización) |
| A04 | Insecure Design | ✅ Mitigado (validación multicapa, menor privilegio, rate limiting) |
| A05 | Security Misconfiguration | ✅ Mitigado (Helmet headers, CORS restrictivo, errores genéricos) |
| A06 | Vulnerable and Outdated Components | ⚠️ En proceso (Dependabot/npm audit en CI, actualizaciones) |
| A07 | Identification and Auth Failures | ✅ Corregido (rate limiting, bloqueo de cuenta, política de contraseña) |
| A08 | Software and Data Integrity Failures | ✅ Mitigado (JWT signature, CSP, branch protection) |
| A09 | Security Logging and Monitoring Failures | ✅ Corregido (audit trail completo, singleton Prisma) |
| A10 | SSRF | ✅ Mitigado (sin requests a URLs de usuario; allowlist si aplica a futuro) |

---

## 6. Recomendaciones y Deuda Técnica Pendiente

Para llevar al sistema al máximo nivel de seguridad, se recomienda (fuera del alcance de esta auditoría):

1. **A06 — Gestión continua de dependencias:**
   - Activar **Dependabot** en GitHub para alertas automáticas de CVEs.
   - Ejecutar `npm audit` en CI/CD y fallar el build ante vulnerabilidades críticas.
   - Plan de actualización mensual de dependencias con verificación de regresiones.

2. **MFA (Autenticación de múltiples factores):**
   - Fase 2 planeada: TOTP (Google Authenticator/Authy), códigos de respaldo por email y códigos de recuperación (8 de un solo uso).

3. **Headers e infraestructura en producción:**
   - Asegurar TLS 1.2+ obligatorio, HSTS, y cabeceras CSP completas en el servidor de producción (más allá del entorno de desarrollo).
   - Monitoreo de seguridad (WAF, detección de anomalías en login fallidos).

4. **Pruebas periódicas:**
   - Repetir la auditoría OWASP y ejecutar `zap`/`nikto`/`nuclei` contra un entorno de pruebas.
   - Realizar pentest manual en endpoints críticos antes de producción.

5. **Policy de contraseñas reforzada:**
   - Validar contra listas de contraseñas comunes (HaveIBeenPwned).
   - Exigir complejidad adicional (mayúscula, minúscula, número, símbolo).

---

*Documento de Auditoría de Seguridad OWASP v1.0 — 27/08/2026*
