# Documento de Seguridad Empresarial

## MantenimientoPlus

**Version:** 1.0 | **Fecha:** 26 de Agosto de 2026
**Responsable:** Security Engineer

---

## 1. Autenticacion

### 1.1 JWT (JSON Web Tokens)

**Access Token:**
- Algoritmo: RS256 (asymmetric) o HS256 (symmetric con secret largo)
- Expiracion: 15 minutos
- Payload: user_id, role, permissions, iat, exp, iss
- Almacenamiento: memoria (variable de JS, no localStorage)
- Renovacion automatica via refresh token

**Refresh Token:**
- Expiracion: 7 dias
- Almacenamiento: HTTP-only cookie + registro en BD (hash)
- Un solo refresh token activo por usuario (ultimo login gana)
- Invalidacion explicita en logout
- Rotacion: nuevo refresh token en cada renovacion

**Flujo de Renovacion:**
1. Access token expira -> frontend detecta HTTP 401
2. Frontend envia refresh token a /api/v1/auth/refresh
3. Backend valida refresh token (hash match, no expirado, no revocado)
4. Backend genera nuevo access token + nuevo refresh token
5. Backend revoca el refresh token anterior
6. Frontend re-intenta la peticion original

### 1.2 Password Hashing

- Algoritmo: bcrypt
- Rounds: 12 (equilibrio entre seguridad y performance)
- Salt: generado automaticamente por bcrypt
- Almacenamiento: solo el hash en la BD
- Requisitos de contrasena:
  - Minimo 8 caracteres
  - Al menos 1 mayuscula, 1 minuscula, 1 numero
  - Sin las 100 contrasenas mas comunes (listas de HaveIBeenPwned)

### 1.3 Bloqueo de Cuenta

| Intentos | Accion |
|---|---|
| 1-4 | Permite reintento |
| 5 | Bloqueo por 30 minutos |
| Admin | Puede desbloquear manualmente |
| Reset password | Resetea contador |

### 1.4 MFA (Multi-Factor Authentication)

**Fase 2 del proyecto.** Planificacion:
- TOTP (Google Authenticator, Authy)
- Codigo via email como fallback
- Recovery codes (8 codigos de un solo uso)

---

## 2. Autorizacion - RBAC

### 2.1 Definicion de Roles

**Administrador:**
- Todos los permisos del sistema
- Gestion de usuarios y roles
- Configuracion del sistema
- Ver auditoria completa

**Supervisor:**
- CRUD de maquinas
- CRUD de mantenimientos
- Ver todos los reportes
- Gestionar alertas

**Tecnico:**
- Crear y leer mantenimientos asignados
- Ver historial de maquinas
- Ver reportes limitados
- Ver dashboard basico

**Consulta (Viewer):**
- Solo lectura en todo
- Ver reportes autorizados
- Ver dashboard basico

### 2.2 Matriz de Permisos Detallada

| Recurso | Admin | Supervisor | Tecnico | Viewer |
|---|---|---|---|---|
| GET /users | R | - | - | - |
| POST /users | C | - | - | - |
| PUT /users/:id | U | - | - | - |
| DELETE /users/:id | D | - | - | - |
| GET /machines | R | R | R | R |
| POST /machines | C | C | - | - |
| PUT /machines/:id | U | U | - | - |
| DELETE /machines/:id | D | - | - | - |
| GET /maintenances | R | R | R(self) | R |
| POST /maintenances | C | C | C | - |
| PUT /maintenances/:id | U | U | U(self) | - |
| GET /reports/* | R | R | R(limit) | R(limit) |
| GET /audit | R | - | - | - |
| GET /config | R | - | - | - |
| PUT /config | U | - | - | - |
| GET /alerts | R | R | R | R |
| PUT /alerts/:id/read | U | U | U | - |

### 2.3 Implementacion

```javascript
// Middleware de autorizacion
function requireRole(...roles) {
  return (req, res, next) => {
    const userRole = req.user.role;
    if (!roles.includes(userRole)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}

// Uso en rutas
router.get('/users', requireRole('admin'), userController.list);
router.post('/machines', requireRole('admin', 'supervisor'), machineController.create);
```

---

## 3. Mitigacion OWASP Top 10

### 3.1 A01: Broken Access Control

**Mitigaciones:**
- RBAC en backend para cada endpoint (middleware)
- RBAC en frontend (menu, rutas, componentes)
- Validacion de ownership: usuario solo ve/edita sus datos (excepto admin)
- Rate limiting en endpoints sensibles
- CORS restrictivo: solo origenes permitidos

### 3.2 A02: Cryptographic Failures

**Mitigaciones:**
- Contrasenas: bcrypt con 12 rounds
- Datos en transito: TLS 1.2+ obligatorio
- Datos en reposo: cifrado de backup, datos sensibles en BD
- Sin datos sensibles en logs (no logear passwords, tokens)
- JWT con algoritmo fuerte (RS256 o HS256 con secreto de 256+ bits)

### 3.3 A03: Injection

**Mitigaciones:**
- SQL Injection: ORM (Prisma) con parameterized queries
- NoSQL Injection: no aplica (PostgreSQL)
- XSS: React auto-escaping + CSP headers + sanitizacion de inputs
- Command Injection: no se ejecutan comandos del sistema
- LDAP Injection: no aplica

### 3.4 A04: Insecure Design

**Mitigaciones:**
- Threat modeling en fase de diseno
- Principio de menor privilegio
- Validacion de inputs en multiple capas
- Rate limiting general y por endpoint
- Separacion de ambientes (dev, test, prod)

### 3.5 A05: Security Misconfiguration

**Mitigaciones:**
- Headers de seguridad via Helmet.js:
  - Content-Security-Policy
  - X-Content-Type-Options: nosniff
  - X-Frame-Options: DENY
  - Strict-Transport-Security (max-age=31536000)
  - X-XSS-Protection: 1; mode=block
  - Referrer-Policy: strict-origin-when-cross-origin
- CORS: whitelist de origenes
- Deshabilitar directorio listing
- Cambiar puertos por defecto
- Error messages genericas (sin stack traces en prod)

### 3.6 A06: Vulnerable and Outdated Components

**Mitigaciones:**
- Dependabot (GitHub) para alertas de dependencias
- npm audit en CI/CD (build falla si hay vulnerabilidades criticas)
- Actualizaciones mensuales de dependencias
- Lock file (package-lock.json) para reproducibilidad

### 3.7 A07: Identification and Authentication Failures

**Mitigaciones:**
- Rate limiting en /auth/login (5/min por IP)
- Bloqueo de cuenta tras 5 intentos
- Password policy (8+ chars, mayuscula, numero)
- No revelar si un email existe (mensaje generico)
- Sesiones invalidadas en logout
- Timeout de sesion (30 min)
- Refresh token rotation

### 3.8 A08: Software and Data Integrity Failures

**Mitigaciones:**
- JWT signature validation en cada request
- CSP para prevenir XSS via scripts externos
- Subresource Integrity (SRI) para CDN resources
- CI/CD con branch protection y code review obligatorio
- Commits firmados (opcional)

### 3.9 A09: Security Logging and Monitoring Failures

**Mitigaciones:**
- Audit trail completo (login, CRUD, export)
- Logs estructurados (JSON) con correlacion
- Alertas de monitoreo: login fallidos anormales, errores 5xx
- Retencion de logs: 2 anos minimo
- Revision semanal de logs de seguridad

### 3.10 A10: Server-Side Request Forgery (SSRF)

**Mitigaciones:**
- No se hacen requests a URLs del usuario
- Si en futuro se permite URL (ej: logo), usar allowlist de dominios
- Deshabilitar redireccionamiento en respuestas
- Validar Content-Type de respuestas

---

## 4. Auditoria

### 4.1 Eventos Registrados

| Evento | Datos Capturados |
|---|---|
| Login exitoso | user_id, email, ip, user_agent, timestamp |
| Login fallido | email intentado, ip, razon, timestamp |
| Logout | user_id, ip, timestamp |
| Crear registro | user_id, entity, entity_id, new_values, ip, timestamp |
| Editar registro | user_id, entity, entity_id, old_values, new_values, ip, timestamp |
| Eliminar registro | user_id, entity, entity_id, old_values, ip, timestamp |
| Exportar datos | user_id, entity, filters, format, ip, timestamp |
| Cambio de rol | user_id, target_user, old_role, new_role, ip, timestamp |
| Bloqueo de cuenta | user_id/email, ip, reason, timestamp |
| Desbloqueo | admin_id, target_user, ip, timestamp |

### 4.2 Propiedades de Auditoria

- **Inmutabilidad:** Tabla append-only. Sin UPDATE/DELETE desde la aplicacion.
- **Integridad:** Cada registro tiene timestamp, usuario, IP.
- **Disponibilidad:** Consultable por administradores con filtros.
- **Retencion:** Minimo 2 anos. Archivado automatico despues de 1 ano.
- **Rendimiento:** Indices en user_id, entity, created_at.

### 4.3 Politicas de Auditoria

1. Todos los eventos de seguridad se registran sin excepcion
2. Los registros no pueden ser modificados ni eliminados
3. Los administradores pueden consultar pero no modificar
4. Los logs se almacenan en la misma BD que los datos de negocio
5. Backup de logs se realiza junto con backup de BD

---

## 5. Headers de Seguridad HTTP

```
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; form-action 'self'
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

---

## 6. Rate Limiting

| Endpoint | Limite | Ventana | Accion |
|---|---|---|---|
| POST /auth/login | 5 | 1 minuto | Bloquear IP 15 min |
| POST /auth/refresh | 10 | 1 minuto | Bloquear usuario |
| API general | 100 | 1 minuto | HTTP 429 |
| Exportar reportes | 5 | 1 minuto | HTTP 429 |
| Health check | 30 | 1 minuto | Sin limitar |

**Implementacion:** express-rate-limit con Redis store para multi-instancia.

---

## 7. Validacion de Entradas

### 7.1 Estrategia

- **Backend:** Joi o Zod para validacion de schema
- **Frontend:** Validacion en formulario (UX) + validacion en backend (seguridad)
- **Principio:** Nunca confiar en la validacion del frontend

### 7.2 Reglas de Validacion

| Campo | Regla |
|---|---|
| email | Formato email valido, max 255 chars |
| password | Min 8, max 128, regex de complejidad |
| full_name | Min 2, max 200, solo letras y espacios |
| internal_code | Max 50, alfanumerico, unico |
| name | Max 200, no vacio |
| year | Integer, 1900-2030 |
| current_hours | Decimal >= 0 |
| description | Max 2000 chars, sanitizado |
| observations | Max 5000 chars, sanitizado |

### 7.3 Sanitizacion

- Escapar HTML en todos los campos de texto
- Trim de espacios en blanco
- Normalizacion de email (lowercase)
- Remocion de caracteres de control

---

## 8. Plan de Respuesta a Incidentes

### 8.1 Clasificacion de Incidentes

| Nivel | Descripcion | Ejemplo | Tiempo Respuesta |
|---|---|---|---|
| P1 - Critico | Riesgo de datos o servicio caido | Data breach, downtime total | 1 hora |
| P2 - Alto | Vulnerabilidad activa | XSS explotado, account takeover | 4 horas |
| P3 - Medio | Vulnerabilidad potencial | Dependencia con CVE | 24 horas |
| P4 - Bajo | Mejora de seguridad | Headers faltantes | proximo sprint |

### 8.2 Proceso de Respuesta

1. **Detectar:** Monitoreo automatico o reporte manual
2. **Contener:** Rotar credenciales, bloquear IPs, deshabilitar endpoint
3. **Erradicar:** Patch de seguridad, actualizacion de dependencias
4. **Recuperar:** Restaurar servicio, verificar integridad
5. **Leccion:** Post-mortem, actualizacion de politicas

---

*Documento de Seguridad v1.0 - 26/08/2026*
