# Requisitos No Funcionales

## MantenimientoPlus

**Version:** 1.0 | **Fecha:** 26 de Agosto de 2026

---

## 1. Seguridad

### RNF-001: Cifrado de Contrasenas
- **Prioridad:** Critica
- **Descripcion:** Todas las contrasenas deben cifrarse con bcrypt (minimo 12 rounds)
- **Criterios de validacion:** Ninguna contrasena en texto plano en base de datos, logs o respuestas HTTP

### RNF-002: Comunicacion Segura (HTTPS)
- **Prioridad:** Critica
- **Descripcion:** Todas las comunicaciones deben usar TLS 1.2 o superior
- **Criterios de validacion:** Certificado SSL valido, HSTS habilitado, HTTP redirige a HTTPS

### RNF-003: Mitigacion OWASP Top 10
- **Prioridad:** Critica
- **Descripcion:** El sistema debe mitigar los 10 vectores OWASP Top 10
- **Vectores y mitigaciones:**
  - A01 Broken Access Control: RBAC en backend + frontend
  - A02 Cryptographic Failures: bcrypt, TLS, cifrado en reposo
  - A03 Injection: Prepared statements, input validation, ORM
  - A04 Insecure Design: Threat modeling, security by design
  - A05 Security Misconfiguration: Headers de seguridad, CORS restrictivo
  - A06 Vulnerable Components: Dependabot, actualizaciones regulares
  - A07 Auth Failures: Rate limiting, MFA (fase 2), account lockout
  - A08 Data Integrity Failures: JWT signature validation, CSP
  - A09 Logging Failures: Audit trail completo, logging estructurado
  - A10 SSRF: Validacion de URLs, allowlist de dominios

### RNF-004: Rate Limiting
- **Prioridad:** Critica
- **Descripcion:** Limitar peticiones para prevenir ataques de fuerza bruta y DDoS
- **Criterios:**
  - Login: 5 intentos por minuto por IP
  - API general: 100 peticiones por minuto por usuario
  - Endpoints publicos: 30 peticiones por minuto por IP

### RNF-005: Headers de Seguridad
- **Prioridad:** Alta
- **Descripcion:** Implementar headers HTTP de seguridad
- **Headers requeridos:**
  - Content-Security-Policy (CSP)
  - X-Content-Type-Options: nosniff
  - X-Frame-Options: DENY
  - X-XSS-Protection: 1; mode=block
  - Strict-Transport-Security (HSTS) con max-age=31536000
  - Referrer-Policy: strict-origin-when-cross-origin
  - Permissions-Policy: camera=(), microphone=(), geolocation=()

### RNF-006: CORS Restringido
- **Prioridad:** Alta
- **Descripcion:** CORS debe permitir soloorigenes configurados
- **Criterios:** Lista blanca de origenes, methods y headers permitidos

### RNF-007: Sanitizacion de Entradas
- **Prioridad:** Critica
- **Descripcion:** Todas las entradas del usuario deben ser sanitizadas
- **Criterios:** Validacion de tipo, longitud, formato. Escapar HTML. Prevenir XSS stored

### RNF-008: Proteccion CSRF
- **Prioridad:** Alta
- **Descripcion:** Prevenir ataques Cross-Site Request Forgery
- **Criterios:** Tokens CSRF en formularios, SameSite cookies, Origin header validation

---

## 2. Rendimiento

### RNF-010: Tiempo de Respuesta API
- **Prioridad:** Alta
- **Descripcion:** La API debe responder en menos de 500ms (P95)
- **Criterios de validacion:** Monitoreo con APM, alertas si P95 > 500ms

### RNF-011: Tiempo de Carga de Pagina
- **Prioridad:** Alta
- **Descripcion:** La carga inicial no debe exceder 3 segundos en conexion 3G
- **Criterios:** Lighthouse score >= 90, First Contentful Paint < 1.5s

### RNF-012: Usuarios Concurrentes
- **Prioridad:** Alta
- **Descripcion:** Soportar minimo 100 usuarios concurrentes
- **Criterios:** Load testing con 100 usuarios simultaneos sin degradacion > 20%

### RNF-013: Rendimiento de Base de Datos
- **Prioridad:** Alta
- **Descripcion:** Consultas en menos de 100ms (P95)
- **Criterios:** Indices optimizados, EXPLAIN ANALYZE en queries criticas

### RNF-014: Optimizacion de Frontend
- **Prioridad:** Media
- **Descripcion:** Lazy loading, code splitting, compresion de assets
- **Criterios:** Bundle size < 500KB gzipped, imagenes optimizadas

### RNF-015: Caché
- **Prioridad:** Media
- **Descripcion:** Caché para datos de catalogos que cambian poco
- **Criterios:** Cache-Control headers, ETags, invalidation on update

---

## 3. Disponibilidad

### RNF-020: Uptime
- **Prioridad:** Alta
- **Descripcion:** 99.5% de uptime mensual
- **Criterios:** Maximo 3.6 horas de downtime no planificado por mes

### RNF-021: Health Checks
- **Prioridad:** Alta
- **Descripcion:** Endpoints de salud para monitoreo
- **Criterios:** /health retorna status de BD, servicios externos, uptime

### RNF-022: Tolerancia a Fallos
- **Prioridad:** Media
- **Descripcion:** Un fallo en un componente no critico no debe afectar la funcionalidad principal
- **Criterios:** Circuit breaker para servicios externos, fallback para datos no criticos

### RNF-023: Restart Automatico
- **Prioridad:** Alta
- **Descripcion:** El sistema debe reiniciarse automaticamente tras fallo
- **Criterios:** Docker restart policy: unless-stopped, max 3 restarts en 5 min

---

## 4. Escalabilidad

### RNF-030: Escalado Horizontal
- **Prioridad:** Alta
- **Descripcion:** Los servicios backend deben ser stateless para escalar horizontalmente
- **Criterios:** Sin sesion en memoria, tokens stateless, load balancer compatible

### RNF-031: Capacidad de Datos
- **Prioridad:** Media
- **Descripcion:** Manejar al menos 1 millon de registros de mantenimiento
- **Criterios:** Paginacion obligatoria, indices optimizados, partitioning si es necesario

### RNF-032: Crecimiento
- **Prioridad:** Alta
- **Descripcion:** Soportar crecimiento de 50 a 500 maquinas sin rediseño
- **Criterios:** Arquitectura modular, configuracion parametrica

---

## 5. Auditoria y Compliance

### RNF-040: Inmutabilidad de Auditoria
- **Prioridad:** Alta
- **Descripcion:** Los registros de auditoria no deben ser editables ni eliminables
- **Criterios:** Tabla sin permisos DELETE/UPDATE para la aplicacion, append-only

### RNF-041: Retencion de Logs
- **Prioridad:** Media
- **Descripcion:** Logs de auditoria retenidos minimo 2 anos
- **Criterios:** Archivado automatico, compresion, almacenamiento duradero

### RNF-042: Registro de IP
- **Prioridad:** Alta
- **Descripcion:** Capturar IP del usuario en cada accion
- **Criterios:** X-Forwarded-For en reverse proxy, IP real en headers

---

## 6. Backups y Recuperacion

### RNF-050: Backups Automaticos
- **Prioridad:** Critica
- **Descripcion:** Backups diarios automaticos de la base de datos
- **Criterios:** Cron job diario a las 2:00 AM UTC, notificacion de exito/fallo

### RNF-051: Almacenamiento Geografico
- **Prioridad:** Alta
- **Descripcion:** Backups en ubicacion geografica diferente al servidor principal
- **Criterios:** S3 cross-region o equivalente, encriptacion en reposo

### RNF-052: RTO y RPO
- **Prioridad:** Alta
- **Descripcion:** RTO < 4 horas, RPO < 24 horas
- **Criterios:** Restore documentado y probado, backup chain intacta

### RNF-053: Retencion de Backups
- **Prioridad:** Media
- **Descripcion:** Retener backups 30 dias
- **Criterios:** Lifecycle policy automatica, purga de backups antiguos

---

## 7. Observabilidad

### RNF-060: Logging Estructurado
- **Prioridad:** Alta
- **Descripcion:** Logs en formato JSON con campos estandarizados
- **Campos requeridos:** timestamp, level, message, service, trace_id, user_id, request_id

### RNF-061: Metricas de Aplicacion
- **Prioridad:** Alta
- **Descripcion:** Metricas de request rate, error rate, latencia
- **Criterios:** Prometheus o equivalente, dashboards en Grafana

### RNF-062: Alertas de Monitoreo
- **Prioridad:** Alta
- **Descripcion:** Alertas automaticas por problemas criticos
- **Alertas:** Uptime < 99.5%, error rate > 1%, P95 latency > 1s, disco > 85%, memoria > 85%

### RNF-063: Distributed Tracing
- **Prioridad:** Media
- **Descripcion:** Trazabilidad de requests entre servicios
- **Criterios:** Trace ID propagado en headers, correlacion de logs

---

## 8. Mantenibilidad

### RNF-070: Code Review
- **Prioridad:** Alta
- **Descripcion:** Todo codigo debe pasar code review antes de merge
- **Criterios:** Minimo 1 reviewer, checklist de seguridad, CI/CD pass

### RNF-071: Tests Automatizados
- **Prioridad:** Alta
- **Descripcion:** Cobertura minima del 80%
- **Criterios:** Unit tests, integration tests, E2E tests criticos

### RNF-072: Documentacion Tecnica
- **Prioridad:** Media
- **Descripcion:** Documentacion actualizada con cada release
- **Criterios:** README, API docs (OpenAPI), ADRs, runbooks

### RNF-073: Versionado de API
- **Prioridad:** Media
- **Descripcion:** API versionada (v1, v2) para compatibilidad
- **Criterios:** URL path versioning (/api/v1/), deprecation notices

---

## 9. Portabilidad

### RNF-080: Docker
- **Prioridad:** Alta
- **Descripcion:** La aplicacion debe ser containerizable con Docker
- **Criterios:** Dockerfile multi-stage, docker-compose para dev, < 200MB imagen final

### RNF-081: Multiplataforma
- **Prioridad:** Alta
- **Descripcion:** Funcionar en Chrome, Firefox, Safari, Edge (ultimas 2 versiones)
- **Criterios:** Testing en los 4 navegadores, polyfills si es necesario

---

*Requisitos No Funcionales v1.0 - 26/08/2026*
