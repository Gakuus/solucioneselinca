# API REST - Diseno Completo

## MantenimientoPlus

**Version:** 1.0 | **Base URL:** /api/v1
**Formato:** JSON
**Auth:** Bearer Token (JWT)

---

## Convenciones Generales

### Formato de Respuesta Exitosa
```json
{
  "success": true,
  "data": { ... },
  "meta": { "page": 1, "limit": 20, "total": 150, "totalPages": 8 }
}
```

### Formato de Error
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "El email es requerido",
    "details": [{ "field": "email", "message": "es requerido" }]
  }
}
```

### Codigos HTTP

| Codigo | Uso |
|---|---|
| 200 | Operacion exitosa |
| 201 | Recurso creado |
| 204 | Sin contenido (DELETE exitoso) |
| 400 | Bad request (validacion) |
| 401 | No autenticado |
| 403 | Sin permisos |
| 404 | Recurso no encontrado |
| 409 | Conflicto (duplicado) |
| 422 | Entidad no procesable |
| 429 | Rate limit excedido |
| 500 | Error interno del servidor |

---

## 1. Auth - /api/v1/auth

### POST /auth/login
**Descripcion:** Iniciar sesion
**Auth:** No requiere
**Request:**
```json
{
  "email": "usuario@empresa.com",
  "password": "MiPassword123"
}
```
**Response 200:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "dGhpcyBpcyBhIHJlZnJl...",
    "user": {
      "id": "uuid",
      "email": "usuario@empresa.com",
      "fullName": "Juan Perez",
      "role": "admin"
    }
  }
}
```
**Response 401:** Credenciales invalidas
```json
{ "success": false, "error": { "code": "INVALID_CREDENTIALS", "message": "Email o contrasena incorrectos" } }
```
**Response 423:** Cuenta bloqueada
```json
{ "success": false, "error": { "code": "ACCOUNT_LOCKED", "message": "Cuenta bloqueada. Intente en 30 minutos" } }
```

### POST /auth/refresh
**Descripcion:** Renovar access token
**Auth:** No requiere (usa refresh token)
**Request:**
```json
{ "refreshToken": "dGhpcyBpcyBhIHJlZnJl..." }
```
**Response 200:**
```json
{
  "success": true,
  "data": {
    "accessToken": "nuevo_token...",
    "refreshToken": "nuevo_refresh..."
  }
}
```

### POST /auth/logout
**Descripcion:** Cerrar sesion
**Auth:** Bearer Token
**Response 204:** Sin contenido

### POST /auth/change-password
**Descripcion:** Cambiar contrasena
**Auth:** Bearer Token
**Request:**
```json
{
  "currentPassword": "actual",
  "newPassword": "nueva123A"
}
```
**Response 200:** { "success": true, "message": "Contrasena actualizada" }

---

## 2. Users - /api/v1/users

### GET /users
**Descripcion:** Listar usuarios (Admin)
**Auth:** Admin
**Query params:** page, limit, role, isActive, search
**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "email": "tecnico@empresa.com",
      "fullName": "Carlos Tecnico",
      "role": "technician",
      "isActive": true,
      "lastLoginAt": "2026-08-25T10:00:00Z",
      "createdAt": "2026-01-15T00:00:00Z"
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 15 }
}
```

### POST /users
**Descripcion:** Crear usuario (Admin)
**Auth:** Admin
**Request:**
```json
{
  "email": "nuevo@empresa.com",
  "fullName": "Nuevo Usuario",
  "role": "technician",
  "password": "TempPassword1"
}
```
**Response 201:** Objeto usuario creado (sin password_hash)

### GET /users/:id
**Descripcion:** Obtener usuario por ID
**Auth:** Admin (o el propio usuario)

### PUT /users/:id
**Descripcion:** Actualizar usuario (Admin)
**Auth:** Admin
**Request:** { "fullName": "Nombre Actualizado", "role": "supervisor" }

### DELETE /users/:id
**Descripcion:** Desactivar usuario (Admin) - Soft delete
**Auth:** Admin
**Response 204:** Sin contenido

---

## 3. Machines - /api/v1/machines

### GET /machines
**Descripcion:** Listar maquinas
**Auth:** Todos autenticados
**Query params:**
- page (default: 1)
- limit (default: 20)
- search (busqueda por texto en code, name, brand, model)
- status (active, in_maintenance, inactive, decommissioned)
- machineType (UUID del tipo)
- brand (texto)
- sortBy (internal_code, name, brand, status, created_at)
- sortOrder (asc, desc)

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "internalCode": "EXC-001",
      "name": "Excavadora CAT 320",
      "machineType": { "id": "uuid", "name": "Excavadora" },
      "brand": "Caterpillar",
      "model": "320F",
      "serialNumber": "CAT00320FHL12345",
      "year": 2019,
      "status": "active",
      "averageDailyHours": 8.0,
      "createdAt": "2026-01-15T00:00:00Z",
      "_count": { "maintenances": 12 }
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 45 }
}
```

### POST /machines
**Descripcion:** Crear maquina
**Auth:** Admin, Supervisor
**Request:**
```json
{
  "internalCode": "EXC-002",
  "name": "Excavadora Komatsu PC200",
  "machineTypeId": "uuid-del-tipo",
  "brand": "Komatsu",
  "model": "PC200-8",
  "serialNumber": "KMT2008ABC123",
  "year": 2021,
  "averageDailyHours": 8.0
}
```
**Response 201:** Objeto maquina creado

### GET /machines/:id
**Descripcion:** Obtener detalle de maquina
**Auth:** Todos autenticados
**Response 200:** Objeto maquina con conteo de mantenimientos y ultimo mantenimiento

### PUT /machines/:id
**Descripcion:** Actualizar maquina
**Auth:** Admin, Supervisor
**Request:** Campos a actualizar

### PUT /machines/:id/status
**Descripcion:** Cambiar estado de maquina
**Auth:** Admin, Supervisor
**Request:** { "status": "in_maintenance" }
**Request (decommission):** { "status": "decommissioned", "decommissionReason": "Daño irreparable" }

### GET /machines/:id/maintenances
**Descripcion:** Historial de mantenimientos de una maquina
**Auth:** Todos autenticados
**Query params:** page, limit, type, status, dateFrom, dateTo

### DELETE /machines/:id
**Descripcion:** Eliminar maquina (solo si sin mantenimientos)
**Auth:** Admin

---

## 4. Maintenances - /api/v1/maintenances

### GET /maintenances
**Descripcion:** Listar mantenimientos
**Auth:** Todos autenticados
**Query params:**
- page, limit
- machineId, technicianId
- maintenanceTypeId
- status (programmed, in_progress, completed, cancelled)
- dateFrom, dateTo
- search (texto en descripcion)
- sortBy, sortOrder

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "machine": { "id": "uuid", "internalCode": "EXC-001", "name": "Excavadora CAT 320" },
      "maintenanceType": { "id": "uuid", "name": "Cambio de aceite" },
      "technician": { "id": "uuid", "fullName": "Carlos Tecnico" },
      "receptionDate": "2026-08-20",
      "maintenanceDate": "2026-08-22",
      "description": "Cambio de aceite y filtro",
      "currentHours": 2450.5,
      "hoursUntilNext": 50,
      "estimatedNextDate": "2026-09-15",
      "status": "completed",
      "completedAt": "2026-08-22T16:00:00Z",
      "createdAt": "2026-08-20T08:00:00Z"
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 120 }
}
```

### POST /maintenances
**Descripcion:** Crear mantenimiento
**Auth:** Admin, Supervisor, Technician
**Request:**
```json
{
  "machineId": "uuid-maquina",
  "maintenanceTypeId": "uuid-tipo",
  "technicianId": "uuid-tecnico",
  "receptionDate": "2026-08-25",
  "maintenanceDate": "2026-08-28",
  "description": "Cambio de aceite preventivo segun programa",
  "observations": "Maquina con 2500 horas de uso",
  "currentHours": 2500.0
}
```
**Response 201:** Objeto mantenimiento con hoursUntilNext y estimatedNextDate calculados

### GET /maintenances/:id
**Descripcion:** Obtener mantenimiento por ID
**Auth:** Todos autenticados

### PUT /maintenances/:id
**Descripcion:** Actualizar mantenimiento
**Auth:** Admin, Supervisor, Technician (sus propios)

### PUT /maintenances/:id/status
**Descripcion:** Cambiar estado del mantenimiento
**Auth:** Admin, Supervisor, Technician
**Request:** { "status": "completed" }
**Request (cancel):** { "status": "cancelled", "cancelReason": "Maquina no disponible" }

### DELETE /maintenances/:id
**Descripcion:** No permitido. Usar status=cancelled
**Response:** 405 Method Not Allowed

---

## 5. Maintenance Types - /api/v1/maintenance-types

### GET /maintenance-types
**Descripcion:** Listar tipos de mantenimiento activos
**Auth:** Todos autenticados
**Query:** includeInactive=true (solo admin)

### POST /maintenance-types
**Descripcion:** Crear tipo de mantenimiento
**Auth:** Admin
**Request:** { "name": "Revision hidraulica", "description": "...", "defaultIntervalHours": 500 }

### PUT /maintenance-types/:id
**Descripcion:** Actualizar tipo
**Auth:** Admin

### PUT /maintenance-types/:id/toggle
**Descripcion:** Activar/desactivar tipo
**Auth:** Admin
**Request:** { "isActive": false }

---

## 6. Machine Types - /api/v1/machine-types

### GET /machine-types
**Auth:** Todos
### POST /machine-types
**Auth:** Admin
### PUT /machine-types/:id
**Auth:** Admin
### PUT /machine-types/:id/toggle
**Auth:** Admin

---

## 7. Alerts - /api/v1/alerts

### GET /alerts
**Descripcion:** Listar alertas activas
**Auth:** Todos autenticados
**Query:** type (upcoming, overdue), severity, unread=true, page, limit
**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "machine": { "id": "uuid", "internalCode": "EXC-001", "name": "Excavadora CAT 320" },
      "type": "upcoming",
      "severity": "warning",
      "title": "Mantenimiento proximo en 7 dias",
      "message": "Cambio de aceite vence el 01/09/2026",
      "daysRemaining": 7,
      "isRead": false,
      "createdAt": "2026-08-25T02:00:00Z"
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 8 }
}
```

### PUT /alerts/:id/read
**Descripcion:** Marcar alerta como leida
**Auth:** Todos autenticados

### PUT /alerts/read-all
**Descripcion:** Marcar todas como leidas
**Auth:** Todos autenticados

### GET /alerts/count
**Descripcion:** Contador de alertas no leidas
**Auth:** Todos
**Response:** { "success": true, "data": { "total": 8, "upcoming": 5, "overdue": 3 } }

---

## 8. Reports - /api/v1/reports

### GET /reports/machine-history/:machineId
**Descripcion:** Historial completo de una maquina
**Auth:** Todos
**Query:** dateFrom, dateTo
**Response:** PDF o JSON con historial

### GET /reports/maintenance-by-period
**Descripcion:** Mantenimientos por periodo
**Auth:** Admin, Supervisor
**Query:** dateFrom (requerido), dateTo (requerido), machineType, maintenanceType, technician
**Response:** Resumen + detalle

### GET /reports/compliance
**Descripcion:** Reporte de cumplimiento
**Auth:** Admin, Supervisor
**Query:** dateFrom, dateTo
**Response:** { "compliance": 92.5, "total": 100, "completedOnTime": 92 }

### GET /reports/fleet-status
**Descripcion:** Estado de la flota
**Auth:** Todos autenticados
**Response:** { "active": 35, "inMaintenance": 5, "inactive": 3, "decommissioned": 2 }

### GET /reports/technician-workload
**Descripcion:** Carga de trabajo por tecnico
**Auth:** Admin, Supervisor
**Query:** dateFrom, dateTo

### GET /reports/export/:type
**Descripcion:** Exportar reporte a PDF o CSV
**Auth:** Admin, Supervisor
**Query:** format=pdf|csv, todos los filtros del reporte
**Response:** Archivo binario (Content-Disposition: attachment)

---

## 9. Audit - /api/v1/audit

### GET /audit
**Descripcion:** Consultar log de auditoria
**Auth:** Admin
**Query:** userId, action, entityType, dateFrom, dateTo, page, limit
**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "user": { "id": "uuid", "fullName": "Admin" },
      "action": "update",
      "entityType": "machine",
      "entityId": "uuid-maquina",
      "oldValues": { "status": "active" },
      "newValues": { "status": "in_maintenance" },
      "ipAddress": "192.168.1.100",
      "createdAt": "2026-08-25T10:30:00Z"
    }
  ],
  "meta": { "page": 1, "limit": 50, "total": 5000 }
}
```

### GET /audit/export
**Descripcion:** Exportar auditoria a CSV
**Auth:** Admin

---

## 10. Notifications - /api/v1/notifications

### GET /notifications
**Auth:** Todos (sus propias)
**Query:** unread=true, page, limit

### PUT /notifications/:id/read
**Auth:** Todos

### PUT /notifications/read-all
**Auth:** Todos

### GET /notifications/count
**Auth:** Todos
**Response:** { "total": 12, "unread": 5 }

---

## 11. Config - /api/v1/config

### GET /config
**Auth:** Admin
**Response:** Todos los parametros del sistema

### PUT /config
**Auth:** Admin
**Request:** { "alertDaysWarning": 15, "alertDaysDanger": 7, "sessionTimeoutMinutes": 30 }

### GET /config/dashboard
**Auth:** Todos
**Response:** KPIs del dashboard
```json
{
  "success": true,
  "data": {
    "totalMachines": 45,
    "activeMachines": 35,
    "maintenancesThisMonth": 12,
    "pendingMaintenances": 8,
    "alertsCount": 8,
    "overdueAlerts": 3
  }
}
```

---

## 12. Rate Limiting Headers

Todas las respuestas incluyen:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1692979200
```

Cuando se excede:
```
HTTP 429
Retry-After: 60
```

---

*API Design v1.0 - 26/08/2026*
