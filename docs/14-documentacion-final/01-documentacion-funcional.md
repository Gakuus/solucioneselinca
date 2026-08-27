# Documentacion Funcional

## MantenimientoPlus

**Version:** 1.0 | **Fecha:** 26 de Agosto de 2026

---

## 1. Descripcion General

MantenimientoPlus es una plataforma web responsive para la gestion de mantenimiento preventivo y correctivo de maquinaria de construccion. Permite a empresas del sector construction registrar maquinas, programar servicios, controlar costos y optimizar la vida util de sus activos.

### 1.1 Publico Objetivo
- Jefes de Mantenimiento
- Supervisores de Planta
- Tecnicos de Mantenimiento
- Gerentes de Operaciones

### 1.2 Valor Propuesto
- Reducir downtime no programado hasta 30%
- Extender vida util de maquinaria hasta 20%
- Ahorrar 15% en costos de repuestos
- Cumplimiento 100% en auditorias ISO 9001

---

## 2. Modulos del Sistema

### 2.1 Modulo de Autenticacion
- Login con email y contrasena
- JWT con access token (15min) y refresh token (7 dias)
- Bloqueo por intentos fallidos (5 intentos, 30 min)
- Cambio y recuperacion de contrasena

### 2.2 Modulo de Maquinas
- CRUD completo de maquinas
- Estados: Activa, En Mantenimiento, Inactiva, Dada de Baja
- Busqueda, filtros avanzados, exportacion CSV
- Historial completo por maquina

### 2.3 Modulo de Mantenimientos
- Registro de mantenimientos preventivo/correctivo
- Calculo automatico de proximo servicio
- Estados: Programado, En Proceso, Completado, Cancelado
- Asignacion de tecnico

### 2.4 Modulo de Alertas
- Alertas automaticas por proximidad de vencimiento
- Alertas de mantenimiento vencido
- Contador de alertas en tiempo real
- Marcar como leidas

### 2.5 Modulo de Reportes
- Historial por maquina (PDF/CSV)
- Mantenimientos por periodo
- Cumplimiento de preventivos
- Estado de flota
- Carga de tecnicos

### 2.6 Modulo de Dashboard
- KPIs: Total maquinas, mantenimientos del mes, alertas activas, tecnicos
- Graficos de barras y linea
- Proximos mantenimientos
- Alertas activas

### 2.7 Modulo de Auditoria
- Registro inmutable de todas las acciones CRUD
- Filtros por usuario, accion, entidad, fecha
- Vista de diferencias (old/new values)
- Exportacion CSV

### 2.8 Modulo de Configuracion (Admin)
- Gestion de usuarios (CRUD + activar/desactivar)
- Catalogos: tipos de maquina, tipos de mantenimiento
- Parametros: dias de anticipacion por tipo
- Sesiones: timeout, politica de contrasenas

---

## 3. Requisitos Funcionales Implementados

| ID | Requisito | Modulo | Estado |
|---|---|---|---|
| RF-001 | Login con JWT | Auth | Sprint 1 |
| RF-002 | Logout (invalidar token) | Auth | Sprint 1 |
| RF-003 | RBAC por rol | Auth | Sprint 1 |
| RF-004 | Bloqueo por intentos fallidos | Auth | Sprint 1 |
| RF-010 | CRUD maquinas | Maquinas | Sprint 1-2 |
| RF-011 | Codigo interno unico | Maquinas | Sprint 1 |
| RF-012 | Estados de maquina | Maquinas | Sprint 2 |
| RF-020 | CRUD mantenimientos | Mantenimientos | Sprint 3 |
| RF-021 | Calculo automatico proximo servicio | Mantenimientos | Sprint 3 |
| RF-022 | Asignacion de tecnico | Mantenimientos | Sprint 3 |
| RF-030 | Alertas automaticas | Alertas | Sprint 3 |
| RF-040 | Dashboard con KPIs | Dashboard | Sprint 4 |
| RF-041 | Reportes exportables | Reportes | Sprint 4 |
| RF-050 | Auditoria inmutable | Auditoria | Sprint 5 |
| RF-060 | Configuracion del sistema | Config | Sprint 5 |

---

*Documentacion Funcional v1.0*
