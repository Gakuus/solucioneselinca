# Plan de Pruebas (QA)

## MantenimientoPlus

**Version:** 1.0 | **Fecha:** 26 de Agosto de 2026

---

## 1. Estrategia de Pruebas

### 1.1 Niveles de Prueba

| Nivel | Responsabilidad | Herramienta | Cobertura |
|---|---|---|---|
| Unit Tests | Desarrolladores | Jest + Vitest | > 80% coverage |
| Integration Tests | Desarrolladores | Jest + Supertest | Endpoints criticos |
| E2E Tests | QA Engineer | Playwright | Flujos criticos |
| Manual QA | QA Engineer | Checklist | Todas las HU |
| Security Testing | Security Engineer | OWASP ZAP + manual | OWASP Top 10 |
| Performance Testing | DevOps | k6 / Artillery | 100 usuarios concurrentes |
| UAT | Usuarios reales | Script de prueba | Validacion final |

### 1.2 Criterios de Aceptacion General

- 0 bugs criticos abiertos
- 0 bugs altos abiertos
- Bugs medios: plan de remediacion
- Tests automatizados passing al 100%
- Code coverage >= 80%
- Aprobacion del PO en cada demo

---

## 2. Casos de Prueba Funcional

### 2.1 Autenticacion

| ID | Caso | Paso | Resultado Esperado |
|---|---|---|---|
| CP-001 | Login exitoso | Ingresar credenciales validas | Redirige a Dashboard, token generado |
| CP-002 | Login email incorrecto | Ingresar email inexistente | Error "Email o contrasena incorrectos" |
| CP-003 | Login password incorrecto | Ingresar password incorrecto | Error "Email o contrasena incorrectos" |
| CP-004 | Bloqueo por intentos | Fallar 5 veces | Mensaje "Cuenta bloqueada 30 min" |
| CP-005 | Logout | Hacer clic en cerrar sesion | Token invalidado, redirige a login |
| CP-006 | Token expirado | Esperar 15 min sin actividad | HTTP 401, redirige a login |
| CP-007 | Refresh token | Dejar expirar access token | Se renueva automaticamente |

### 2.2 RBAC

| ID | Caso | Paso | Resultado Esperado |
|---|---|---|---|
| CP-010 | Admin accede a todo | Login como admin | Ve todas las secciones del menu |
| CP-011 | Tecnico no ve admin | Login como technician | No ve Usuarios, Auditoria, Config |
| CP-012 | Viewer es solo lectura | Login como viewer | No ve botones de crear/editar/eliminar |
| CP-013 | Endpoint sin permiso | Technician intenta GET /users | HTTP 403 |
| CP-014 | Tecnico solo ve sus mantenimientos | Technician busca mantenimientos | Solo ve los asignados a el |

### 2.3 Maquinas

| ID | Caso | Paso | Resultado Esperado |
|---|---|---|---|
| CP-020 | Crear maquina | Completar formulario valido | Maquina creada con ID, estado activo |
| CP-021 | Codigo duplicado | Ingresar codigo existente | Error "El codigo ya existe" |
| CP-022 | Campos obligatorios vacios | Dejar campos sin completar | Errores en cada campo requerido |
| CP-023 | Editar maquina | Modificar nombre | Cambios guardados, auditoria registrada |
| CP-024 | Buscar maquina | Escribir en buscador | Resultados en tiempo real |
| CP-025 | Filtrar por estado | Seleccionar "En Mantenimiento" | Solo muestra maquinas en mantenimiento |
| CP-026 | Cambiar estado | Cambiar de Activa a In Mantenimiento | Estado actualizado, registro en historial |
| CP-027 | Dar de baja | Cambiar a "Dada de Baja" | Requiere motivo, estado actualizado |
| CP-028 | Eliminar maquina con mantenimientos | Intentar eliminar | Error "No se puede eliminar" |
| CP-029 | Exportar a CSV | Hacer clic en Exportar | Descarga archivo CSV correcto |

### 2.4 Mantenimientos

| ID | Caso | Paso | Resultado Esperado |
|---|---|---|---|
| CP-030 | Crear mantenimiento | Completar formulario | Mantenimiento creado con estado "Programado" |
| CP-031 | Calculo automatico | Ingresar horas actuales | Se calcula hours_until_next y estimated_next_date |
| CP-032 | Cambiar estado a En Proceso | Seleccionar "En Proceso" | Estado actualizado |
| CP-033 | Completar mantenimiento | Seleccionar "Completado" | registered completed_at, maquina vuelve a "Activa" |
| CP-034 | Cancelar mantenimiento | Seleccionar "Cancelado" con motivo | Mantenimiento cancelado, motivo registrado |
| CP-035 | Ver historial | Ir a detalle de maquina | Lista cronologica de mantenimientos |
| CP-036 | Filtrar historial | Filtrar por tipo y fecha | Solo muestra los que cumplen filtro |
| CP-037 | Asignar tecnico | Seleccionar tecnico del dropdown | Tecnico asignado, registro de cambio |

### 2.5 Alertas

| ID | Caso | Paso | Resultado Esperado |
|---|---|---|---|
| CP-040 | Alerta por vencimiento | Mantenimiento con fecha proxima | Alerta generada automaticamente |
| CP-041 | Contador de alertas | Hay alertas pendientes | Campana muestra numero correcto |
| CP-042 | Marcar como leida | Hacer clic en marcar leida | Alerta marcada, contador disminuye |
| CP-043 | Alerta de vencido | Mantenimiento con fecha pasada | Alerta tipo "overdue" con severidad critica |

### 2.6 Dashboard y Reportes

| ID | Caso | Paso | Resultado Esperado |
|---|---|---|---|
| CP-050 | KPIs correctos | Ver dashboard | Numeros coinciden con datos reales |
| CP-051 | Graficos renderizados | Ver dashboard | Graficos muestran datos correctos |
| CP-052 | Generar reporte historial | Seleccionar maquina y generar | Reporte completo mostrado |
| CP-053 | Exportar PDF | Hacer clic en Exportar PDF | Descarga PDF con formato correcto |
| CP-054 | Exportar CSV | Hacer clic en Exportar CSV | Descarga CSV con datos correctos |
| CP-055 | Filtros de reporte | Aplicar filtros | Resultados reflejan filtros |

### 2.7 Responsive

| ID | Caso | Paso | Resultado Esperado |
|---|---|---|---|
| CP-060 | Movil (< 768px) | Abrir en celular | Layout de una columna, hamburger menu |
| CP-061 | Tablet (768-1024px) | Abrir en tablet | Layout adaptado, sidebar iconos |
| CP-062 | Desktop (> 1024px) | Abrir en PC | Layout completo con sidebar |
| CP-063 | Formulario en movil | Crear registro desde celular | Formulario usable, teclado correcto |
| CP-064 | Tabla en movil | Ver lista de maquinas | Scroll horizontal, datos accesibles |

---

## 3. Pruebas de Seguridad

| ID | Prueba | Metodo | Resultado Esperado |
|---|---|---|---|
| SEC-001 | SQL Injection | Inyectar SQL en campos de busqueda | No afecta la BD, retorna error |
| SEC-002 | XSS Stored | Inyectar script en descripcion | Script no se ejecuta, se escapa |
| SEC-003 | CSRF | Enviar request desde otro dominio | Rechazado por CORS/tokens |
| SEC-004 | Broken Access Control | Acceder a endpoint sin permiso | HTTP 403 |
| SEC-005 | Brute Force | 100 intentos de login rapidos | Rate limited, IP bloqueada |
| SEC-006 | JWT Tampering | Modificar payload del token | Firma invalida, HTTP 401 |
| SEC-007 | IDOR | Acceder a datos de otro usuario | HTTP 403 o 404 |
| SEC-008 | Security Headers | Inspeccionar headers HTTP | Todos los headers presentes |
| SEC-009 | Password in Logs | Revisar logs del sistema | Ninguna password en texto plano |
| SEC-010 | HTTPS | Intentar conexion HTTP | Redirige a HTTPS |

---

## 4. Pruebas de Carga

| ID | Prueba | Configuracion | Resultado Esperado |
|---|---|---|---|
| LOAD-001 | Login concurrente | 50 usuarios en 1 min | Todos autenticados, < 2s promedio |
| LOAD-002 | Consulta de maquinas | 100 usuarios concurrentes | Response < 500ms P95 |
| LOAD-003 | Crear mantenimiento | 20 usuarios concurrentes | Todos exitosos, sin duplicados |
| LOAD-004 | Dashboard load | 100 usuarios | Response < 3s, sin errores |
| LOAD-005 | Reporte complejo | 10 usuarios generando reportes | Response < 10s, datos correctos |

**Herramientas:** k6 o Artillery
**Escenario:** Ramp-up gradual,稳态 5 minutos, ramp-down

---

## 5. UAT (User Acceptance Testing)

### 5.1 Participantes
- Jefe de Mantenimiento
- 2 Supervisores
- 2 Tecnicos
- Gerente de Operaciones

### 5.2 Escenarios de UAT

| Escenario | Participante | Pasos | Duracion |
|---|---|---|---|
| Registrar primera maquina | Supervisor | Login -> Maquinas -> Nuevo -> Llenar -> Guardar | 5 min |
| Registrar mantenimiento completo | Tecnico | Login -> Mantenimientos -> Nuevo -> Completar flujo | 10 min |
| Verificar alertas | Jefe Mantto | Login -> Dashboard -> Ver alertas -> Marcar leida | 3 min |
| Generar reporte | Gerente | Login -> Reportes -> Seleccionar -> Generar -> Exportar | 5 min |
| Gestionar usuario | Admin | Login -> Config -> Usuarios -> Crear -> Verificar | 5 min |

### 5.3 Criterios de Aprobacion UAT
- 90% de escenarios completados sin asistencia
- NPS > 7/10
- 0 bugs criticos identificados
- Feedback negativo < 20%

---

## 6. Proceso de Reporte de Bugs

### 6.1 Formato de Reporte

| Campo | Descripcion |
|---|---|
| Titulo | Descripcion concisa del bug |
| Severidad | Critica, Alta, Media, Baja |
| Pasos para reproducir | Pasos numerados |
| Resultado actual | Que sucede |
| Resultado esperado | Que deberia suceder |
| Evidencia | Screenshots/video |
| Ambiente | Navegador, dispositivo, SO |
| Datos de prueba | Usuarios, maquinas usadas |

### 6.2 Clasificacion de Severidad

| Severidad | Definicion | SLA Resolucion |
|---|---|---|
| Critica | Sistema caido, datos corruptos, seguridad | 4 horas |
| Alta | Funcionalidad principal rota | 24 horas |
| Media | Funcionalidad secundaria con workaround | 3 dias |
| Baja | Cosmetico, mejora menor | Proximo sprint |

---

*Plan QA v1.0 - 26/08/2026*
