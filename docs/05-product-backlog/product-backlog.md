# Product Backlog Priorizado

## MantenimientoPlus

**Version:** 1.0 | **Fecha:** 26 de Agosto de 2026

---

## Metodologia de Priorizacion: MoSCoW + Weighted Shortest Job First (WSJF)

**WSJF = (Value + Time Criticality + Risk Reduction) / Job Size**

Escala de valor: 1-10 | Tamaño: Fibonacci (1,2,3,5,8,13)

---

## Backlog Priorizado Global

### PRIORIDAD 1 - CRITICA (Sprint 0-1)

| ID | Epic | Feature/User Story | Tamaño | WSJF | Sprint |
|---|---|---|---|---|---|
| INFRA-01 | Infraestructura | Setup proyecto, repositorio, CI/CD | 5 | 9.2 | Sprint 0 |
| INFRA-02 | Infraestructura | Configurar Docker, ambientes dev/test/prod | 5 | 8.8 | Sprint 0 |
| INFRA-03 | Infraestructura | Setup base de datos PostgreSQL + migraciones | 3 | 8.6 | Sprint 0 |
| INFRA-04 | Infraestructura | Configurar logging y monitoreo basico | 3 | 7.4 | Sprint 0 |
| HU-001 | Auth | Inicio de sesion con JWT | 5 | 9.0 | Sprint 1 |
| HU-002 | Auth | Cierre de sesion | 2 | 8.5 | Sprint 1 |
| HU-004 | Auth | Control de permisos por rol (RBAC) | 5 | 9.0 | Sprint 1 |
| HU-010 | Maquinas | Registrar nueva maquina | 5 | 8.8 | Sprint 1 |
| SEED-01 | Datos | Seed data: tipos de maquina, tipos mantenimiento, admin user | 2 | 8.0 | Sprint 1 |

### PRIORIDAD 2 - ALTA (Sprint 2)

| ID | Epic | Feature/User Story | Tamaño | WSJF | Sprint |
|---|---|---|---|---|---|
| HU-003 | Auth | Gestion de usuarios (CRUD) | 8 | 7.5 | Sprint 2 |
| HU-011 | Maquinas | Editar maquina | 3 | 7.2 | Sprint 2 |
| HU-012 | Maquinas | Buscar y filtrar maquinas | 5 | 7.8 | Sprint 2 |
| HU-013 | Maquinas | Ver detalle de maquina con historial | 3 | 7.6 | Sprint 2 |
| HU-014 | Maquinas | Cambiar estado de maquina | 2 | 6.8 | Sprint 2 |
| HU-015 | Maquinas | Exportar listado a CSV | 2 | 5.2 | Sprint 2 |
| HU-061 | Config | Gestionar tipos de maquina | 2 | 6.4 | Sprint 2 |

### PRIORIDAD 3 - ALTA (Sprint 3)

| ID | Epic | Feature/User Story | Tamaño | WSJF | Sprint |
|---|---|---|---|---|---|
| HU-020 | Mantenimientos | Registrar mantenimiento | 8 | 8.2 | Sprint 3 |
| HU-025 | Mantenimientos | Calcular proximo mantenimiento (automatico) | 5 | 8.6 | Sprint 3 |
| HU-021 | Mantenimientos | Actualizar estado de mantenimiento | 3 | 7.4 | Sprint 3 |
| HU-024 | Mantenimientos | Asignar tecnico | 2 | 6.6 | Sprint 3 |
| HU-026 | Mantenimientos | Gestionar catalogo de tipos de mantenimiento | 3 | 6.8 | Sprint 3 |
| HU-030 | Alertas | Alertas de mantenimiento proximo | 5 | 8.4 | Sprint 3 |
| HU-031 | Alertas | Alertas de mantenimiento vencido | 3 | 8.0 | Sprint 3 |

### PRIORIDAD 4 - ALTA (Sprint 4)

| ID | Epic | Feature/User Story | Tamaño | WSJF | Sprint |
|---|---|---|---|---|---|
| HU-022 | Mantenimientos | Ver historial de mantenimientos | 5 | 7.2 | Sprint 4 |
| HU-023 | Mantenimientos | Buscar mantenimientos | 3 | 6.4 | Sprint 4 |
| HU-032 | Alertas | Gestion de notificaciones in-app | 3 | 6.8 | Sprint 4 |
| HU-033 | Alertas | Configurar dias de anticipacion | 2 | 5.6 | Sprint 4 |
| HU-040 | Dashboard | Dashboard principal con KPIs | 8 | 7.8 | Sprint 4 |
| HU-041 | Reportes | Reporte historial por maquina | 3 | 7.0 | Sprint 4 |
| HU-042 | Reportes | Reporte por periodo | 5 | 6.6 | Sprint 4 |

### PRIORIDAD 5 - MEDIA (Sprint 5)

| ID | Epic | Feature/User Story | Tamaño | WSJF | Sprint |
|---|---|---|---|---|---|
| HU-043 | Reportes | Reporte de cumplimiento | 3 | 5.8 | Sprint 5 |
| HU-044 | Reportes | Reporte de estado de flota | 3 | 5.6 | Sprint 5 |
| HU-050 | Auditoria | Registro de acciones en auditoria | 5 | 6.2 | Sprint 5 |
| HU-051 | Auditoria | Consultar log de auditoria | 3 | 5.4 | Sprint 5 |
| HU-060 | Config | Configurar parametros del sistema | 3 | 4.8 | Sprint 5 |
| UI-01 | UX | Responsive design completo | 5 | 7.0 | Sprint 5 |
| UI-02 | UX | Feedback al usuario (toasts, spinners) | 3 | 5.2 | Sprint 5 |

### PRIORIDAD 6 - MEDIA (Sprint 6 - Polish)

| ID | Epic | Feature/User Story | Tamaño | WSJF | Sprint |
|---|---|---|---|---|---|
| SEC-01 | Seguridad | Auditoria de seguridad (pentesting) | 5 | 6.0 | Sprint 6 |
| PERF-01 | Rendimiento | Optimizacion de consultas y caching | 3 | 5.0 | Sprint 6 |
| TEST-01 | QA | Tests E2E criticos | 5 | 5.4 | Sprint 6 |
| TEST-02 | QA | Load testing | 3 | 4.6 | Sprint 6 |
| DOC-01 | Documentacion | API docs (OpenAPI/Swagger) | 2 | 4.2 | Sprint 6 |
| DOC-02 | Documentacion | Manual de usuario | 3 | 4.0 | Sprint 6 |
| LAUNCH-01 | Despliegue | Despliegue a produccion | 5 | 8.0 | Sprint 6 |
| LAUNCH-02 | Despliegue | Capacitacion a usuarios | 3 | 6.0 | Sprint 6 |

---

## Resumen por Sprint

| Sprint | Historias | Pts | Objetivo |
|---|---|---|---|
| Sprint 0 | 4 | 16 | Infraestructura base |
| Sprint 1 | 5 | 19 | Auth + CRUD maquinas basico |
| Sprint 2 | 7 | 28 | Maquinas completo + usuarios |
| Sprint 3 | 7 | 32 | Mantenimientos + alertas |
| Sprint 4 | 7 | 32 | Historial + dashboard + reportes |
| Sprint 5 | 7 | 30 | Reportes + auditoria + UX |
| Sprint 6 | 8 | 33 | Polish + testing + despliegue |
| **TOTAL** | **45** | **190** | |

---

## Reglas de Gestión del Backlog

1. Las historias en Sprint en curso son inmutables
2. El PO puede re-priorizar historias del backlog no comprometidas
3. Las historias bloqueadas se marcan con Blocked y se escalan
4. El refinamiento semanal puede agregar/quitar/modificar historias
5. La Definition of Done (DoD) aplica a todas las historias

### Definition of Done (DoD)

- [ ] Codigo implementado y mergeado
- [ ] Code review aprobado
- [ ] Tests unitarios passing (>80% coverage)
- [ ] Tests de integracion passing
- [ ] Documentacion de API actualizada
- [ ] QA manual completado
- [ ] Sin bugs criticos abiertos
- [ ] Responsive en movil verificado
- [ ] Deploy a staging exitoso
- [ ] PO ha validado la funcionalidad

---

*Product Backlog v1.0 - 26/08/2026*
