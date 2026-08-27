# Documento de Visión del Producto

## MantenimientoPlus - Plataforma de Gestión de Mantenimiento de Maquinaria

**Versión:** 1.0
**Fecha:** 26 de Agosto de 2026
**Estado:** Borrador
**Autor:** Equipo de Producto

---

## 1. Problema

### 1.1 Descripción del Problema

La empresa de construcción actualmente gestiona el mantenimiento de su flota de maquinaria de forma completamente manual, utilizando herramientas básicas como hojas de cálculo (Excel), cuadernos de registro y comunicación verbal entre los técnicos y supervisores.

Esta situación genera los siguientes problemas críticos:

**Pérdida económica directa:**
- Roturas inesperadas de maquinaria que detienen operaciones por un promedio de 3-5 días por incidente
- Costo promedio de reparación correctiva: 3-5 veces mayor que el mantenimiento preventivo equivalente
- Pérdida estimada de productividad: 15-25% de la capacidad operativa total anual

**Falta de trazabilidad:**
- Imposibilidad de rastrear el historial completo de mantenimientos de cada máquina
- Pérdida de registros escritos
- Duplicidad de registros contradictorios
- Ausencia de evidencia documental para auditorías

**Fallas operativas:**
- Olvido de mantenimientos programados por falta de sistema de alertas
- Asignación ineficiente de técnicos por falta de visibilidad de carga de trabajo
- Imposibilidad de generar reportes confiables para toma de decisiones
- Falta de estándares en los procedimientos de mantenimiento

**Riesgos de seguridad:**
- Maquinaria operando sin revisiones de seguridad
- Incumplimiento de normativas industriales de mantenimiento
- Posibles accidentes por equipos en mal estado no detectado

### 1.2 Magnitud del Problema

| Indicador | Valor Actual |
|---|---|
| Flota de maquinaria | 50-200 unidades estimadas |
| Mantenimientos realizados mensualmente | 30-80 |
| Incidentes por mantenimiento omitido | 3-8 por trimestre |
| Costo promedio por incidente | $5,000 - $50,000 USD |
| Tiempo promedio de registro manual | 30-45 min por mantenimiento |
| Errores en registros manuales | 15-20% |

### 1.3 Causa Raíz

La causa fundamental es la **ausencia de una herramienta tecnológica centralizada** que permita:
1. Registrar y consultar información de mantenimiento de forma estructurada
2. Automatizar cálculos de próximos mantenimientos
3. Generar alertas proactivas
4. Proveer visibilidad en tiempo real al equipo gerencial

---

## 2. Oportunidad

### 2.1 Mercado Objetivo

El mercado de gestión de mantenimiento de activos (Asset Management) está en crecimiento acelerado:

- **Mercado global de CMMS (Computerized Maintenance Management Systems):** $1.2 mil millones USD en 2025, proyectado a $2.1 mil millones para 2030 (CAGR 11.2%)
- **Sector construcción:** Representa el 35% del mercado de CMMS
- **Adopción digital:** El 62% de las empresas de construcción planean digitalizar sus procesos de mantenimiento en los próximos 3 años

### 2.2 Valor para el Negocio

| Beneficio | Impacto Estimado |
|---|---|
| Reducción de averías no planificadas | 30-50% |
| Reducción de costos de mantenimiento | 15-25% |
| Aumento de vida útil de maquinaria | 20-30% |
| Reducción de tiempo de inactividad | 25-40% |
| Mejora en cumplimiento normativo | 90-100% |
| ROI estimado del proyecto | 180-250% en primer año |

### 2.3 Ventaja Competitiva

La solución propuesta ofrece ventajas diferenciales:

1. **Personalización sectorial:** Diseñada específicamente para empresas de construcción, no un CMMS genérico
2. **Simplicidad de uso:** Interfaz intuitiva que no requiere capacitación extensiva
3. **Accesibilidad multiplataforma:** Funciona en PC, tablet y móvil, incluyendo áreas de obra con conectividad limitada
4. **Costo accesible:** Modelo de suscripción adaptado al mercado latinoamericano
5. **Escalabilidad:** Crece con la empresa sin necesidad de migración

---

## 3. Objetivos

### 3.1 Objetivo General

Desarrollar e implementar una plataforma web responsive que centralice la gestión del mantenimiento preventivo y correctivo de la flota de maquinaria de la empresa, proporcionando trazabilidad completa, alertas automatizadas y reportes confiables para la toma de decisiones.

### 3.2 Objetivos Específicos

**Objetivo 1: Centralización de Información**
- Crear un repositorio único y confiable de toda la información de maquinaria y mantenimientos
- Eliminar la dependencia de herramientas no estructuradas (Excel, papel)
- Asegurar la integridad y disponibilidad de los datos

**Objetivo 2: Automatización de Procesos**
- Calcular automáticamente las fechas de próximo mantenimiento basado en horas de uso y tipo de mantenimiento
- Generar alertas proactivas por mantenimientos próximos o vencidos
- Reducir el tiempo de registro de mantenimientos en un 70%

**Objetivo 3: Trazabilidad y Auditoría**
- Mantener un historial completo e inmutable de cada máquina
- Registrar todas las acciones de los usuarios (audit trail)
- Generar evidencia documental para cumplimiento normativo

**Objetivo 4: Visibilidad y Reportes**
- Proveer dashboards en tiempo real para supervisores y gerencia
- Generar reportes operativos, gerenciales y de cumplimiento
- Facilitar la toma de decisiones basada en datos

**Objetivo 5: Seguridad y Cumplimiento**
- Implementar control de acceso basado en roles
- Cumplir con estándares de seguridad OWASP Top 10
- Establecer políticas de auditoría y respaldo de datos

### 3.3 Objetivos SMART

| Objetivo | Específico | Medible | Alcanzable | Relevante | Temporal |
|---|---|---|---|---|---|
| Reducir mantenimientos omitidos | Eliminar olvidos de mantenimientos programados | 100% de alertas activas | Sistema de notificaciones | Prevenir roturas | Sprint 3 |
| Reducir tiempo de registro | De 45 min a menos de 5 min por registro | 89% reducción | Formularios optimizados | Eficiencia operativa | Sprint 2 |
| Historial 100% digital | Toda maquinaria con historial completo | 100% cobertura | Migración de datos existentes | Trazabilidad | Sprint 4 |
| Dashboard gerencial | Reportes automáticos en tiempo real | 6 reportes clave | Integración de datos | Decisiones informadas | Sprint 3 |
| Disponibilidad del sistema | 99.5% uptime | Monitoreo continuo | Infraestructura redundante | Continuidad operativa | Go-live |

---

## 4. Stakeholders

### 4.1 Stakeholders Primarios

| Stakeholder | Rol | Interés | Nivel de Influencia |
|---|---|---|---|
| Gerencia General | Sponsor del proyecto | Alto | Muy Alto |
| Gerente de Operaciones | Usuario ejecutivo | Muy Alto | Alto |
| Jefe de Mantenimiento | Usuario principal directo | Muy Alto | Alto |
| Supervisor de Mantenimiento | Usuario frecuente | Alto | Medio |
| Técnico de Mantenimiento | Usuario operativo | Alto | Bajo |
| Departamento de IT | Soporte técnico interno | Medio | Alto |
| Contabilidad/Finanzas | Consumidor de reportes | Medio | Medio |

### 4.2 Stakeholders Secundarios

| Stakeholder | Rol | Interés | Nivel de Influencia |
|---|---|---|---|
| Operadores de maquinaria | Proveedor de información de horas | Medio | Bajo |
| Proveedores externos | Servicios de mantenimiento especializado | Bajo | Bajo |
| Auditores internos | Revisión de cumplimiento | Medio | Medio |
| Auditor externo (opcional) | Certificaciones ISO | Bajo | Bajo |

### 4.3 Análisis de Impacto

**Alto impacto / Alto interés (Gestionar de cerca):**
- Gerencia General
- Gerente de Operaciones
- Jefe de Mantenimiento

**Alto impacto / Bajo interés (Mantener satisfechos):**
- Departamento de IT
- Contabilidad

**Bajo impacto / Alto interés (Mantener informados):**
- Supervisores de Mantenimiento
- Técnicos

**Bajo impacto / Bajo interés (Monitorear):**
- Proveedores externos

---

## 5. Alcance

### 5.1 Incluido en el Alcance (In-Scope)

#### Gestión de Maquinarias
- Registro completo de máquinas con todos los campos especificados
- Catálogo configurable de tipos de máquina
- Estados de máquina (Activa, En Mantenimiento, Inactiva, Dada de Baja)
- Búsqueda, filtrado y ordenamiento de máquinas
- Exportación de listado de máquinas

#### Gestión de Mantenimientos
- Registro completo de mantenimientos preventivos y correctivos
- Catálogo configurable de tipos de mantenimiento
- Cálculo automático de fecha próximo mantenimiento
- Seguimiento de horas de uso y horas hasta próximo mantenimiento
- Estados de mantenimiento (Programado, En Proceso, Completado, Cancelado)
- Historial completo por máquina
- Registro del técnico responsable

#### Sistema de Alertas
- Alertas por mantenimientos próximos a vencer
- Alertas por mantenimientos vencidos
- Notificaciones in-app
- Resumen de alertas en dashboard

#### Dashboard y Reportes
- Panel principal con métricas clave (KPIs)
- Listado de mantenimientos próximos
- Estado de la flota de maquinaria
- Reporte de historial por máquina
- Reporte de mantenimientos por período
- Reporte de technician workload
- Exportación de reportes a PDF

#### Gestión de Usuarios
- Registro de usuarios con roles y permisos
- Autenticación segura (JWT + Refresh Tokens)
- Control de acceso basado en roles (RBAC)
- Gestión de perfiles de usuario

#### Auditoría
- Registro de acciones críticas (login, altas, bajas, modificaciones)
- Log de auditoría inmutable
- Visualización de auditoría para administradores

#### Configuración del Sistema
- Gestión de catálogos (tipos de máquina, tipos de mantenimiento)
- Parámetros de alertas (días de anticipación)
- Configuración de notificaciones

### 5.2 Fuera de Alcance (Out-of-Scope)

| Elemento | Razón de Exclusión |
|---|---|
| Gestión de inventario de repuestos | Fase 2 del proyecto |
| Gestión de compras y presupuestos | Sistema ERP existente |
| GPS/Tracking de maquinaria en tiempo real | Requiere hardware IoT externo |
| Integración con sistemas ERP | Fase 2 - requiere análisis de APIs |
| Aplicación nativa móvil | Se resuelve con PWA responsive |
| Gestión de documentos técnicos adjuntos | Fase 2 |
| Módulo de capacitación de técnicos | Fuera del alcance actual |
| Predicción con Machine Learning | Fase 3 - Predictive Analytics |
| Multi-idioma (internacionalización) | Mercado actual es hispanohablante |
| App offline completa | Se considera para fase 2 |

### 5.3 Supuestos

1. La empresa cuenta con infraestructura de servidor (on-premise o cloud) para desplegar la aplicación
2. Los usuarios tendrán acceso a dispositivos con navegador web actualizado
3. La empresa proporcionará los datos iniciales de máquinas y técnicos para la migración
4. Existe al menos un administrador técnico interno que dará soporte
5. El dominio de la aplicación será accesible desde la red interna y externa
6. La empresa cuenta con conexión a internet estable en sus oficinas principales
7. El presupuesto aprobado permite el ciclo de desarrollo de 6 sprints

### 5.4 Restricciones

1. El sistema debe funcionar en navegadores modernos (Chrome, Firefox, Safari, Edge - últimas 2 versiones)
2. La interfaz debe ser responsive (PC, tablet, móvil)
3. Debe implementarse seguridad según estándares OWASP Top 10
4. Los datos deben respaldarse diariamente
5. El despliegue debe ser compatible con Docker
6. La documentación técnica debe estar en español

---

## 6. Criterios de Éxito

### 6.1 Criterios de Éxito del Producto

| Criterio | Métrica | Meta |
|---|---|---|
| Adopción | % de técnicos usando el sistema diariamente | > 80% en 3 meses post-lanzamiento |
| Cobertura | % de máquinas registradas en el sistema | 100% en 2 meses post-lanzamiento |
| Oportunidad | % de mantenimientos programados completados a tiempo | > 95% |
| Eficiencia | Tiempo promedio de registro de mantenimiento | < 5 minutos |
| Satisfacción | NPS (Net Promoter Score) de usuarios | > 7/10 |
| Disponibilidad | Uptime del sistema | > 99.5% |
| Seguridad | Vulnerabilidades críticas abiertas | 0 |

### 6.2 Criterios de Éxito del Proyecto

| Criterio | Métrica | Meta |
|---|---|---|
| Cumplimiento de plazos | % de sprints completados en tiempo | > 90% |
| Calidad | Bugs críticos en producción post-lanzamiento | 0 |
| Presupuesto | Variación respecto al presupuesto estimado | < 10% |
| Documentación | Cobertura de documentación entregada | 100% |

---

## 7. Métricas del Producto (Post-Lanzamiento)

### 7.1 Métricas de Uso

- **DAU/MAU** (Daily/Monthly Active Users)
- **Sesiones promedio por usuario por día**
- **Tiempo promedio de sesión**
- **Tasa de retención a 30 días**
- **Funcionalidades más utilizadas** (feature adoption)

### 7.2 Métricas de Negocio

- **Número de mantenimientos registrados por mes**
- **Reducción de mantenimientos no planificados (mes a mes)**
- **Tiempo promedio de respuesta a alertas**
- **Ratio de mantenimiento preventivo vs correctivo**
- **Costo estimado de ahorro por reducción de fallas**

### 7.3 Métricas Técnicas

- **Tiempo de respuesta de API (P50, P95, P99)**
- **Tasa de error HTTP (4xx, 5xx)**
- **Uptime del sistema**
- **Tiempo de carga de páginas**
- **Tasa de errores JavaScript en cliente**

---

## 8. Roadmap de Alto Nivel

| Fase | Duración | Objetivo Principal |
|---|---|---|
| Fase 1: Fundamentos | Sprints 1-2 | Autenticación, RBAC, CRUD de máquinas, catálogos |
| Fase 2: Core | Sprints 3-4 | Gestión de mantenimientos, cálculos, alertas |
| Fase 3: Inteligencia | Sprints 5-6 | Dashboard, reportes, auditoría, configuración |
| Fase 4: Optimización | Post-lanzamiento | Mejoras basadas en feedback, fase 2 del producto |

---

## 9. Equipo del Producto

| Rol | Responsabilidad |
|---|---|
| Product Owner | Definición de requisitos, priorización del backlog |
| Scrum Master | Facilitación de procesos Agile, remoción de impedimentos |
| Tech Lead | Decisiones técnicas, revisión de código |
| Desarrolladores (2-3) | Desarrollo frontend y backend |
| Diseñador UX/UI | Diseño de interfaz y experiencia de usuario |
| QA | Planificación y ejecución de pruebas |
| DevOps | Infraestructura, CI/CD, despliegue |

---

## 10. Próximos Pasos

1. **Aprobación del documento de visión** por parte de la Gerencia General
2. **Validación del alcance** con todos los stakeholders clave
3. **Inscripción en sprint 0** para configuración del equipo y herramientas
4. **Inicio del desarrollo** según roadmap aprobado

---

*Documento sujeto a revisión y aprobación por los stakeholders designados.*
