# Modelo de Datos - Diagrama Entidad-Relacion

## MantenimientoPlus

**Version:** 1.0 | **Fecha:** 26 de Agosto de 2026

---

## 1. Entidades Principales

### 1.1 Usuarios (users)

| Campo | Tipo | Constraints | Descripcion |
|---|---|---|---|
| id | UUID | PK, DEFAULT gen_random_uuid() | Identificador unico |
| email | VARCHAR(255) | UNIQUE, NOT NULL | Email del usuario |
| password_hash | VARCHAR(255) | NOT NULL | Contrasena cifrada (bcrypt) |
| full_name | VARCHAR(200) | NOT NULL | Nombre completo |
| role | ENUM | NOT NULL | admin, supervisor, technician, viewer |
| is_active | BOOLEAN | DEFAULT true | Estado de la cuenta |
| last_login_at | TIMESTAMP | | Ultimo login exitoso |
| password_changed_at | TIMESTAMP | | Fecha de ultimo cambio de contrasena |
| failed_login_attempts | INTEGER | DEFAULT 0 | Contador de intentos fallidos |
| locked_until | TIMESTAMP | | Bloqueo temporal |
| created_at | TIMESTAMP | DEFAULT NOW() | Fecha de creacion |
| updated_at | TIMESTAMP | DEFAULT NOW() | Fecha de actualizacion |
| created_by | UUID | FK -> users.id | Usuario que creo el registro |

**Indices:**
- idx_users_email (UNIQUE en email)
- idx_users_role (busqueda por rol)
- idx_users_is_active (filtro por estado)

---

### 1.2 Refresh Tokens (refresh_tokens)

| Campo | Tipo | Constraints | Descripcion |
|---|---|---|---|
| id | UUID | PK | Identificador unico |
| user_id | UUID | FK -> users.id, NOT NULL | Usuario asociado |
| token_hash | VARCHAR(255) | NOT NULL | Hash del refresh token |
| expires_at | TIMESTAMP | NOT NULL | Fecha de expiracion |
| is_revoked | BOOLEAN | DEFAULT false | Si fue invalidado |
| created_at | TIMESTAMP | DEFAULT NOW() | Fecha de creacion |
| ip_address | VARCHAR(45) | | IP del cliente |
| user_agent | TEXT | | Browser/device info |

**Indices:**
- idx_refresh_tokens_user (user_id)
- idx_refresh_tokens_hash (token_hash)
- idx_refresh_tokens_expires (expires_at)

---

### 1.3 Tipos de Maquina (machine_types)

| Campo | Tipo | Constraints | Descripcion |
|---|---|---|---|
| id | UUID | PK | Identificador unico |
| name | VARCHAR(100) | UNIQUE, NOT NULL | Nombre del tipo |
| description | TEXT | | Descripcion |
| is_active | BOOLEAN | DEFAULT true | Estado |
| created_at | TIMESTAMP | DEFAULT NOW() | |
| updated_at | TIMESTAMP | DEFAULT NOW() | |

**Datos iniciales (seed):** Excavadora, Retroexcavadora, Grua, Buldoser, Compactador, Camion volqueta, Pista, Mezcladora, Otros

---

### 1.4 Maquinas (machines)

| Campo | Tipo | Constraints | Descripcion |
|---|---|---|---|
| id | UUID | PK | Identificador unico |
| internal_code | VARCHAR(50) | UNIQUE, NOT NULL | Codigo interno |
| name | VARCHAR(200) | NOT NULL | Nombre descriptivo |
| machine_type_id | UUID | FK -> machine_types.id, NOT NULL | Tipo de maquina |
| brand | VARCHAR(100) | NOT NULL | Marca |
| model | VARCHAR(100) | NOT NULL | Modelo |
| serial_number | VARCHAR(100) | | Numero de serie |
| year | INTEGER | | Anio de fabricacion |
| status | ENUM | DEFAULT 'active' | active, in_maintenance, inactive, decommissioned |
| decommission_reason | TEXT | | Motivo de baja (si aplica) |
| average_daily_hours | DECIMAL(5,2) | DEFAULT 8.0 | Promedio horas diarias de uso |
| created_at | TIMESTAMP | DEFAULT NOW() | Fecha de alta |
| updated_at | TIMESTAMP | DEFAULT NOW() | |
| created_by | UUID | FK -> users.id | |
| decommissioned_at | TIMESTAMP | | Fecha de baja |

**Indices:**
- idx_machines_code (UNIQUE en internal_code)
- idx_machines_type (machine_type_id)
- idx_machines_status (status)
- idx_machines_brand (brand)

---

### 1.5 Tipos de Mantenimiento (maintenance_types)

| Campo | Tipo | Constraints | Descripcion |
|---|---|---|---|
| id | UUID | PK | Identificador unico |
| name | VARCHAR(100) | UNIQUE, NOT NULL | Nombre del tipo |
| description | TEXT | | Descripcion |
| default_interval_hours | INTEGER | | Intervalo sugerido en horas |
| is_active | BOOLEAN | DEFAULT true | Estado |
| created_at | TIMESTAMP | DEFAULT NOW() | |
| updated_at | TIMESTAMP | DEFAULT NOW() | |

**Datos iniciales (seed):**
| Tipo | Intervalo Horas |
|---|---|
| Preventivo | 250 |
| Correctivo | NULL |
| Predictivo | 500 |
| Inspeccion | 100 |
| Cambio de aceite | 250 |
| Cambio de filtros | 500 |
| Revision general | 1000 |
| Reparacion | NULL |
| Otros | NULL |

---

### 1.6 Mantenimientos (maintenances)

| Campo | Tipo | Constraints | Descripcion |
|---|---|---|---|
| id | UUID | PK | Identificador unico |
| machine_id | UUID | FK -> machines.id, NOT NULL | Maquina asociada |
| maintenance_type_id | UUID | FK -> maintenance_types.id, NOT NULL | Tipo de mantenimiento |
| technician_id | UUID | FK -> users.id, NOT NULL | Tecnico responsable |
| reception_date | DATE | NOT NULL | Fecha de recepcion |
| maintenance_date | DATE | | Fecha real del mantenimiento |
| description | TEXT | NOT NULL | Descripcion del trabajo |
| observations | TEXT | | Observaciones adicionales |
| current_hours | DECIMAL(10,2) | NOT NULL | Horas actuales de uso |
| hours_until_next | INTEGER | | Calculo: horas hasta proximo |
| estimated_next_date | DATE | | Calculo: fecha estimada proximo |
| status | ENUM | DEFAULT 'programmed' | programmed, in_progress, completed, cancelled |
| cancel_reason | TEXT | | Motivo de cancelacion |
| completed_at | TIMESTAMP | | Fecha real de finalizacion |
| created_at | TIMESTAMP | DEFAULT NOW() | |
| updated_at | TIMESTAMP | DEFAULT NOW() | |
| created_by | UUID | FK -> users.id | Usuario que registro |
| cancelled_by | UUID | FK -> users.id | Usuario que cancelo |

**Indices:**
- idx_maintenances_machine (machine_id)
- idx_maintenances_technician (technician_id)
- idx_maintenances_type (maintenance_type_id)
- idx_maintenances_status (status)
- idx_maintenances_date (maintenance_date)
- idx_maintenances_estimated_next (estimated_next_date)
- idx_maintenances_created (created_at)

---

### 1.7 Alertas (alerts)

| Campo | Tipo | Constraints | Descripcion |
|---|---|---|---|
| id | UUID | PK | Identificador unico |
| machine_id | UUID | FK -> machines.id, NOT NULL | Maquina asociada |
| maintenance_id | UUID | FK -> maintenances.id | Mantenimiento asociado |
| type | ENUM | NOT NULL | upcoming, overdue |
| severity | ENUM | NOT NULL | info, warning, danger, critical |
| title | VARCHAR(200) | NOT NULL | Titulo de la alerta |
| message | TEXT | NOT NULL | Mensaje descriptivo |
| days_remaining | INTEGER | | Dias restantes hasta vencimiento |
| is_read | BOOLEAN | DEFAULT false | Si fue vista |
| read_at | TIMESTAMP | | Fecha de lectura |
| read_by | UUID | FK -> users.id | Quien la marco como leida |
| is_resolved | BOOLEAN | DEFAULT false | Si fue resuelta |
| resolved_at | TIMESTAMP | | Fecha de resolucion |
| created_at | TIMESTAMP | DEFAULT NOW() | |

**Indices:**
- idx_alerts_machine (machine_id)
- idx_alerts_type_severity (type, severity)
- idx_alerts_unread (is_read) WHERE is_read = false
- idx_alerts_created (created_at)

---

### 1.8 Auditoria (audit_logs)

| Campo | Tipo | Constraints | Descripcion |
|---|---|---|---|
| id | UUID | PK | Identificador unico |
| user_id | UUID | FK -> users.id | Usuario que realizo la accion |
| action | VARCHAR(50) | NOT NULL | login, logout, create, update, delete, export |
| entity_type | VARCHAR(50) | NOT NULL | user, machine, maintenance, alert, etc. |
| entity_id | UUID | | ID del registro afectado |
| old_values | JSONB | | Valores antes del cambio |
| new_values | JSONB | | Valores despues del cambio |
| ip_address | VARCHAR(45) | | IP del cliente |
| user_agent | TEXT | | Browser/device |
| created_at | TIMESTAMP | DEFAULT NOW() | Fecha de la accion |

**Indices:**
- idx_audit_user (user_id)
- idx_audit_entity (entity_type, entity_id)
- idx_audit_action (action)
- idx_audit_created (created_at)

**Nota:** Tabla append-only. Sin permisos UPDATE/DELETE para la aplicacion.

---

### 1.9 Notificaciones (notifications)

| Campo | Tipo | Constraints | Descripcion |
|---|---|---|---|
| id | UUID | PK | Identificador unico |
| user_id | UUID | FK -> users.id, NOT NULL | Usuario destinatario |
| type | VARCHAR(50) | NOT NULL | alert_upcoming, alert_overdue, system |
| title | VARCHAR(200) | NOT NULL | Titulo |
| message | TEXT | NOT NULL | Mensaje |
| link | VARCHAR(500) | | URL de navegacion |
| is_read | BOOLEAN | DEFAULT false | Si fue leida |
| read_at | TIMESTAMP | | Fecha de lectura |
| created_at | TIMESTAMP | DEFAULT NOW() | |

**Indices:**
- idx_notifications_user (user_id)
- idx_notifications_unread (is_read) WHERE is_read = false
- idx_notifications_created (created_at)

---

### 1.10 Configuracion del Sistema (system_config)

| Campo | Tipo | Constraints | Descripcion |
|---|---|---|---|
| id | UUID | PK | Identificador unico |
| key | VARCHAR(100) | UNIQUE, NOT NULL | Clave del parametro |
| value | TEXT | NOT NULL | Valor |
| description | TEXT | | Descripcion del parametro |
| updated_at | TIMESTAMP | DEFAULT NOW() | |
| updated_by | UUID | FK -> users.id | |

**Parametros iniciales:**
| key | value | description |
|---|---|---|
| company_name | [Nombre Empresa] | Nombre de la empresa |
| alert_days_warning | 15 | Dias para alerta warning |
| alert_days_danger | 7 | Dias para alerta danger |
| alert_days_critical | 3 | Dias para alerta critical |
| session_timeout_minutes | 30 | Timeout de sesion |
| password_expiry_days | 90 | Dias para cambio de contrasena |
| default_interval_hours | 500 | Intervalo por defecto para tipos sin intervalo |

---

## 2. Diagrama Entidad-Relacion (ERD)

```
┌──────────────────┐     ┌──────────────────┐
│    users         │     │  refresh_tokens  │
│──────────────────│     │──────────────────│
│ id (PK)         │──┬──│ id (PK)          │
│ email (UQ)      │  │  │ user_id (FK)     │
│ password_hash   │  │  │ token_hash       │
│ full_name       │  │  │ expires_at       │
│ role            │  │  │ is_revoked       │
│ is_active       │  │  └──────────────────┘
│ last_login_at   │  │
│ created_at      │  │  ┌──────────────────┐
│ updated_at      │  │  │  machine_types   │
└────────┬────────┘  │  │──────────────────│
         │           │  │ id (PK)          │
         │           │  │ name (UQ)        │
         │           │  │ description      │
         │           │  │ is_active        │
         │           │  └────────┬─────────┘
         │           │           │
         │           │           │ 1:N
         │           │           │
         │           │  ┌────────┴─────────┐
         │           │  │    machines      │
         │           │  │──────────────────│
         │           ├──│ id (PK)          │
         │           │  │ internal_code(UQ)│
         │           │  │ name             │
         │           │  │ machine_type_id(FK)│
         │           │  │ brand            │
         │           │  │ model            │
         │           │  │ serial_number    │
         │           │  │ year             │
         │           │  │ status           │
         │           │  │ created_by (FK)  │
         │           │  └────────┬─────────┘
         │           │           │
         │           │           │ 1:N
         │           │           │
         │           │  ┌────────┴─────────┐
         │           │  │  maintenances    │
         │           │  │──────────────────│
         │           ├──│ id (PK)          │
         │           │  │ machine_id (FK)  │
         │           │  │ maintenance_type_id(FK)│
         │           │  │ technician_id(FK)│
         │           │  │ reception_date   │
         │           │  │ maintenance_date │
         │           │  │ description      │
         │           │  │ current_hours    │
         │           │  │ hours_until_next │
         │           │  │ estimated_next_date│
         │           │  │ status           │
         │           │  │ created_by (FK)  │
         │           │  └────────┬─────────┘
         │           │           │
         │           │           │ 1:N
         │           │           │
         │           │  ┌────────┴─────────┐
         │           │  │     alerts       │
         │           │  │──────────────────│
         │           ├──│ id (PK)          │
         │           │  │ machine_id (FK)  │
         │           │  │ maintenance_id(FK)│
         │           │  │ type             │
         │           │  │ severity         │
         │           │  │ title            │
         │           │  │ message          │
         │           │  │ is_read          │
         │           │  │ created_at       │
         │           │  └──────────────────┘
         │           │
         │           │  ┌──────────────────┐
         │           │  │  audit_logs      │
         │           │  │──────────────────│
         │           └──│ id (PK)          │
         │              │ user_id (FK)     │
         │              │ action           │
         │              │ entity_type      │
         │              │ entity_id        │
         │              │ old_values       │
         │              │ new_values       │
         │              │ ip_address       │
         │              │ created_at       │
         │              └──────────────────┘
         │
         │  ┌──────────────────┐
         │  │  notifications   │
         │  │──────────────────│
         └──│ id (PK)          │
            │ user_id (FK)     │
            │ type             │
            │ title            │
            │ message          │
            │ is_read          │
            │ created_at       │
            └──────────────────┘

┌──────────────────┐     ┌──────────────────┐
│maintenance_types │     │ system_config    │
│──────────────────│     │──────────────────│
│ id (PK)          │     │ id (PK)          │
│ name (UQ)        │     │ key (UQ)         │
│ description      │     │ value            │
│ default_interval │     │ description      │
│ is_active        │     │ updated_at       │
└──────────────────┘     └──────────────────┘
```

---

## 3. Relaciones

| Relacion | Tipo | FK | Cardenalidad |
|---|---|---|---|
| users -> refresh_tokens | 1:N | refresh_tokens.user_id | Un usuario tiene muchos tokens |
| machine_types -> machines | 1:N | machines.machine_type_id | Un tipo tiene muchas maquinas |
| users -> machines | 1:N | machines.created_by | Un usuario crea muchas maquinas |
| machines -> maintenances | 1:N | maintenances.machine_id | Una maquina tiene muchos mantenimientos |
| maintenance_types -> maintenances | 1:N | maintenances.maintenance_type_id | Un tipo tiene muchos mantenimientos |
| users -> maintenances | 1:N | maintenances.technician_id | Un tecnico tiene muchos mantenimientos |
| machines -> alerts | 1:N | alerts.machine_id | Una maquina tiene muchas alertas |
| maintenances -> alerts | 1:N | alerts.maintenance_id | Un mantenimiento tiene una alerta |
| users -> audit_logs | 1:N | audit_logs.user_id | Un usuario tiene muchos logs |
| users -> notifications | 1:N | notifications.user_id | Un usuario tiene muchas notificaciones |

---

## 4. Restricciones de Integridad

### 4.1 Unique Constraints
- users.email
- machines.internal_code
- machine_types.name
- maintenance_types.name
- system_config.key

### 4.2 Check Constraints
- users.role IN ('admin', 'supervisor', 'technician', 'viewer')
- machines.status IN ('active', 'in_maintenance', 'inactive', 'decommissioned')
- maintenances.status IN ('programmed', 'in_progress', 'completed', 'cancelled')
- maintenances.current_hours >= 0
- maintenances.hours_until_next >= 0 (when not null)
- alerts.type IN ('upcoming', 'overdue')
- alerts.severity IN ('info', 'warning', 'danger', 'critical')
- maintenance_types.default_interval_hours > 0 (when not null)

### 4.3 Foreign Key Actions
- Todas las FK: ON DELETE RESTRICT (excepto donde se especifique)
- machines.decommissioned_by: ON DELETE SET NULL
- maintenances.cancelled_by: ON DELETE SET NULL

---

## 5. Script SQL Base (PostgreSQL)

```sql
-- Enums
CREATE TYPE user_role AS ENUM ('admin', 'supervisor', 'technician', 'viewer');
CREATE TYPE machine_status AS ENUM ('active', 'in_maintenance', 'inactive', 'decommissioned');
CREATE TYPE maintenance_status AS ENUM ('programmed', 'in_progress', 'completed', 'cancelled');
CREATE TYPE alert_type AS ENUM ('upcoming', 'overdue');
CREATE TYPE alert_severity AS ENUM ('info', 'warning', 'danger', 'critical');
CREATE TYPE audit_action AS ENUM ('login', 'logout', 'create', 'update', 'delete', 'export');

-- Tablas (resumen - el ORM genera el DDL completo)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(200) NOT NULL,
    role user_role NOT NULL DEFAULT 'viewer',
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMPTZ,
    password_changed_at TIMESTAMPTZ DEFAULT NOW(),
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

CREATE TABLE machines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    internal_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    machine_type_id UUID NOT NULL REFERENCES machine_types(id),
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    serial_number VARCHAR(100),
    year INTEGER,
    status machine_status DEFAULT 'active',
    decommission_reason TEXT,
    average_daily_hours DECIMAL(5,2) DEFAULT 8.0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    decommissioned_at TIMESTAMPTZ
);

CREATE TABLE maintenances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    machine_id UUID NOT NULL REFERENCES machines(id),
    maintenance_type_id UUID NOT NULL REFERENCES maintenance_types(id),
    technician_id UUID NOT NULL REFERENCES users(id),
    reception_date DATE NOT NULL,
    maintenance_date DATE,
    description TEXT NOT NULL,
    observations TEXT,
    current_hours DECIMAL(10,2) NOT NULL,
    hours_until_next INTEGER,
    estimated_next_date DATE,
    status maintenance_status DEFAULT 'programmed',
    cancel_reason TEXT,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    cancelled_by UUID REFERENCES users(id)
);

-- Indices adicionales para performance
CREATE INDEX idx_maintenances_estimated_next ON maintenances(estimated_next_date)
    WHERE status IN ('programmed', 'in_progress');
CREATE INDEX idx_machines_active ON machines(id) WHERE status = 'active';
```

---

*Modelo de Datos v1.0 - 26/08/2026*
