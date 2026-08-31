# Roadmap de Desarrollo

## MantenimientoPlus

**Version:** 1.0 | **Fecha:** 26 de Agosto de 2026
**Duracion Total:** 14 semanas (7 sprints de 2 semanas)

---

## Vista General

| Sprint | Nombre | Duracion | Objetivo Principal |
|---|---|---|---|
| Sprint 0 | Fundamentos | Sem 1-2 | Setup infraestructura, CI/CD, arquitectura base |
| Sprint 1 | Auth + Maquinas Base | Sem 3-4 | Autenticacion, RBAC, CRUD maquinas basico |
| Sprint 2 | Maquinas Completo | Sem 5-6 | Maquinas completo, usuarios, catalogos |
| Sprint 3 | Mantenimientos | Sem 7-8 | Mantenimientos, calculos, alertas |
| Sprint 4 | Reportes + Dashboard | Sem 9-10 | Dashboard, reportes, historial, exportacion |
| Sprint 5 | Auditoria + UX | Sem 11-12 | Auditoria, config, UX polish, responsive |
| Sprint 6 | Launch | Sem 13-14 | Testing final, seguridad, despliegue, capacitacion |

---

## Sprint 0: Fundamentos (Semanas 1-2)

### Objetivos
- Establecer la infraestructura base del proyecto
- Configurar ambientes de desarrollo
- Definir arquitectura tecnica y estandares de codigo

### Historias/Task

| Task | Responsable | Duracion |
|---|---|---|
| Crear repositorio GitHub con branch protection | DevOps | 2h |
| Configurar ESLint, Prettier, TypeScript | Tech Lead | 4h |
| Setup Docker Compose (app, postgres, redis) | DevOps | 8h |
| Configurar Prisma ORM + esquema inicial | Backend Dev | 8h |
| Crear migraciones de BD (todas las tablas) | Backend Dev | 8h |
| Setup React + TypeScript + Tailwind | Frontend Dev | 8h |
| Configurar pipeline CI/CD basico | DevOps | 6h |
| Configurar Sentry para errores | DevOps | 2h |
| Crear estructura de carpetas backend/frontend | Tech Lead | 4h |
| Configurar variables de entorno | DevOps | 2h |
| Seed data: tipos de maquina, tipos de mantenimiento, usuario admin | Backend Dev | 4h |

### Entregables
- Repositorio funcional con CI passing
- Docker Compose levantando todos los servicios
- BD migrada con schema completo
- Frontend corriendo con layout basico
- Pipeline CI ejecutando lint + tests

### Riesgos
- Configuracion de permisos de GitHub puede retardar
- Compatibilidad de versiones de dependencias

---

## Sprint 1: Auth + Maquinas Base (Semanas 3-4)

### Objetivos
- Sistema completo de autenticacion
- CRUD basico de maquinas funcional
- RBAC implementado

### Historias

| ID | Historia | Pts |
|---|---|---|
| HU-001 | Inicio de sesion con JWT | 5 |
| HU-002 | Cierre de sesion | 2 |
| HU-004 | Control de permisos por rol | 5 |
| HU-010 | Registrar nueva maquina | 5 |
| INFRA-01 | Seed data completo | 2 |

### Entregables
- Login/logout funcional con JWT
- RBAC verificando permisos en backend y frontend
- CRUD de maquinas (crear, listar, ver detalle)
- Pagina de Dashboard con layout basico (sin KPIs reales)

### Criterios de Aceptacion Sprint
- [ ] Login con credenciales validas funciona
- [ ] Login con credenciales invalidas muestra error generico
- [ ] 5 intentos fallidos bloquean cuenta
- [ ] Admin puede crear usuarios
- [ ] Tecnico no puede acceder a /users
- [ ] Maquina se crea con ID unico y estado activo
- [ ] Codigo interno se valida como unico en tiempo real
- [ ] Lista de maquinas muestra datos con paginacion

---

## Sprint 2: Maquinas Completo (Semanas 5-6)

### Objetivos
- CRUD completo de maquinas con todas las funcionalidades
- Gestion de usuarios completa
- Catalogos funcionales

### Historias

| ID | Historia | Pts |
|---|---|---|
| HU-003 | Gestion de usuarios (CRUD) | 8 |
| HU-011 | Editar maquina | 3 |
| HU-012 | Buscar y filtrar maquinas | 5 |
| HU-013 | Ver detalle de maquina con historial | 3 |
| HU-014 | Cambiar estado de maquina | 2 |
| HU-015 | Exportar listado a CSV | 2 |
| HU-061 | Gestionar tipos de maquina | 2 |

### Entregables
- CRUD usuarios completo (Admin)
- Maquinas: editar, buscar, filtrar, ordenar
- Detalle de maquina con historial vacio
- Cambio de estado con validacion de transiciones
- Exportacion CSV funcionando
- Catalogo de tipos de maquina funcional

### Criterios de Aceptacion Sprint
- [ ] Admin crea, edita y desactiva usuarios
- [ ] Email unico validado
- [ ] Busqueda por texto funciona en tiempo real
- [ ] Filtros combinables funcionan
- [ ] Exportar CSV respeta filtros
- [ ] Transiciones de estado validas
- [ ] Dada de Baja requiere motivo

---

## Sprint 3: Mantenimientos + Alertas (Semanas 7-8)

### Objetivos
- Registro completo de mantenimientos
- Calculo automatico de proximo servicio
- Sistema de alertas funcionando

### Historias

| ID | Historia | Pts |
|---|---|---|
| HU-020 | Registrar mantenimiento | 8 |
| HU-025 | Calcular proximo mantenimiento | 5 |
| HU-021 | Actualizar estado de mantenimiento | 3 |
| HU-024 | Asignar tecnico | 2 |
| HU-026 | Gestionar catalogo de tipos de mantenimiento | 3 |
| HU-030 | Alertas de mantenimiento proximo | 5 |
| HU-031 | Alertas de mantenimiento vencido | 3 |

### Entregables
- Formulario de registro de mantenimiento completo
- Calculo automatico de horas hasta proximo y fecha estimada
- Estados de mantenimiento con transiciones
- Asignacion de tecnico
- Alertas generadas automaticamente (tarea programada diaria)
- Indicador de alertas en dashboard

### Criterios de Aceptacion Sprint
- [ ] Mantenimiento se registra con todos los campos
- [ ] Calculo de proximo mantenimiento es correcto
- [ ] Cambio de maquina a "En Mantenimiento" al iniciar servicio
- [ ] Regreso a "Activa" al completar servicio
- [ ] Alertas se generan segun dias de anticipacion
- [ ] Campana de notificaciones muestra contador
- [ ] Catalogo de tipos de mantenimiento pre-cargado

---

## Sprint 4: Reportes + Dashboard (Semanas 9-10)

### Objetivos
- Dashboard con KPIs reales
- Reportes funcionales con exportacion
- Historial completo de mantenimientos

### Historias

| ID | Historia | Pts |
|---|---|---|
| HU-022 | Ver historial de mantenimientos | 5 |
| HU-023 | Buscar mantenimientos | 3 |
| HU-040 | Dashboard principal con KPIs | 8 |
| HU-041 | Reporte historial por maquina | 3 |
| HU-042 | Reporte por periodo | 5 |

### Entregables
- Dashboard con KPIs calculados desde BD
- Graficos de barras y linea funcionales
- Lista de proximos mantenimientos en dashboard
- Reporte de historial por maquina (PDF + CSV)
- Reporte de mantenimientos por periodo
- Busqueda avanzada de mantenimientos

### Criterios de Aceptacion Sprint
- [ ] KPIs muestran datos reales
- [ ] Graficos se actualizan con nuevos datos
- [ ] Exportar PDF tiene formato profesional
- [ ] Exportar CSV tiene datos correctos
- [ ] Filtros de reporte funcionan correctamente
- [ ] Historial ordenado cronologicamente

---

## Sprint 5: Auditoria + UX (Semanas 11-12)

### Objetivos
- Sistema de auditoria completo
- Configuracion del sistema
- Polish de UX/UI
- Responsive completo

### Historias

| ID | Historia | Pts |
|---|---|---|
| HU-032 | Gestion de notificaciones in-app | 3 |
| HU-033 | Configurar dias de anticipacion | 2 |
| HU-043 | Reporte de cumplimiento | 3 |
| HU-044 | Reporte de estado de flota | 3 |
| HU-050 | Registro de acciones en auditoria | 5 |
| HU-051 | Consultar log de auditoria | 3 |
| HU-060 | Configurar parametros del sistema | 3 |
| UI-01 | Responsive design completo | 5 |
| UI-02 | Feedback al usuario | 3 |

### Entregables
- Sistema de auditoria registrando todas las acciones
- Pagina de auditoria con filtros (Admin)
- Configuracion del sistema funcional
- Notificaciones in-app completas
- Responsive verificado en movil, tablet, desktop
- Toast notifications, spinners, empty states

### Criterios de Aceptacion Sprint
- [ ] Todas las acciones CRUD se registran en auditoria
- [ ] Auditoria es inmutable (no se puede editar/eliminar)
- [ ] Configuracion se persiste y aplica
- [ ] Responsive funciona en 3 breakpoints
- [ ] Toast aparece en exito y error
- [ ] Empty states muestran mensajes helpful

---

## Sprint 6: Launch (Semanas 13-14)

### Objetivos
- Testing completo del sistema
- Auditoria de seguridad
- Despliegue a produccion
- Capacitacion a usuarios

### Historias/Tasks

| Task | Responsable | Duracion |
|---|---|---|
| Tests E2E completos (Playwright) | QA | 16h |
| Load testing (100 usuarios) | DevOps | 8h |
| Auditoria de seguridad (OWASP ZAP) | Security | 12h |
| Pentesting manual | Security | 8h |
| Optimizacion de consultas lentas | Backend | 8h |
| Configurar SSL en produccion | DevOps | 4h |
| Deploy a produccion | DevOps | 8h |
| Capacitacion a usuarios (3 sesiones) | PO + QA | 12h |
| Documentacion de API (Swagger) | Backend | 6h |
| Manual de usuario basico | PO | 8h |
| Pruebas de regresion final | QA | 8h |
| Monitoreo y alertas configurados | DevOps | 4h |
| Backup automatico verificado | DevOps | 4h |
| Go-live y monitoreo post-lanzamiento | Todo el equipo | 8h |

### Entregables
- Todos los tests passing
- Pentesting completado sin criticos
- Sistema desplegado en produccion
- Usuarios capacitados
- Monitoreo activo
- Backups verificados

### Criterios de Aceptacion Sprint
- [ ] 0 bugs criticos en produccion
- [ ] Uptime > 99.5% en primera semana
- [ ] 100% de usuarios capacitados
- [ ] Backup automatico ejecutandose
- [ ] Alertas de monitoreo funcionando

---

## Criterios de Finalizacion por Sprint

Cada sprint debe cumplir:

1. **Definition of Done:**
   - Codigo mergeado a develop/main
   - Code review aprobado
   - Tests unitarios passing (>80% coverage)
   - Tests de integracion passing
   - QA manual completado
   - Sin bugs criticos/altos abiertos
   - Responsive verificado
   - Deploy a staging exitoso
   - PO validacion funcional

2. **Sprint Review:**
   - Demo a stakeholders
   - Feedback documentado
   - Aprobacion para siguiente sprint

3. **Sprint Retrospective:**
   - Que salio bien
   - Que mejorar
   - Acciones de mejora

---

## Ideas Futuras (Post-MVP)

Ideas registradas para evaluación futura, no incluidas en el roadmap actual.

### PWA Instalable (manifest + service worker)

**Descripción:** Convertir la aplicación en una PWA (Progressive Web App) instalable.

**Beneficios:**
- Permite instalar la app en el celular como una app nativa (icono propio en la pantalla de inicio).
- Funcionamiento parcial sin conexión (vista de datos previamente cargados).
- Actualizaciones automáticas sin pasar por la tienda de apps.
- Se percibe como más profesional y accesible rápidamente para los técnicos en campo.

**Cambios requeridos:**
- `manifest.json` / `manifest.webmanifest` (nombre, iconos, theme-color).
- Service worker (registro + precache de assets).
- Meta tags complementarios: `theme-color`, `apple-mobile-web-app-capable`, etc.
- Política de caché para datos de máquinas/mantenimientos.
- Generación de iconos en distintos tamaños (192px, 512px, etc.).

**Prioridad sugerida:** Media - tras estabilizar el MVP y la experiencia móvil de tarjetas.

**Estado:** Idea registrada - 28/08/2026.

---

*Roadmap v1.0 - 26/08/2026*
