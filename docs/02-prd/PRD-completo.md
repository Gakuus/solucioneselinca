# Product Requirements Document (PRD)

## MantenimientoPlus - Plataforma de Gestión de Mantenimiento de Maquinaria

**Versión:** 1.0
**Fecha:** 26 de Agosto de 2026
**Estado:** Borrador
**Autor:** Product Owner
**Aprobado por:** [Pendiente de aprobación]

---

## Tabla de Contenidos

1. [Resumen Ejecutivo](#1-resumen-ejecutivo)
2. [Objetivos](#2-objetivos)
3. [Métricas de Éxito](#3-métricas-de-éxito)
4. [Requisitos Funcionales](#4-requisitos-funcionales)
5. [Requisitos No Funcionales](#5-requisitos-no-funcionales)
6. [Restricciones](#6-restricciones)
7. [Dependencias](#7-dependencias)
8. [Casos de Uso](#8-casos-de-uso)
9. [Riesgos](#9-riesgos)
10. [Roadmap](#10-roadmap)

---

## 1. Resumen Ejecutivo

### 1.1 Descripción del Producto

MantenimientoPlus es una plataforma web responsive diseñada para empresas de construcción que necesitan gestionar el mantenimiento preventivo y correctivo de su flota de maquinaria. El sistema centraliza el registro de máquinas, el seguimiento de mantenimientos, el cálculo automático de servicios futuros, la generación de alertas y la producción de reportes gerenciales.

### 1.2 Problema que Resuelve

Las empresas de construcción gestionan actualmente el mantenimiento de su maquinaria de forma manual (hojas de cálculo, cuadernos, comunicación verbal), lo que genera:
- Mantenimientos omitidos por falta de alertas
- Ausencia de trazabilidad en el historial
- Falta de reportes confiables para la toma de decisiones
- Costos elevados por reparaciones correctivas no planificadas

### 1.3 Solución Propuesta

Una plataforma web centralizada que permite:
- Registrar y gestionar toda la flota de maquinaria
- Registrar y dar seguimiento a cada mantenimiento
- Calcular automáticamente fechas de próximo mantenimiento
- Generar alertas proactivas por servicios próximos o vencidos
- Mantener un historial completo e inmutable por máquina
- Generar reportes operativos y gerenciales en tiempo real
- Controlar el acceso mediante roles y permisos (RBAC)
- Registrar todas las acciones para auditoría

### 1.4 Audiencia Objetivo

| Rol | Necesidad Principal |
|---|---|
| Jefe de Mantenimiento | Control total de la flota y cumplimiento |
| Supervisor de Mantenimiento | Gestión diaria del equipo y asignaciones |
| Técnico de Mantenimiento | Registro rápido de trabajos realizados |
| Gerente de Operaciones | Visibilidad del estado de la flota |
| Gerente General | Reportes ejecutivos y métricas de negocio |

### 1.5 Plataforma

- **Tipo:** Aplicación web responsive (SPA - Single Page Application)
- **Acceso:** Navegador web (Chrome, Firefox, Safari, Edge)
- **Dispositivos:** PC de escritorio, laptop, tablet, teléfono celular
- **Conexión:** Requiere conexión a internet (funcionalidad offline no incluida en v1)

---

## 2. Objetivos

### 2.1 Objetivos del Producto

| ID | Objetivo | Prioridad |
|---|---|---|
| OBJ-01 | Centralizar toda la información de mantenimiento en una plataforma única | Crítica |
| OBJ-02 | Automatizar el cálculo de fechas de próximo mantenimiento | Crítica |
| OBJ-03 | Generar alertas proactivas por mantenimientos próximos y vencidos | Crítica |
| OBJ-04 | Mantener historial completo e inmutable por máquina | Crítica |
| OBJ-05 | Proveer reportes operativos y gerenciales en tiempo real | Alta |
| OBJ-06 | Controlar acceso basado en roles (RBAC) | Crítica |
| OBJ-07 | Registrar auditoría de acciones del sistema | Alta |
| OBJ-08 | Reducir el tiempo de registro de mantenimientos a menos de 5 minutos | Alta |
| OBJ-09 | Eliminar el 100% de mantenimientos omitidos por olvido | Crítica |
| OBJ-10 | Lograr adopción del 80% de usuarios en 3 meses post-lanzamiento | Media |

### 2.2 Objetivos del Proyecto

| ID | Objetivo | Meta |
|---|---|---|
| PRJ-01 | Entrega en el plazo establecido | 6 sprints (12 semanas) |
| PRJ-02 | Calidad del código | 0 bugs críticos en producción |
| PRJ-03 | Cumplimiento de presupuesto | Variación < 10% |
| PRJ-04 | Documentación completa | 100% de documentación entregada |

---

## 3. Métricas de Éxito

### 3.1 Métricas de Producto

| Métrica | Fórmula | Meta | Período de Medición |
|---|---|---|---|
| Tasa de completado de mantenimientos programados | (Mantenimientos completados / Programados) × 100 | > 95% | Mensual post-lanzamiento |
| Ratio preventivo/correctivo | Preventivos / (Preventivos + Correctivos) × 100 | > 70% | Mensual post-lanzamiento |
| Tiempo promedio de registro | Tiempo desde apertura del form hasta guardado | < 5 minutos | Semanal post-lanzamiento |
| Tasa de respuesta a alertas | Alertas atendidas en < 24h / Total alertas × 100 | > 90% | Semanal post-lanzamiento |
| Cobertura de máquinas | Máquinas registradas / Máquinas totales × 100 | 100% | 2 meses post-lanzamiento |
| Tasa de retención de usuarios | Usuarios activos a 30 días / Usuarios registrados | > 80% | Mensual |

### 3.2 Métricas de Negocio

| Métrica | Fórmula | Meta | Período |
|---|---|---|---|
| Reducción de downtime no planificado | (Downtime antes - Después) / Downtime antes × 100 | > 30% | 6 meses post-lanzamiento |
| Ahorro en costos de mantenimiento | Costo promedio antes vs después | > 15% | 12 meses post-lanzamiento |
| NPS (Net Promoter Score) | Encuesta a usuarios | > 7/10 | Trimestral |
| ROI del sistema | (Beneficio - Costo) / Costo × 100 | > 180% en 12 meses | Anual |

### 3.3 Métricas Técnicas

| Métrica | Meta | Medición |
|---|---|---|
| Uptime del sistema | > 99.5% | Monitoreo continuo |
| Tiempo de respuesta API (P95) | < 500ms | APM |
| Tiempo de carga de página | < 3 segundos | Lighthouse |
| Tasa de errores HTTP 5xx | < 0.1% | Logs |
| Cobertura de tests | > 80% | Pipeline CI |

---

## 4. Requisitos Funcionales

### 4.1 Gestión de Autenticación y Usuarios

| ID | Requisito | Prioridad |
|---|---|---|
| RF-001 | El sistema debe permitir el inicio de sesión con email y contraseña | Crítica |
| RF-002 | El sistema debe implementar JWT para autenticación stateless | Crítica |
| RF-003 | El sistema debe implementar Refresh Tokens con expiración configurable | Crítica |
| RF-004 | El sistema debe bloquear la cuenta después de 5 intentos fallidos | Alta |
| RF-005 | El sistema debe registrar todos los intentos de login (exitosos y fallidos) | Alta |
| RF-006 | El sistema debe permitir cerrar sesión (logout) e invalidar el token | Crítica |
| RF-007 | El sistema debe gestionar usuarios con roles (Admin, Supervisor, Técnico, Consulta) | Crítica |
| RF-008 | El sistema debe permitir al administrador crear, editar y desactivar usuarios | Crítica |
| RF-009 | El sistema debe implementar control de acceso basado en roles (RBAC) | Crítica |
| RF-010 | El sistema debe obligar cambio de contraseña cada 90 días (configurable) | Media |

### 4.2 Gestión de Máquinas

| ID | Requisito | Prioridad |
|---|---|---|
| RF-011 | El sistema debe permitir registrar máquinas con todos los campos: ID único, código interno, nombre, tipo, marca, modelo, número de serie, año, estado, fecha de alta | Crítica |
| RF-012 | El sistema debe generar automáticamente el ID único de cada máquina | Crítica |
| RF-013 | El sistema debe validar que el código interno sea único | Crítica |
| RF-014 | El sistema debe mantener un catálogo configurable de tipos de máquina | Alta |
| RF-015 | El sistema debe permitir buscar máquinas por código, nombre, tipo o marca | Crítica |
| RF-016 | El sistema debe permitir filtrar máquinas por estado, tipo y marca | Alta |
| RF-017 | El sistema debe permitir ordenar la lista de máquinas por cualquier campo | Media |
| RF-018 | El sistema debe permitir editar la información de una máquina existente | Crítica |
| RF-019 | El sistema debe permitir cambiar el estado de una máquina (Activa, En Mantenimiento, Inactiva, Dada de Baja) | Crítica |
| RF-020 | El sistema debe permitir exportar el listado de máquinas a CSV/Excel | Media |
| RF-021 | El sistema debe validar que no se elimine una máquina con mantenimientos activos | Alta |
| RF-022 | El sistema debe mostrar el historial completo de una máquina desde su vista de detalle | Crítica |

### 4.3 Gestión de Mantenimientos

| ID | Requisito | Prioridad |
|---|---|---|
| RF-023 | El sistema debe permitir registrar mantenimientos con: fecha de recepción, fecha de mantenimiento, tipo, descripción, observaciones, técnico responsable, horas actuales, horas hasta próximo, fecha estimada próximo, estado | Crítica |
| RF-024 | El sistema debe mantener un catálogo configurable de tipos de mantenimiento | Crítica |
| RF-025 | El sistema debe calcular automáticamente la fecha estimada del próximo mantenimiento | Crítica |
| RF-026 | El sistema debe permitir registrar las horas actuales de uso de la máquina | Crítica |
| RF-027 | El sistema debe calcular las horas restantes hasta el próximo mantenimiento | Alta |
| RF-028 | El sistema debe cambiar el estado de la máquina a "En Mantenimiento" cuando se inicia un servicio | Alta |
| RF-029 | El sistema debe permitir asignar un técnico responsable a cada mantenimiento | Crítica |
| RF-030 | El sistema debe permitir actualizar el estado del mantenimiento (Programado, En Proceso, Completado, Cancelado) | Crítica |
| RF-031 | El sistema debe registrar el historial completo de mantenimientos por máquina | Crítica |
| RF-032 | El sistema debe permitir buscar mantenimientos por máquina, técnico, fecha o tipo | Alta |
| RF-033 | El sistema debe permitir filtrar mantenimientos por rango de fechas, estado, tipo y técnico | Alta |
| RF-034 | El sistema debe permitir editar un mantenimiento registrado | Alta |
| RF-035 | El sistema no debe permitir eliminar mantenimientos (solo cancelar) | Alta |
| RF-036 | El sistema debe validar que la fecha de mantenimiento no sea futura al registrar | Media |
| RF-037 | El sistema debe registrar automáticamente el usuario que crea/modifica el mantenimiento | Alta |

### 4.4 Catálogos Configurables

| ID | Requisito | Prioridad |
|---|---|---|
| RF-038 | El sistema debe permitir al administrador gestionar (CRUD) el catálogo de tipos de máquina | Alta |
| RF-039 | El sistema debe permitir al administrador gestionar (CRUD) el catálogo de tipos de mantenimiento | Alta |
| RF-040 | El sistema debe pre-cargar los tipos de mantenimiento: Preventivo, Correctivo, Predictivo, Inspección, Cambio de aceite, Cambio de filtros, Revisión general, Reparación, Otros | Alta |
| RF-041 | El sistema debe permitir activar/desactivar elementos del catálogo | Media |
| RF-042 | El sistema debe evitar la eliminación de catálogos en uso por registros existentes | Alta |

### 4.5 Sistema de Alertas y Notificaciones

| ID | Requisito | Prioridad |
|---|---|---|
| RF-043 | El sistema debe generar alertas automáticas cuando un mantenimiento está próximo a vencer (configurable: 7, 15, 30 días) | Crítica |
| RF-044 | El sistema debe generar alertas cuando un mantenimiento está vencido | Crítica |
| RF-045 | El sistema debe mostrar un indicador de alertas en el dashboard | Crítica |
| RF-046 | El sistema debe permitir al administrador configurar los días de anticipación para alertas | Alta |
| RF-047 | El sistema debe enviar notificaciones in-app cuando se genera una alerta | Alta |
| RF-048 | El sistema debe permitir marcar una alerta como vista/leída | Media |
| RF-049 | El sistema debe mostrar un contador de alertas pendientes en el header | Alta |

### 4.6 Dashboard y Reportes

| ID | Requisito | Prioridad |
|---|---|---|
| RF-050 | El sistema debe mostrar un dashboard principal con: total de máquinas, mantenimientos del mes, alertas activas, technicians disponibles | Crítica |
| RF-051 | El sistema debe mostrar un gráfico de mantenimientos por tipo (barras o torta) | Alta |
| RF-052 | El sistema debe mostrar un gráfico de tendencia de mantenimientos por mes | Alta |
| RF-053 | El sistema debe generar reporte de historial completo por máquina | Crítica |
| RF-054 | El sistema debe generar reporte de mantenimientos por rango de fechas | Alta |
| RF-055 | El sistema debe generar reporte de mantenimientos por técnico | Alta |
| RF-056 | El sistema debe generar reporte de estado de la flota (activas, en mantenimiento, inactivas) | Alta |
| RF-057 | El sistema debe generar reporte de cumplimiento (% de mantenimientos a tiempo) | Alta |
| RF-058 | El sistema debe permitir exportar reportes a PDF | Alta |
| RF-059 | El sistema debe permitir exportar reportes a CSV/Excel | Media |
| RF-060 | El sistema debe filtrar reportes por rango de fechas, tipo de máquina, tipo de mantenimiento y técnico | Alta |

### 4.7 Auditoría

| ID | Requisito | Prioridad |
|---|---|---|
| RF-061 | El sistema debe registrar cada acción realizada por los usuarios: login, logout, creación, edición, eliminación | Alta |
| RF-062 | El sistema debe almacenar: usuario, acción, fecha/hora, IP, datos antes/después | Alta |
| RF-063 | El sistema debe permitir al administrador consultar el log de auditoría | Alta |
| RF-064 | El sistema debe permitir filtrar auditoría por usuario, acción y fecha | Media |
| RF-065 | El sistema debe hacer inmutables los registros de auditoría | Alta |

### 4.8 Configuración del Sistema

| ID | Requisito | Prioridad |
|---|---|---|
| RF-066 | El sistema debe permitir al administrador configurar los parámetros de alertas | Alta |
| RF-067 | El sistema debe permitir al administrador gestionar las unidades de medida de horas | Media |
| RF-068 | El sistema debe permitir al administrador configurar la información de la empresa (nombre, logo) | Media |
| RF-069 | El sistema debe mostrar un log de actividad reciente en el dashboard del admin | Media |

### 4.9 Interfaz y Usabilidad

| ID | Requisito | Prioridad |
|---|---|---|
| RF-070 | La interfaz debe ser responsive (adaptarse a PC, tablet y móvil) | Crítica |
| RF-071 | El sistema debe funcionar en los navegadores: Chrome, Firefox, Safari, Edge (últimas 2 versiones) | Crítica |
| RF-072 | El sistema debe ofrecer una experiencia de usuario intuitiva que no requiera capacitación extensiva | Alta |
| RF-073 | El sistema debe mostrar indicadores de carga (spinners) durante operaciones asincrónicas | Alta |
| RF-074 | El sistema debe mostrar mensajes de error comprensibles al usuario | Alta |
| RF-075 | El sistema debe mantener la sesión del usuario activa mientras haya actividad | Alta |
| RF-076 | El sistema debe cerrar automáticamente la sesión tras 30 minutos de inactividad | Media |

---

## 5. Requisitos No Funcionales

### 5.1 Seguridad

| ID | Requisito | Prioridad |
|---|---|---|
| RNF-001 | El sistema debe cifrar todas las contraseñas con bcrypt (min 12 rounds) | Crítica |
| RNF-002 | El sistema debe implementar HTTPS/TLS 1.2+ en todas las comunicaciones | Crítica |
| RNF-003 | El sistema debe mitigar los 10 vectores OWASP Top 10 | Crítica |
| RNF-004 | El sistema debe implementar rate limiting en endpoints de autenticación | Crítica |
| RNF-005 | El sistema debe implementar CORS restrictivo | Alta |
| RNF-006 | El sistema debe sanitizar todas las entradas del usuario | Crítica |
| RNF-007 | El sistema debe implementar Content Security Policy (CSP) | Alta |
| RNF-008 | El sistema debe implementar headers de seguridad (X-Frame-Options, HSTS, etc.) | Alta |
| RNF-009 | Los JWT deben expirar en 15 minutos (access token) | Crítica |
| RNF-010 | Los Refresh Tokens deben expirar en 7 días | Alta |

### 5.2 Rendimiento

| ID | Requisito | Prioridad |
|---|---|---|
| RNF-011 | El tiempo de respuesta de la API no debe exceder 500ms (P95) | Alta |
| RNF-012 | El tiempo de carga inicial de la aplicación no debe exceder 3 segundos | Alta |
| RNF-013 | El sistema debe soportar al menos 100 usuarios concurrentes | Alta |
| RNF-014 | La base de datos debe responder consultas en menos de 100ms (P95) | Alta |
| RNF-015 | El sistema debe implementar caché para datos de catálogos | Media |
| RNF-016 | El frontend debe implementar lazy loading de componentes | Media |

### 5.3 Disponibilidad

| ID | Requisito | Prioridad |
|---|---|---|
| RNF-017 | El sistema debe mantener 99.5% de uptime mensual | Alta |
| RNF-018 | El sistema debe implementar health checks automatizados | Alta |
| RNF-019 | El sistema debe tener tolerancia a fallos en componentes no críticos | Media |
| RNF-020 | El sistema debe implementar restart automático en caso de fallo | Alta |

### 5.4 Escalabilidad

| ID | Requisito | Prioridad |
|---|---|---|
| RNF-021 | La arquitectura debe permitir escalar horizontalmente los servicios backend | Alta |
| RNF-022 | La base de datos debe manejar al menos 1 millón de registros de mantenimiento | Media |
| RNF-023 | El sistema debe soportar el crecimiento de 50 a 500 máquinas sin rediseño | Alta |
| RNF-024 | Los servicios deben ser stateless para permitir múltiples instancias | Alta |

### 5.5 Auditoría y Compliance

| ID | Requisito | Prioridad |
|---|---|---|
| RNF-025 | Todos los registros de auditoría deben ser inmutables | Alta |
| RNF-026 | Los logs de auditoría deben retenerse por un mínimo de 2 años | Media |
| RNF-027 | El sistema debe registrar la IP del usuario en cada acción | Alta |
| RNF-028 | Los registros de auditoría deben ser consultables por rango de fechas y usuario | Alta |

### 5.6 Backups y Recuperación

| ID | Requisito | Prioridad |
|---|---|---|
| RNF-029 | Los backups de la base de datos deben realizarse diariamente (automático) | Crítica |
| RNF-030 | Los backups deben almacenarse en una ubicación geográfica diferente | Alta |
| RNF-031 | El sistema debe poder restaurarse desde backup en menos de 4 horas (RTO) | Alta |
| RNF-032 | La pérdida máxima de datos aceptable es de 24 horas (RPO) | Alta |
| RNF-033 | Los backups deben retenerse por 30 días | Media |

### 5.7 Observabilidad

| ID | Requisito | Prioridad |
|---|---|---|
| RNF-034 | El sistema debe implementar logging estructurado (JSON) | Alta |
| RNF-035 | El sistema debe implementar métricas de aplicación (request rate, error rate, latency) | Alta |
| RNF-036 | El sistema debe implementar alertas de monitoreo (uptime, errores, latencia) | Alta |
| RNF-037 | Los logs deben ser centralizados y consultables | Media |
| RNF-038 | El sistema debe implementar distributed tracing para requests | Media |

### 5.8 Mantenibilidad

| ID | Requisito | Prioridad |
|---|---|---|
| RNF-039 | El código debe seguir estándares de code review obligatorio | Alta |
| RNF-040 | La cobertura de tests automatizados debe ser > 80% | Alta |
| RNF-041 | La documentación técnica debe actualizarse con cada release | Media |
| RNF-042 | El sistema debe implementar versionado de API (v1, v2) | Media |

---

## 6. Restricciones

### 6.1 Restricciones Técnicas

| ID | Restricción | Justificación |
|---|---|---|
| RES-01 | La aplicación debe ser una SPA web responsive (no app nativa) | Reducir costos de desarrollo y mantenimiento |
| RES-02 | Debe funcionar en los 4 navegadores principales (Chrome, Firefox, Safari, Edge) | Cobertura de mercado |
| RES-03 | La infraestructura debe ser Dockerizable | Portabilidad y consistencia de ambientes |
| RES-04 | La base de datos debe ser relacional (PostgreSQL) | Integridad referencial y transaccionalidad |
| RES-05 | La API debe ser RESTful con formato JSON | Estándar de la industria, interoperabilidad |
| RES-06 | El código fuente debe estar en un repositorio Git | Control de versiones |

### 6.2 Restricciones de Negocio

| ID | Restricción | Justificación |
|---|---|---|
| RES-07 | El sistema debe estar en español | Mercado objetivo LATAM |
| RES-08 | La interfaz debe ser usable sin capacitación extensiva | Técnicos con variedad de nivel técnico |
| RES-09 | El presupuesto del proyecto es de $35,000-50,000 USD | Limitación financiera |
| RES-10 | El plazo de entrega es de 12 semanas (6 sprints) | Compromiso comercial |

### 6.3 Restricciones Regulatorias

| ID | Restricción | Justificación |
|---|---|---|
| RES-11 | Cumplimiento con OWASP Top 10 | Estándar de seguridad |
| RES-12 | Protección de datos personales (si aplica LGPD/RGPD) | Protección de datos de usuarios |
| RES-13 | Retención de logs de auditoría por 2 años mínimo | Cumplimiento empresarial |

---

## 7. Dependencias

### 7.1 Dependencias Internas

| ID | Dependencia | Tipo | Impacto |
|---|---|---|---|
| DEP-01 | Aprobación del presupuesto por Gerencia General | Bloqueante | Sin aprobación no inicia desarrollo |
| DEP-02 | Designación del Product Owner por parte de la empresa | Bloqueante | Sin PO no hay definición de requisitos |
| DEP-03 | Provisión de datos iniciales (lista de máquinas, técnicos) | Bloqueante | Necesario para testing y migración |
| DEP-04 | Acceso a infraestructura cloud del cliente | Bloqueante | Necesario para despliegue |
| DEP-05 | Definición de branding corporativo (colores, logo) | No bloqueante | Puede usar defaults |

### 7.2 Dependencias Externas

| ID | Dependencia | Tipo | Impacto |
|---|---|---|---|
| DEP-06 | Proveedor de infraestructura cloud (AWS/Azure/GCP) | Bloqueante | Necesario para hosting |
| DEP-07 | Servicio de envío de emails (SendGrid/SES) | No bloqueante | Para notificaciones por email (fase 2) |
| DEP-08 | Herramienta de CI/CD (GitHub Actions/GitLab CI) | No bloqueante | Puede usarse alternativa |
| DEP-09 | Licencias de herramientas de diseño (Figma) | No bloqueante | Puede usar alternativas |

---

## 8. Casos de Uso

### 8.1 Caso de Uso: CU-001 Iniciar Sesión

**Nombre:** Iniciar Sesión
**ID:** CU-001
**Actor Principal:** Cualquier usuario
**Precondiciones:** El usuario tiene una cuenta activa en el sistema
**Postcondiciones:** El usuario accede al sistema y se le asigna un token JWT

**Flujo Principal:**
1. El usuario ingresa a la página de login
2. El sistema muestra el formulario con campos: email y contraseña
3. El usuario ingresa su email y contraseña
4. El sistema valida las credenciales
5. El sistema genera un JWT access token y un refresh token
6. El sistema redirige al dashboard según el rol del usuario
7. El sistema registra el evento de login en auditoría

**Flujos Alternativos:**
- 4a. Credenciales inválidas: El sistema muestra "Email o contraseña incorrectos"
- 4b. Cuenta bloqueada: El sistema muestra "Cuenta bloqueada. Contacte al administrador"
- 4c. Contraseña expirada: El sistema redirige a cambio de contraseña

**Flujos de Excepción:**
- Error de conexión: El sistema muestra "Error de conexión. Intente nuevamente"

---

### 8.2 Caso de Uso: CU-002 Registrar Máquina

**Nombre:** Registrar Máquina
**ID:** CU-002
**Actor Principal:** Administrador, Supervisor
**Precondiciones:** El usuario está autenticado con rol adecuado
**Postcondiciones:** La máquina queda registrada en el sistema con estado "Activa"

**Flujo Principal:**
1. El usuario navega a la sección de Máquinas
2. El usuario hace clic en "Nueva Máquina"
3. El sistema muestra el formulario de registro
4. El usuario completa los campos obligatorios: código interno, nombre, tipo, marca, modelo, número de serie, año
5. El sistema valida la información (campos requeridos, formato, unicidad del código)
6. El usuario confirma el registro
7. El sistema guarda la máquina con ID único 自动生成, estado "Activa" y fecha de alta automática
8. El sistema muestra mensaje de éxito
9. El sistema registra la acción en auditoría

**Flujos Alternativos:**
- 5a. Código interno duplicado: El sistema muestra "El código ya existe. Ingrese uno diferente"
- 5a. Campos obligatorios vacíos: El sistema resalta los campos requeridos

---

### 8.3 Caso de Uso: CU-003 Registrar Mantenimiento

**Nombre:** Registrar Mantenimiento
**ID:** CU-003
**Actor Principal:** Supervisor, Técnico
**Precondiciones:** El usuario está autenticado, la máquina está registrada
**Postcondiciones:** El mantenimiento queda registrado, se actualiza el cálculo del próximo servicio

**Flujo Principal:**
1. El usuario navega a la sección de Mantenimientos
2. El usuario hace clic en "Nuevo Mantenimiento"
3. El sistema muestra el formulario
4. El usuario selecciona la máquina (autocomplete o listado)
5. El sistema muestra las horas actuales registradas de la máquina
6. El usuario ingresa: fecha de recepción, tipo de mantenimiento, descripción, observaciones, horas actuales de uso
7. El sistema calcula automáticamente las horas hasta próximo mantenimiento y fecha estimada
8. El usuario confirma el registro
9. El sistema guarda el mantenimiento con estado "Programado"
10. El sistema actualiza el estado de la máquina a "En Mantenimiento"
11. El sistema registra la acción en auditoría

**Flujos Alternativos:**
- 7a. Si el tipo es "Cambio de aceite": El sistema usa el intervalo configurado para ese tipo
- 7b. Si no hay datos de horas previos: El sistema permite ingresar las horas manualmente

---

### 8.4 Caso de Uso: CU-004 Calcular Próximo Mantenimiento

**Nombre:** Calcular Próximo Mantenimiento
**ID:** CU-004
**Actor Principal:** Sistema (automático)
**Precondiciones:** Hay un mantenimiento registrado con horas de uso
**Postcondiciones:** Se calcula y almacena la fecha del próximo mantenimiento

**Flujo Principal:**
1. Al registrar o completar un mantenimiento, el sistema obtiene:
   - Horas actuales de uso de la máquina
   - Intervalo de horas configurado para el tipo de mantenimiento
2. El sistema calcula: Horas hasta próximo = Intervalo - Horas actuales
3. El sistema calcula la fecha estimada basándose en promedio de horas diarias de uso
4. El sistema almacena: horas hasta próximo y fecha estimada
5. El sistema programa una alerta para 15 días antes de la fecha estimada

---

### 8.5 Caso de Uso: CU-005 Generar Alertas

**Nombre:** Generar Alertas de Mantenimiento
**ID:** CU-005
**Actor Principal:** Sistema (automático)
**Precondiciones:** Hay mantenimientos programados con fechas calculadas
**Postcondiciones:** Se generan alertas visibles en el dashboard

**Flujo Principal:**
1. El sistema ejecuta una tarea programada diaria
2. El sistema consulta todos los mantenimientos con fecha estimada próxima
3. Para cada mantenimiento, el sistema calcula los días restantes
4. Si los días restantes <= días de anticipación configurados (ej: 15):
   - El sistema crea una alerta de tipo "Próximo"
   - El sistema envía notificación in-app al jefe de mantenimiento
5. Si la fecha ya pasó:
   - El sistema crea una alerta de tipo "Vencido"
   - El sistema envía notificación in-app y email al supervisor
6. El sistema actualiza el contador de alertas en el dashboard

---

### 8.6 Caso de Uso: CU-006 Consultar Historial de Máquina

**Nombre:** Consultar Historial de Máquina
**ID:** CU-006
**Actor Principal:** Cualquier usuario autenticado
**Precondiciones:** La máquina está registrada y tiene al menos un mantenimiento
**Postcondiciones:** Se muestra el historial completo de mantenimientos

**Flujo Principal:**
1. El usuario navega a Máquinas
2. El usuario busca y selecciona una máquina
3. El sistema muestra el detalle de la máquina
4. El usuario hace clic en "Historial de Mantenimientos"
5. El sistema muestra la lista cronológica de mantenimientos con: fecha, tipo, descripción, técnico, horas, estado
6. El usuario puede filtrar por tipo, estado o rango de fechas
7. El usuario puede exportar el historial a PDF o CSV

---

### 8.7 Caso de Uso: CU-007 Generar Reporte

**Nombre:** Generar Reporte
**ID:** CU-007
**Actor Principal:** Supervisor, Administrador, Consulta
**Precondiciones:** El usuario está autenticado con permisos de reportes
**Postcondiciones:** Se genera y muestra el reporte solicitado

**Flujo Principal:**
1. El usuario navega a la sección de Reportes
2. El sistema muestra los tipos de reporte disponibles
3. El usuario selecciona el tipo de reporte
4. El usuario configura los filtros (rango de fechas, tipo de máquina, etc.)
5. El usuario hace clic en "Generar"
6. El sistema consulta la base de datos
7. El sistema muestra el reporte con gráficos y tabla de datos
8. El usuario puede exportar a PDF o CSV

---

### 8.8 Caso de Uso: CU-008 Gestionar Usuarios

**Nombre:** Gestionar Usuarios
**ID:** CU-008
**Actor Principal:** Administrador
**Precondiciones:** El usuario está autenticado como administrador
**Postcondiciones:** Los usuarios quedan creados, editados o desactivados

**Flujo Principal:**
1. El administrador navega a Configuración > Usuarios
2. El sistema muestra la lista de usuarios
3. El administrador puede:
   - Crear nuevo usuario (email, nombre, rol, contraseña temporal)
   - Editar usuario existente (nombre, rol, estado)
   - Desactivar usuario (sin eliminar)
4. El sistema valida la información
5. El sistema guarda los cambios
6. El sistema registra la acción en auditoría

---

### 8.9 Caso de Uso: CU-009 Consultar Auditoría

**Nombre:** Consultar Auditoría
**ID:** CU-009
**Actor Principal:** Administrador
**Precondiciones:** El usuario está autenticado como administrador
**Postcondiciones:** Se muestra el log de auditoría filtrado

**Flujo Principal:**
1. El administrador navega a Configuración > Auditoría
2. El sistema muestra el log de auditoría con paginación
3. El administrador puede filtrar por: usuario, acción, rango de fechas
4. El sistema muestra los resultados con: fecha/hora, usuario, acción, IP, detalles
5. El administrador puede exportar el log a CSV

---

### 8.10 Caso de Uso: CU-010 Gestionar Catálogos

**Nombre:** Gestionar Catálogos
**ID:** CU-010
**Actor Principal:** Administrador
**Precondiciones:** El usuario está autenticado como administrador
**Postcondiciones:** Los catálogos quedan actualizados

**Flujo Principal:**
1. El administrador navega a Configuración > Catálogos
2. El sistema muestra los catálogos disponibles (tipos de máquina, tipos de mantenimiento)
3. El administrador selecciona un catálogo
4. El administrador puede:
   - Agregar nuevo elemento
   - Editar elemento existente
   - Activar/desactivar elemento
5. El sistema valida que no se desactive un elemento en uso
6. El sistema guarda los cambios

---

## 9. Riesgos

### 9.1 Matriz de Riesgos

| ID | Riesgo | Probabilidad | Impacto | Severidad | Mitigación |
|---|---|---|---|---|---|
| R-01 | Resistencia al cambio por parte de los técnicos | Alta | Alto | Crítico | Interfaz ultra-simple, capacitación intensiva, gamificación |
| R-02 | Falta de datos iniciales para migración | Media | Alto | Alto | Planificar recolección de datos desde sprint 1 |
| R-03 | Cambios en los requisitos durante el desarrollo | Media | Alto | Alto | Definition of Ready estricta, buffer en sprints |
| R-04 | Problemas de conectividad en obras | Alta | Medio | Alto | Considerar funcionalidad offline en fase 2 |
| R-05 | Seguridad insuficiente | Baja | Crítico | Alto | Auditoría de seguridad, pentesting pre-lanzamiento |
| R-06 | Retraso en aprobaciones internas del cliente | Media | Alto | Alto | Agenda de reuniones fijas, SLA de respuestas |
| R-07 | Fallo en infraestructura cloud | Baja | Alto | Medio | Backups diarios, plan de recuperación |
| R-08 | Sobrecosto del proyecto | Media | Medio | Medio | Buffer de 12% en presupuesto, seguimiento semanal |
| R-09 | Baja adopción post-lanzamiento | Media | Alto | Alto | Involucrar usuarios desde diseño, piloto controlado |
| R-10 | Integridad de datos al migrar de Excel | Media | Medio | Medio | Validación cruzada, período de rodaje paralelo |

### 9.2 Plan de Contingencia

| Escenario | Contingencia |
|---|---|
| El cliente no entrega datos a tiempo | Usar datos de prueba, permitir carga manual posterior |
| Un desarrollador clave abandona el proyecto | Documentación exhaustiva, código revisado por pares |
| Vulnerabilidad de seguridad descubierta | Proceso de patch en < 24h para críticas |
| El sistema no soporta la carga esperada | Escalar infraestructura horizontalmente |
| Los usuarios rechazan la herramienta | Sesiones de feedback, iteración rápida de UX |

---

## 10. Roadmap

### 10.1 Vista General

| Fase | Sprint | Duración | Objetivo Principal |
|---|---|---|---|
| Fundamentos | Sprint 0 | 2 semanas | Setup, arquitectura, CI/CD |
| Core Auth | Sprint 1 | 2 semanas | Auth, RBAC, primeros CRUDs |
| Core Data | Sprint 2 | 2 semanas | CRUD máquinas, catálogos, mantenimientos |
| Core Logic | Sprint 3 | 2 semanas | Cálculos, alertas, dashboard básico |
| Reports | Sprint 4 | 2 semanas | Reportes, exportación, auditoría |
| Polish | Sprint 5 | 2 semanas | UI/UX, testing, optimización |
| Launch | Sprint 6 | 2 semanas | Despliegue, capacitación, go-live |

### 10.2 Detalle por Sprint

Ver [FASE 13 - Roadmap](../13-roadmap/) para detalle completo de cada sprint.

### 10.3 Hitos Clave

| Hito | Fecha Estimada | Dependencias |
|---|---|---|
| Aprobación del PRD | Semana 0 | Gerencia General |
| Arquitectura aprobada | Semana 1 | Gerente IT |
| Primer demo funcional | Semana 4 | Desarrolladores |
| Beta interna | Semana 8 | Datos de prueba |
| UAT con usuarios reales | Semana 10 | Usuarios designados |
| Go-live | Semana 12 | Todos los aprobados |

---

## A. Glosario

| Término | Definición |
|---|---|
| CMMS | Computerized Maintenance Management System |
| RBAC | Role-Based Access Control |
| JWT | JSON Web Token |
| OWASP | Open Web Application Security Project |
| SPA | Single Page Application |
| UAT | User Acceptance Testing |
| PBR | Preventive Based Maintenance |
| SLA | Service Level Agreement |
| RTO | Recovery Time Objective |
| RPO | Recovery Point Objective |
| KPI | Key Performance Indicator |
| NPS | Net Promoter Score |
| ROI | Return on Investment |

---

## B. Historial de Versiones

| Versión | Fecha | Autor | Cambios |
|---|---|---|---|
| 1.0 | 26/08/2026 | Product Owner | Versión inicial |

---

*PRD aprobado por: [Pendiente]*
*Fecha de aprobación: [Pendiente]*
