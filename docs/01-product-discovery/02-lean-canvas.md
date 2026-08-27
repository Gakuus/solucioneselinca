# Lean Canvas

## MantenimientoPlus - Plataforma de Gestión de Mantenimiento de Maquinaria

**Versión:** 1.0
**Fecha:** 26 de Agosto de 2026

---

## Canvas Completo

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    LEAN CANVAS                                                   │
├───────────────────┬───────────────────┬───────────────────┬───────────────────┬─────────────────┤
│                   │                   │                   │                   │                 │
│   1. PROBLEMA     │  2. SOLUCIÓN      │  3. MÉTRICAS      │  4. PROPUESTA     │  5. VENTAJA     │
│                   │                   │   CLAVE           │   DE VALOR        │   COMPETITIVA   │
│ Top 3 problemas:  │ Top 3 features:   │                   │                   │                 │
│                   │                   │                   │                   │                 │
│ 1. Mantenimientos │ 1. Dashboard de   │ - # Mantenimientos│ Centraliza toda   │ Diseñada        │
│    omitidos por   │    control con    │    completados    │ la gestión de     │ específicamente │
│    falta de       │    alertas auto-  │    vs programados │ mantenimiento de  │ para construc-  │
│    recordatorios  │    máticas        │                   │ maquinaria en una │ ción, no un     │
│                   │                   │ - % Mantenimientos│ plataforma web    │ CMMS genérico.  │
│ 2. Sin trazabi-   │ 2. Calculadora    │    preventivos    │ intuitiva y       │                 │
│    lidad del      │    automática de  │    vs correctivos │ accesible desde   │ Simple: no      │
│    historial de   │    próximo        │                   │ cualquier         │ requiere        │
│    mantenimiento  │    mantenimiento  │ - Tiempo medio de │ dispositivo.      │ capacitación    │
│                   │                   │    registro       │                   │ extensiva.      │
│ 3. Falta de       │ 3. Reportes       │                   │                   │                 │
│    reportes para  │    gerenciales    │ - Uptime del      │ Ahorro de 30-50%  │ Costo accesible │
│    toma de        │    en tiempo real  │    sistema        │ en costos de      │ vs soluciones   │
│    decisiones     │                   │                   │ mantenimiento     │ enterprise.     │
│                   │                   │                   │ no planificado.   │                 │
├───────────────────┴───────────────────┴───────────────────┴───────────────────┴─────────────────┤
│                                                                                                 │
│  6. CANALES                                                                                     │
│                                                                                                 │
│  - Distribución directa al equipo de TI de la empresa                                           │
│  - Implementación on-site con capacitación                                                      │
│  - Soporte vía email y teléfono                                                                 │
│  - Portal de ayuda en línea (post-lanzamiento)                                                  │
│                                                                                                 │
├─────────────────────────────────────────────────┬───────────────────────────────────────────────┤
│                                                 │                                               │
│  7. SEGMENTOS DE CLIENTE                         │  8. ESTRUCTURA DE COSTOS                      │
│                                                 │                                               │
│  - Gerentes de operaciones                      │  - Desarrollo de software (65%)               │
│  - Jefes de mantenimiento                       │  - Infraestructura cloud (15%)                │
│  - Supervisores de mantenimiento                │  - Diseño UX/UI (10%)                         │
│  - Técnicos de mantenimiento                    │  - QA y testing (5%)                          │
│  - Gerencia general (consumidor de reportes)    │  - Gestión de proyecto (5%)                   │
│                                                 │                                               │
│  Segmento primario: Jefes de Mantenimiento      │  Inversión estimada:                          │
│  Segmento secundario: Gerencia de Operaciones   │  $35,000 - $50,000 USD (desarrollo inicial)   │
│                                                 │                                               │
├─────────────────────────────────────────────────┴───────────────────────────────────────────────┤
│                                                                                                 │
│  9. FLUJOS DE INGRESOS                                                                          │
│                                                                                                 │
│  Modelo de suscripción SaaS (Software as a Service):                                            │
│                                                                                                 │
│  - Plan Básico: $99/mes (hasta 50 máquinas, 5 usuarios)                                       │
│  - Plan Profesional: $199/mes (hasta 200 máquinas, 20 usuarios)                               │
│  - Plan Enterprise: $399/mes (ilimitado, usuarios ilimitados, soporte dedicado)               │
│                                                                                                 │
│  - Implementación inicial: $2,000 - $5,000 USD                                                 │
│  - Capacitación: Incluida en plan Profesional y Enterprise                                     │
│                                                                                                 │
│  Ingresos estimados primer año: $40,000 - $80,000 USD                                          │
│                                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Descripción Detallada por Bloque

### 1. Problema

| # | Problema | Segmento Afectado | Frecuencia |
|---|---|---|---|
| 1 | Mantenimientos omitidos por falta de sistema de alertas y recordatorios | Técnicos, Supervisores | Semanal |
| 2 | Ausencia de trazabilidad en el historial de mantenimiento de cada máquina | Todos los niveles | Permanente |
| 3 | Falta de reportes confiables para la toma de decisiones gerenciales | Gerencia, Supervisores | Mensual |

**Problemas alternativos considerados y descartados:**
- Falta de inventario de repuestos (fase 2)
- Ausencia de tracking GPS (requiere hardware IoT)
- Comunicación deficiente entre equipos (se resuelve parcialmente con notificaciones)

### 2. Solución

| # | Solución | Problema que Resuelve |
|---|---|---|
| 1 | Dashboard de control con alertas automáticas de mantenimientos próximos y vencidos | Mantenimientos omitidos |
| 2 | Calculadora automática de próximo mantenimiento basada en horas de uso y parámetros configurables | Mantenimientos omitidos |
| 3 | Historial completo e inmutable por máquina con búsqueda y filtrado avanzado | Falta de trazabilidad |
| 4 | Reportes gerenciales en tiempo real exportables a PDF | Falta de reportes |

### 3. Métricas Clave

**Métricas de Activación:**
- % de usuarios que completan onboarding en primera semana
- Tiempo hasta primer mantenimiento registrado

**Métricas de Retención:**
- DAU/MAU ratio
- Tasa de retorno semanal
- Número de mantenimientos registrados por usuario por semana

**Métricas de Negocio:**
- Número de máquinas activas en el sistema
- Ratio preventivo/correctivo (meta: > 70% preventivo)
- Tiempo promedio de resolución de alertas
- Reducción de downtime no planificado (%)

### 4. Propuesta de Valor

**Para el Jefe de Mantenimiento:**
> "Centraliza el control de mantenimiento de toda tu flota en una sola plataforma. Nunca más perderás un mantenimiento. Calcula automáticamente los próximos servicios y mantén un historial completo e inquebrantable de cada máquina."

**Para la Gerencia:**
> "Obtén visibilidad en tiempo real del estado de tu flota. Toma decisiones basadas en datos reales con reportes automáticos que muestran costos, cumplimiento y eficiencia operativa."

**Para el Técnico:**
> "Registra tus mantenimientos en menos de 5 minutos desde tu celular. Consulta el historial completo de cualquier máquina antes de comenzar a trabajar."

### 5. Ventaja Competitiva

| Competidor | Tipo | Nuestro Diferencial |
|---|---|---|
| Excel/Google Sheets | Solución actual | Automatización, alertas, trazabilidad |
| Fiix | CMMS cloud genérico | Específico para construcción, precio accesible |
| UpKeep | CMMS mobile-first | Integración completa PC+Móvil, mercado LATAM |
| eMaint | CMMS enterprise | Simplificado, sin complejidad innecesaria |
| SAP PM | Módulo ERP | Independiente, costo 10x menor |

**Nuestra ventaja sostenible:**
1. Especialización vertical (construcción)
2. Precio accesible para mercado LATAM
3. Interfaz en español nativo
4. Implementación rápida (< 1 semana)
5. Soporte local en zona horaria del cliente

### 6. Canales

| Canal | Fase | Objetivo |
|---|---|---|
| Website corporativa | Pre-lanzamiento | Generación de demanda |
| Demo en vivo | Adquisición | Conversión de prospectos |
| On-site implementation | Retención | Activación y adopción |
| Soporte email/telefono | Retención | Resolución de problemas |
| Centro de ayuda online | Retención | Self-service |
| Webinars mensuales | Expansión | Upselling y engagement |

### 7. Segmentos de Cliente

**Segmento primario: Empresas de construcción mediana**
- 50-200 máquinas en flota
- 3-10 técnicos de mantenimiento
- Sin sistema CMMS actual
- Facturación anual: $5M - $50M USD

**Segmento secundario: Empresas grandes**
- 200+ máquinas
- 10+ técnicos
- Posible migración de CMMS existente
- Facturación anual: > $50M USD

### 8. Estructura de Costos

| Categoría | % del Total | Detalle |
|---|---|---|
| Desarrollo de software | 65% | Equipo de desarrollo (6 meses) |
| Infraestructura cloud | 15% | Hosting, dominios, servicios |
| Diseño UX/UI | 10% | Investigación y diseño |
| QA y testing | 5% | Herramientas y ejecución |
| Gestión de proyecto | 5% | Coordinación y comunicación |

**Costos recurrentes mensuales (post-lanzamiento):**
- Infraestructura: $200-500/mes
- Soporte y mantenimiento: $1,000-2,000/mes
- Monitoreo y seguridad: $100-300/mes

### 9. Flujos de Ingresos

**Modelo de suscripción mensual (SaaS):**

| Plan | Precio/mes | Máquinas | Usuarios | Características |
|---|---|---|---|---|
| Básico | $99 | Hasta 50 | Hasta 5 | CRUD básico, historial, 3 reportes |
| Profesional | $199 | Hasta 200 | Hasta 20 | Todo lo básico + alertas, 10 reportes, exportación |
| Enterprise | $399 | Ilimitado | Ilimitado | Todo + API, soporte dedicado, personalización |

**Ingresos adicionales:**
- Implementación: $2,000-5,000 (una vez)
- Capacitación avanzada: $500/día
- Desarrollo de features personalizados: $100/hora

**Proyección de ingresos primer año:**

| Trimestre | Clientes Estimados | Ingreso Mensual |
|---|---|---|
| Q1 | 3-5 | $600 - $1,500 |
| Q2 | 8-12 | $1,600 - $3,600 |
| Q3 | 15-20 | $3,000 - $6,000 |
| Q4 | 25-35 | $5,000 - $10,500 |

---

*Lean Canvas actualizado: 26 de Agosto de 2026*
