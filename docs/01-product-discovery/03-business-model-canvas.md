# Business Model Canvas

## MantenimientoPlus - Plataforma de Gestión de Mantenimiento de Maquinaria

**Versión:** 1.0
**Fecha:** 26 de Agosto de 2026

---

## Canvas Completo

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                              BUSINESS MODEL CANVAS                                                  │
├──────────────────┬──────────────────┬──────────────────┬──────────────────┬──────────────────────────┤
│                  │                  │                  │                  │                          │
│  PARTE           │  ACTIVIDADES     │  PROPUESTA       │  RELACIONES      │  SEGMENTOS               │
│  CLAVE           │  CLAVE           │  DE VALOR        │  DE CLIENTES     │  DE CLIENTES             │
│                  │                  │                  │                  │                          │
│ - Desarrollo de  │ - Desarrollo y   │ Centraliza la    │ Soporte técnico  │ Primario:                │
│   software       │   mantenimiento  │ gestión de       │ continuo         │ - Empresas de            │
│ - Plataforma     │   continuo       │ mantenimiento    │                  │   construcción           │
│   cloud          │                  │ de maquinaria    │ Capacitación     │   medianas               │
│   (AWS/Azure)    │ - Soporte al     │                  │ inicial          │   (50-200 máquinas)      │
│ - Equipo de      │   usuario        │ Dashboard        │                  │                          │
│   desarrollo     │                  │ intuitivo con    │ Onboarding       │ Secundario:              │
│   (3 devs)       │ - Monitoreo de   │ alertas auto-    │ guiado           │ - Empresas grandes       │
│ - Base de datos   │   seguridad      │ máticas          │                  │   (200+ máquinas)        │
│   (PostgreSQL)   │                  │                  │ Reuniones de     │                          │
│ - Herramientas   │ - Actualización  │ Ahorro del       │ seguimiento      │ Terciario:               │
│   de CI/CD       │   de catálogos   │ 30-50% en costos │ mensual          │ - Subcontratistas de     │
│                  │                  │ de mantenimiento │                  │   mantenimiento          │
│                  │                  │ no planificado   │                  │                          │
├──────────────────┴──────────────────┼──────────────────┴──────────────────┴──────────────────────────┤
│                                     │                                                                │
│  RECURSOS CLAVE                     │  CANALES                                                      │
│                                     │                                                                │
│ - Código fuente de la aplicación    │ - Website corporativa                                          │
│ - Infraestructura cloud             │ - Demo en vivo (on-site y remoto)                             │
│ - Equipo de desarrollo (3 personas) │ - Implementación on-site                                      │
│ - Base de datos y backups           │ - Soporte email/teléfono                                      │
│ - Certificados SSL                  │ - Centro de ayuda online                                      │
│ - Know-how de dominio (construcción)│ - Portal de clientes (post-lanzamiento)                       │
│                                     │                                                                │
├─────────────────────────────────────┴────────────────────────────────────────────────────────────────┤
│                                                                                                      │
│  ESTRUCTURA DE COSTOS                                                                                │
│                                                                                                      │
│  Costos fijos:                                                                                       │
│  - Salarios del equipo de desarrollo: $12,000-18,000/mes                                            │
│  - Infraestructura cloud: $200-500/mes                                                              │
│  - Licencias de herramientas: $100-300/mes                                                          │
│  - Dominio y SSL: $50/mes                                                                           │
│                                                                                                      │
│  Costos variables:                                                                                   │
│  - Soporte técnico: según demanda                                                                   │
│  - Almacenamiento adicional: según crecimiento                                                       │
│  - Capacitación presencial: $500/día                                                                │
│                                                                                                      │
│  Inversión inicial estimada: $35,000-50,000 USD                                                     │
│  Costo operativo mensual: $12,500-18,850 USD                                                        │
│                                                                                                      │
├──────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                      │
│  FUENTES DE INGRESOS                                                                                 │
│                                                                                                      │
│  1. Suscripción SaaS (mensual/anual): 85% de ingresos                                               │
│     - Plan Básico: $99/mes                                                                           │
│     - Plan Profesional: $199/mes                                                                     │
│     - Plan Enterprise: $399/mes                                                                      │
│                                                                                                      │
│  2. Implementación y configuración: 10% de ingresos                                                  │
│     - $2,000-5,000 por cliente                                                                       │
│                                                                                                      │
│  3. Capacitación y soporte premium: 5% de ingresos                                                   │
│     - $500/día de capacitación                                                                       │
│     - Soporte prioritario: $200/mes                                                                  │
│                                                                                                      │
└──────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Descripción Detallada por Bloque

### 1. Socios Clave

| Socio | Tipo | Valor que Aporta | Dependencia |
|---|---|---|---|
| Proveedor de infraestructura cloud (AWS/Azure) | Tecnológico | Hosting escalable, seguridad, disponibilidad | Alta |
| Proveedor de dominio y certificados SSL | Tecnológico | Identidad en línea, cifrado | Media |
| Equipo de desarrollo externo/interno | Operativo | Construcción y mantenimiento del software | Muy Alta |
| Consultores de mantenimiento industrial | Conocimiento | Validación de procesos de mantenimiento | Media |
| Proveedor de servicios de diseño UX/UI | Especializado | Experiencia de usuario de calidad | Media |

### 2. Actividades Clave

| Actividad | Frecuencia | Responsable | Prioridad |
|---|---|---|---|
| Desarrollo de nuevas funcionalidades | Continua | Tech Lead + Desarrolladores | Alta |
| Corrección de bugs y mantenimiento | Continua | Desarrolladores | Alta |
| Monitoreo de seguridad y actualizaciones | Semanal | DevOps | Alta |
| Soporte técnico a usuarios | Diaria | Equipo de soporte | Alta |
| Análisis de métricas de uso | Mensual | Product Owner | Media |
| Actualización de documentación | Por release | Tech Lead | Media |
| Capacitación de nuevos usuarios | Bajo demanda | Equipo de soporte | Media |
| Backup y recuperación de datos | Diaria (automática) | DevOps | Crítica |

### 3. Recursos Clave

| Recurso | Tipo | Propiedad | Criticalidad |
|---|---|---|---|
| Código fuente | Intelectual | Propiedad de la empresa | Crítica |
| Base de datos de clientes y operaciones | Datos | Propiedad de la empresa | Crítica |
| Infraestructura cloud | Físico/Tecnológico | Alquilada (cloud) | Alta |
| Equipo de desarrollo (3 personas) | Humano | Propiedad/Contratado | Crítica |
| Know-how de dominio de mantenimiento | Intelectual | Del equipo | Alta |
| Marca y reputación | Intangible | Propiedad de la empresa | Media |
| Herramientas de desarrollo (IDE, Git, etc.) | Tecnológico | Licenciadas | Media |

### 4. Propuesta de Valor

**Descripción general:**
MantenimientoPlus es una plataforma web que centraliza la gestión del mantenimiento preventivo y correctivo de maquinaria de construcción, proporcionando automatización de cálculos, alertas proactivas, trazabilidad completa y reportes gerenciales en tiempo real.

**Propuesta de valor por segmento:**

| Segmento | Propuesta Principal | Dolor que Resuelve |
|---|---|---|
| Jefe de Mantenimiento | Control total de la flota desde un solo lugar | Pierde tiempo buscando información en múltiples fuentes |
| Supervisor | Visibilidad del trabajo del equipo y estado de máquinas | No sabe qué está haciendo cada técnico ni el estado real |
| Técnico | Registro rápido y fácil desde el celular | El registro manual consume 30-45 min por mantenimiento |
| Gerencia | Reportes automáticos que muestran ROI del mantenimiento | Toma decisiones sin datos confiables |

**Factor diferencial clave:**
> "La única plataforma diseñada específicamente para la gestión de mantenimiento de maquinaria de construcción, con interfaz en español, precio accesible para LATAM, y capacidad de funcionar desde la obra en cualquier dispositivo."

### 5. Relaciones con Clientes

| Tipo de Relación | Canal | Frecuencia | Objetivo |
|---|---|---|---|
| Self-service | Portal de ayuda | Cuando el usuario necesita | Reducir carga de soporte |
| Soporte técnico | Email, teléfono, chat | Bajo demanda | Resolver incidencias |
| Onboarding guiado | Video llamada / presencial | Primera semana | Activar al usuario |
| Revisión de cuenta | Email/reunión | Trimestral | Retención y upselling |
| Comunidad de usuarios | Forum/WhatsApp | Continua | Engagement |
| Newsletter | Email | Mensual | Mantener informado |

### 6. Segmentos de Cliente

**Segmento 1: Empresas de construcción medianas (PRIMARIO)**
- Perfil: 50-200 máquinas, 3-10 técnicos
- Dolor principal: Falta de control y trazabilidad
- Disposición a pagar: $99-199/mes
- Canales preferidos: Demo presencial, referidos

**Segmento 2: Empresas de construcción grandes (SECUNDARIO)**
- Perfil: 200+ máquinas, 10+ técnicos
- Dolor principal: Complejidad de gestionar flota grande
- Disposición a pagar: $399+/mes
- Canales preferidos: Proceso formal de selección

**Segmento 3: Subcontratistas de mantenimiento (TERCIARIO)**
- Perfil: Gestión de mantenimiento para múltiples empresas
- Dolor principal: Visibilidad multi-cliente
- Disposición a pagar: Por proyecto
- Canales preferidos: Referidos, asociaciones gremiales

### 7. Estructura de Costos Detallada

**Costos de Desarrollo (Inversión Inicial):**

| Concepto | Costo Estimado | % |
|---|---|---|
| Diseño UX/UI | $4,000-6,000 | 10% |
| Desarrollo Backend (3 meses) | $12,000-18,000 | 30% |
| Desarrollo Frontend (3 meses) | $10,000-15,000 | 25% |
| QA y Testing | $3,000-4,500 | 8% |
| DevOps e Infraestructura | $2,000-3,000 | 5% |
| Gestión de Proyecto | $3,000-4,000 | 7% |
| Licencias y Herramientas | $1,000-1,500 | 3% |
| Contingencias (12%) | $4,200-6,300 | 12% |
| **TOTAL** | **$39,200-58,300** | **100%** |

**Costos Operativos Mensuales (Post-lanzamiento):**

| Concepto | Costo Mensual |
|---|---|
| Desarrollador de mantenimiento (1 devs) | $3,000-4,500 |
| Infraestructura cloud | $300-600 |
| Herramientas y licencias | $150-300 |
| Soporte técnico (parcial) | $500-1,000 |
| Monitoreo y seguridad | $100-200 |
| **TOTAL** | **$4,050-6,600** |

### 8. Fuentes de Ingresos

**Modelo de ingresos principal: Suscripción SaaS**

| Plan | Precio Mensual | Precio Anual (20% descuento) | Target |
|---|---|---|---|
| Básico | $99 | $950 | Microempresas, < 50 máquinas |
| Profesional | $199 | $1,910 | Medianas, 50-200 máquinas |
| Enterprise | $399 | $3,830 | Grandes, 200+ máquinas |

**Ingresos complementarios:**

| Fuente | Precio | Frecuencia |
|---|---|---|
| Implementación | $2,000-5,000 | Una vez por cliente |
| Capacitación avanzada | $500/día | Bajo demanda |
| Soporte prioritario | $200/mes | Mensual |
| Personalización | $100/hora | Bajo demanda |
| Migración de datos | $1,000-3,000 | Una vez por cliente |

**Proyección financiera a 3 años:**

| Año | Clientes Activos | Ingresos Anuales | Costos Anuales | Beneficio |
|---|---|---|---|---|
| Año 1 | 25-35 | $60,000-100,000 | $80,000-120,000 | -$20,000 a -$20,000 |
| Año 2 | 60-80 | $150,000-250,000 | $100,000-150,000 | $50,000-100,000 |
| Año 3 | 120-150 | $300,000-450,000 | $130,000-180,000 | $170,000-270,000 |

**Punto de equilibrio:** Mes 14-18 (con 40-50 clientes activos)

---

## Validación de Hipótesis

| Hipótesis | Método de Validación | Criterio de Éxito |
|---|---|---|
| Los jefes de mantenimiento pagarían por una herramienta así | Entrevistas con 10+ potenciales clientes | 70%+ expresan disposición a pagar |
| El precio de $199/mes es aceptable | Encuesta con precio시험 | 60%+ consideran precio justo |
| La interfaz mobile es suficiente (sin app nativa) | Prototipo de usabilidad | 80+ en System Usability Scale |
| Las alertas automáticas reducen omisiones | Beta con 5 empresas | 50%+ reducción en omisiones |
| Los reportes gerenciales generan valor | Entrevistas post-uso | 80%+ los usan mensualmente |

---

*Business Model Canvas actualizado: 26 de Agosto de 2026*
