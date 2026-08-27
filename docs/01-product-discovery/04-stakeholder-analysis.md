# Análisis de Interesados (Stakeholder Analysis)

## MantenimientoPlus - Plataforma de Gestión de Mantenimiento de Maquinaria

**Versión:** 1.0
**Fecha:** 26 de Agosto de 2026

---

## 1. Identificación de Stakeholders

### 1.1 Stakeholders Primarios (Directamente Impactados)

| ID | Stakeholder | Cargo/Área | Rol en el Proyecto |
|---|---|---|---|
| S-01 | Gerente General | Dirección General | Sponsor ejecutivo, aprobador final |
| S-02 | Gerente de Operaciones | Dirección de Operaciones | Champion del proyecto, define requisitos operativos |
| S-03 | Jefe de Mantenimiento | Departamento de Mantenimiento | Usuario principal, validador funcional |
| S-04 | Supervisor de Mantenimiento | Departamento de Mantenimiento | Usuario frecuente, probador UAT |
| S-05 | Técnico de Mantenimiento | Departamento de Mantenimiento | Usuario operativo, probador UAT |

### 1.2 Stakeholders Secundarios (Indirectamente Impactados)

| ID | Stakeholder | Cargo/Área | Rol en el Proyecto |
|---|---|---|---|
| S-06 | Gerente de IT / TI | Departamento de Tecnología | Soporte técnico, infraestructura |
| S-07 | Contador / Finanzas | Departamento Financiero | Consumidor de reportes de costos |
| S-08 | Operador de Maquinaria | Operaciones | Proveedor de datos de horas de uso |
| S-09 | Proveedor de Servicios | Externo | Mantenimiento especializado, integración |
| S-10 | Auditor Interno | Calidad/Compliance | Revisión de cumplimiento normativo |

### 1.3 Stakeholders de Soporte

| ID | Stakeholder | Cargo/Área | Rol en el Proyecto |
|---|---|---|---|
| S-11 | Desarrollador Líder | Equipo de Desarrollo | Arquitectura técnica, desarrollo |
| S-12 | Diseñador UX/UI | Equipo de Diseño | Diseño de experiencia de usuario |
| S-13 | QA Lead | Equipo de Calidad | Planificación y ejecución de pruebas |
| S-14 | DevOps Engineer | Equipo de Infraestructura | CI/CD, despliegue, monitoreo |
| S-15 | Product Owner | Equipo de Producto | Priorización, backlog, visión |

---

## 2. Matriz de Poder-Interés

```
                        INTERÉS
                Alto                    Bajo
         ┌─────────────────────┬─────────────────────┐
         │                     │                     │
         │  MANTENER SATISFECHO│  MANTENER INFORMADO │
         │                     │                     │
    A    │  S-06 (Gerente IT)  │  S-08 (Operador)    │
    L    │  S-07 (Finanzas)    │  S-09 (Proveedor)   │
    T    │                     │                     │
    O    │  MANTENER DE CERCA  │  MONITOREAR          │
    P    │                     │                     │
    O    │  S-01 (Ger. Gral)   │  S-10 (Auditor)     │
    D    │  S-02 (Ger. Oper)   │                     │
    E    │  S-03 (Jefe Mant)   │                     │
    R    │  S-04 (Supervisor)  │                     │
         │  S-15 (PO)          │                     │
         │                     │                     │
         │  SATISFACER         │  MANTENER SATISFECHO│
         │                     │                     │
    B    │  S-05 (Técnico)     │  S-11 (Dev Lead)    │
    A    │  S-12 (UX/UI)       │  S-13 (QA)          │
    J    │  S-14 (DevOps)      │                     │
    O    │                     │                     │
    │    └─────────────────────┴─────────────────────┘
```

---

## 3. Perfiles Detallados de Stakeholders

### S-01: Gerente General

| Campo | Descripción |
|---|---|
| **Nombre** | [Por definir] |
| **Cargo** | Gerente General |
| **Área** | Dirección General |
| **Interés en el proyecto** | Muy Alto - Sponsor ejecutivo, aprueba presupuesto y cronograma |
| **Poder de influencia** | Muy Alto - Puede aprobar o cancelar el proyecto |
| **Actitud esperada** | Positiva - Busca eficiencia y reducción de costos |
| **Expectativas** | ROI claro, reportes gerenciales, reducción de costos de mantenimiento |
| **Necesidades de comunicación** | Reportes ejecutivos mensuales, reuniones de steering committee trimestrales |
| **Frecuencia** | Mensual (resumen ejecutivo) + trimestral (steering committee) |
| **Riesgo** | Puede reducir presupuesto si no ve valor claro |
| **Estrategia** | Demostrar ROI desde el primer trimestre, reportes de ahorro cuantificable |

### S-02: Gerente de Operaciones

| Campo | Descripción |
|---|---|
| **Nombre** | [Por definir] |
| **Cargo** | Gerente de Operaciones |
| **Área** | Dirección de Operaciones |
| **Interés en el proyecto** | Muy Alto - El sistema impacta directamente su área |
| **Poder de influencia** | Alto - Puede impulsar o bloquear la adopción |
| **Actitud esperada** | Positiva - Es el champion del proyecto |
| **Expectativas** | Visibilidad en tiempo real del estado de la flota, reducción de downtime |
| **Necesidades de comunicación** | Demostraciones funcionales, acceso a dashboard gerencial |
| **Frecuencia** | Semanal durante desarrollo, quincenal post-lanzamiento |
| **Riesgo** | Si la herramienta no cumple expectativas, puede perder apoyo |
| **Estrategia** | Involucrar en cada sprint review, validar funcionalidades clave |

### S-03: Jefe de Mantenimiento

| Campo | Descripción |
|---|---|
| **Nombre** | [Por definir] |
| **Cargo** | Jefe de Mantenimiento |
| **Área** | Departamento de Mantenimiento |
| **Interés en el proyecto** | Muy Alto - Usuario principal que más se beneficia |
| **Poder de influencia** | Alto - Su validación es crítica para la adopción |
| **Actitud esperada** | Muy positiva - Resuelve sus problemas directos |
| **Expectativas** | Eliminación de mantenimientos olvidados, historial completo, alertas confiables |
| **Necesidades de comunicación** | Reuniones semanales de validación, acceso a beta |
| **Frecuencia** | Semanal |
| **Riesgo** | Resistencia al cambio si la herramienta es compleja |
| **Estrategia** | Diseñar la interfaz con su feedback, ofrecer capacitación personalizada |

### S-04: Supervisor de Mantenimiento

| Campo | Descripción |
|---|---|
| **Nombre** | [Por definir] |
| **Cargo** | Supervisor de Mantenimiento |
| **Área** | Departamento de Mantenimiento |
| **Interés en el proyecto** | Alto - Registra y supervisa mantenimientos |
| **Poder de influencia** | Medio - Influye en la adopción del equipo |
| **Actitud esperada** | Positiva - Facilita su trabajo diario |
| **Expectativas** | Registro fácil, asignación de técnicos, reportes de productividad |
| **Necesidades de comunicación** | Capacitación práctica, guías de uso |
| **Frecuencia** | Quincenal |
| **Riesgo** | Si le consume mucho tiempo, puede resistirse |
| **Estrategia** | Optimizar flujos de registro para < 5 minutos |

### S-05: Técnico de Mantenimiento

| Campo | Descripción |
|---|---|
| **Nombre** | [Por definir] |
| **Cargo** | Técnico de Mantenimiento |
| **Área** | Departamento de Mantenimiento |
| **Interés en el proyecto** | Alto - Usuario operativo diario |
| **Poder de influencia** | Bajo - Pero su adopción es esencial |
| **Actitud esperada** | Variable - Puede resistirse al cambio tecnológico |
| **Expectativas** | Registro rápido desde el celular, sin complicaciones |
| **Necesidades de comunicación** | Capacitación hands-on, soporte rápido |
| **Frecuencia** | Según necesidad |
| **Riesgo** | Rechazo si la interfaz es compleja o lenta |
| **Estrategia** | Diseñar interfaz mobile-first ultra-simplificada, gamificación |

### S-06: Gerente de IT

| Campo | Descripción |
|---|---|
| **Nombre** | [Por definir] |
| **Cargo** | Gerente de IT |
| **Área** | Departamento de Tecnología |
| **Interés en el proyecto** | Medio - Soporte técnico y seguridad |
| **Poder de influencia** | Alto - Controla infraestructura y seguridad |
| **Actitud esperada** | Neutral a positiva - Dependiendo de la carga de trabajo |
| **Expectativas** | Cumplimiento de estándares de seguridad, integración con sistemas existentes |
| **Necesidades de comunicación** | Documentación técnica, arquitectura de seguridad |
| **Frecuencia** | Quincenal durante desarrollo |
| **Riesgo** | Puede retrasar si no está conforme con la arquitectura |
| **Estrategia** | Involucrar desde el diseño de arquitectura, documentación completa |

### S-07: Contador / Finanzas

| Campo | Descripción |
|---|---|
| **Nombre** | [Por definir] |
| **Cargo** | Contador / Analista Financiero |
| **Área** | Departamento Financiero |
| **Interés en el proyecto** | Medio - Requiere reportes de costos |
| **Poder de influencia** | Medio - Afecta decisiones de presupuesto |
| **Actitud esperada** | Neutral - Le interesa el dato, no el proceso |
| **Expectativas** | Reportes de costos de mantenimiento por máquina, período, tipo |
| **Necesidades de comunicación** | Demostración de reportes financieros |
| **Frecuencia** | Mensual (post-lanzamiento) |
| **Riesgo** | Si los reportes no son precisos, pierde confianza |
| **Estrategia** | Asegurar precisión en datos financieros, exportación a Excel/PDF |

---

## 4. Matriz de Comunicación

| Stakeholder | Canal | Frecuencia | Responsable | Contenido |
|---|---|---|---|---|
| Gerente General | Reunión presencial + Email | Mensual | PO | Resumen ejecutivo, KPIs, riesgos |
| Gerente de Operaciones | Reunión + Demo | Semanal | PO + Tech Lead | Progreso, demos funcionales |
| Jefe de Mantenimiento | Reunión + WhatsApp | Semanal | PO | Validación funcional, feedback |
| Supervisor | Email + Demo | Quincenal | PO | Nuevas funcionalidades, capacitación |
| Técnico | Capacitación grupal | Por release | Soporte | Nuevas funcionalidades, guías |
| Gerente de IT | Reunión técnica | Quincenal | Tech Lead | Arquitectura, seguridad, despliegue |
| Finanzas | Email | Mensual | PO | Reportes financieros disponibles |

---

## 5. Matriz de Riesgos por Stakeholder

| Stakeholder | Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|---|
| Gerente General | Reduce presupuesto | Media | Crítico | Demostrar ROI trimestralmente |
| Gerente de Operaciones | Pierde interés | Baja | Alto | Involucrar en cada sprint review |
| Jefe de Mantenimiento | Rechaza la herramienta | Media | Crítico | Co-diseñar la interfaz con él |
| Supervisor | No adopta la herramienta | Media | Alto | Capacitación intensiva + incentivos |
| Técnico | No usa el sistema | Alta | Alto | Interfaz ultra-simple, mobile-first |
| Gerente de IT | Bloquea por seguridad | Baja | Alto | Estándares OWASP, documentación |
| Finanzas | Cuestiona datos | Media | Medio | Validación cruzada de datos |

---

## 6. Plan de Gestión de Stakeholders

### 6.1 Estrategias por Nivel de Influencia

**Alta Influencia / Alto Interés (Gestionar de Cerca):**
- Gerente General, Gerente de Operaciones, Jefe de Mantenimiento
- Acciones: Reuniones frecuentes, acceso anticipado a betas, incorporación en decisiones clave
- Responsable: Product Owner

**Alta Influencia / Bajo Interés (Mantener Satisfechos):**
- Gerente de IT, Finanzas
- Acciones: Reportes periódicos, cumplimiento de estándares, acceso a documentación
- Responsable: Tech Lead

**Baja Influencia / Alto Interés (Mantener Informados):**
- Supervisores, Técnicos
- Acciones: Comunicados, capacitación, canales de feedback
- Responsable: PO + Soporte

**Baja Influencia / Bajo Interés (Monitorear):**
- Auditor Interno, Proveedores
- Acciones: Comunicación puntual cuando sea necesario
- Responsable: PO

### 6.2 Herramientas de Gestión

| Herramienta | Uso | Acceso |
|---|---|---|
| Matriz RACI | Definición de responsabilidades | Documento compartido |
| Registro de stakeholders | Seguimiento de engagement | Herramienta de gestión |
| Bitácora de decisiones | Registro de decisiones clave | Confluence/SharePoint |
| Encuesta de satisfacción | Medir percepción trimestral | Google Forms |

---

## 7. Análisis RACI

| Actividad | Ger. General | Ger. Oper | Jefe Mant | Supervisor | Técnico | Ger. IT | Finanzas | PO | Tech Lead |
|---|---|---|---|---|---|---|---|---|---|
| Aprobación de presupuesto | **A** | C | I | I | - | C | C | R | C |
| Definición de requisitos | I | **A** | **R** | C | C | C | I | **R** | C |
| Diseño de arquitectura | I | I | C | I | - | **A** | - | C | **R** |
| Desarrollo | - | I | C | I | I | I | - | **A** | **R** |
| Testing/UAT | I | C | **R** | **R** | **R** | C | I | **A** | C |
| Despliegue | I | I | I | I | - | **A** | - | C | **R** |
| Capacitación | - | I | C | C | C | I | - | **A** | R |
| Adeción post-lanzamiento | **A** | **R** | **R** | R | R | C | I | C | C |

**Leyenda:** R = Responsable, A = Aprobador, C = Consultado, I = Informado

---

*Análisis de Stakeholders actualizado: 26 de Agosto de 2026*
