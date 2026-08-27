# Historias de Usuario

## MantenimientoPlus

**Version:** 1.0 | **Fecha:** 26 de Agosto de 2026

---

## Epic 1: Autenticacion y Seguridad

### HU-001: Inicio de Sesion
- **Como** usuario del sistema
- **Quiero** iniciar sesion con mi email y contrasena
- **Para** acceder a las funcionalidades segun mi rol
- **Prioridad:** Critica | **Valor:** 13 | **Estimacion:** 5 pts
- **Criterios de aceptacion:**
  1. Puedo ingresar email y contrasena en un formulario
  2. Si las credenciales son correctas, accedo al dashboard
  3. Si son incorrectas, veo un mensaje de error generico
  4. Despues de 5 intentos fallidos, mi cuenta se bloquea 30 minutos
  5. Mi sesion se mantiene activa con refresh token
  6. El evento de login queda registrado en auditoria

### HU-002: Cierre de Sesion
- **Como** usuario autenticado
- **Quiero** cerrar sesion de forma segura
- **Para** proteger mi cuenta cuando uso equipos compartidos
- **Prioridad:** Critica | **Valor:** 5 | **Estimacion:** 2 pts
- **Criterios de aceptacion:**
  1. Encuentro un boton de logout en el header
  2. Al hacer clic, mi token se invalida inmediatamente
  3. Soy redirigido a la pantalla de login
  4. El evento queda registrado en auditoria

### HU-003: Gestion de Usuarios (Admin)
- **Como** administrador
- **Quiero** crear, editar y desactivar usuarios
- **Para** mantener controlado quien tiene acceso al sistema
- **Prioridad:** Critica | **Valor:** 13 | **Estimacion:** 8 pts
- **Criterios de aceptacion:**
  1. Puedo crear usuario con nombre, email, rol y contrasena temporal
  2. El email debe ser unico en el sistema
  3. Puedo cambiar el rol de un usuario
  4. Puedo desactivar un usuario (sin eliminar)
  5. Usuario desactivado no puede iniciar sesion
  6. No puedo eliminar usuario con registros asociados
  7. Todas las acciones quedan en auditoria

### HU-004: Control de Permisos por Rol
- **Como** sistema
- **Quiero** restringir el acceso segun el rol del usuario
- **Para** que cada usuario solo pueda hacer lo que le corresponde
- **Prioridad:** Critica | **Valor:** 13 | **Estimacion:** 5 pts
- **Criterios de aceptacion:**
  1. Administrador accede a todo
  2. Supervisor accede a maquinas y mantenimientos
  3. Tecnico solo registra y consulta
  4. Consulta solo visualiza
  5. Endpoint sin permiso retorna HTTP 403
  6. Menu se adapta al rol

---

## Epic 2: Gestion de Maquinas

### HU-010: Registrar Nueva Maquina
- **Como** supervisor o administrador
- **Quiero** registrar una nueva maquina con sus datos
- **Para** que quede centralizada la informacion en el sistema
- **Prioridad:** Critica | **Valor:** 13 | **Estimacion:** 5 pts
- **Criterios de aceptacion:**
  1. Puedo ingresar: codigo interno, nombre, tipo, marca, modelo, serie, anio
  2. El codigo interno debe ser unico (validacion en tiempo real)
  3. El ID se genera automaticamente
  4. Estado por defecto: Activa
  - Fecha de alta se registra automaticamente
  6. Recibo confirmacion de exito
  7. La accion queda en auditoria

### HU-011: Editar Maquina
- **Como** supervisor o administrador
- **Quiero** modificar los datos de una maquina existente
- **Para** mantener la informacion actualizada
- **Prioridad:** Alta | **Valor:** 8 | **Estimacion:** 3 pts
- **Criterios de aceptacion:**
  1. Puedo editar todos los campos excepto codigo interno e ID
  2. Los cambios quedan registrados en auditoria con valores antes/despues
  3. No puedo cambiar el codigo por uno ya existente

### HU-012: Buscar y Filtrar Maquinas
- **Como** usuario autenticado
- **Quiero** buscar y filtrar maquinas rapidamente
- **Para** encontrar la maquina que necesito en segundos
- **Prioridad:** Alta | **Valor:** 8 | **Estimacion:** 5 pts
- **Criterios de aceptacion:**
  1. Buscador por texto: codigo, nombre, marca, modelo
  2. Filtros: estado, tipo, marca
  3. Multiples filtros combinables
  4. Ordenamiento por cualquier columna
  5. Paginacion de 20 elementos
  6. Resultados en menos de 1 segundo

### HU-013: Ver Detalle de Maquina
- **Como** usuario autenticado
- **Quiero** ver toda la informacion de una maquina y su historial
- **Para** conocer el estado y historial completo antes de trabajar
- **Prioridad:** Critica | **Valor:** 8 | **Estimacion:** 3 pts
- **Criterios de aceptacion:**
  1. Veo todos los campos de la maquina
  2. Veo lista cronologica de mantenimientos
  3. Veo indicador de proximo mantenimiento
  4. Tengo boton para crear nuevo mantenimiento
  5. Puedo volver a la lista facilmente

### HU-014: Cambiar Estado de Maquina
- **Como** supervisor o administrador
- **Quiero** cambiar el estado de una maquina
- **Para** reflejar su situacion actual
- **Prioridad:** Alta | **Valor:** 5 | **Estimacion:** 2 pts
- **Criterios de aceptacion:**
  1. Estados disponibles: Activa, En Mantenimiento, Inactiva, Dada de Baja
  2. Transiciones validas segun reglas de negocio
  3. Dada de Baja requiere motivo
  4. Cambio registrado en historial

### HU-015: Exportar Listado de Maquinas
- **Como** supervisor o administrador
- **Quiero** exportar el listado de maquinas a CSV
- **Para** compartir la informacion fuera del sistema
- **Prioridad:** Media | **Valor:** 3 | **Estimacion:** 2 pts
- **Criterios de aceptacion:**
  1. Boton de exportar visible en la lista
  2. Respeta los filtros aplicados
  3. Archivo CSV con UTF-8
  4. Nombre descriptivo con fecha

---

## Epic 3: Gestion de Mantenimientos

### HU-020: Registrar Mantenimiento
- **Como** supervisor o tecnico
- **Quiero** registrar un mantenimiento realizado o programado
- **Para** que quede el registro en el historial de la maquina
- **Prioridad:** Critica | **Valor:** 13 | **Estimacion:** 8 pts
- **Criterios de aceptacion:**
  1. Selecciono la maquina (autocomplete)
  2. Selecciono tipo de mantenimiento del catalogo
  3. Ingreso fecha, descripcion, observaciones
  4. Asigno tecnico responsable
  5. Ingreso horas actuales de uso
  6. El sistema calcula horas hasta proximo y fecha estimada
  7. Estado por defecto: Programado
  8. Guardo y recibo confirmacion

### HU-021: Actualizar Estado de Mantenimiento
- **Como** supervisor o tecnico
- **Quiero** cambiar el estado de un mantenimiento
- **Para** reflejar el avance del trabajo
- **Prioridad:** Alta | **Valor:** 8 | **Estimacion:** 3 pts
- **Criterios de aceptacion:**
  1. Estados: Programado -> En Proceso -> Completado
  2. Cancelado desde Programado o En Proceso
  3. Completado registra fecha real
  4. Cancelado requiere motivo

### HU-022: Ver Historial de Mantenimientos
- **Como** usuario autenticado
- **Quiero** ver todos los mantenimientos de una maquina
- **Para** conocer su historial completo de servicios
- **Prioridad:** Critica | **Valor:** 8 | **Estimacion:** 5 pts
- **Criterios de aceptacion:**
  1. Lista cronologica descendente
  2. Cada registro muestra: fecha, tipo, descripcion, tecnico, horas, estado
  3. Filtros: tipo, estado, fechas, tecnico
  4. Exportacion a PDF y CSV
  5. Paginacion

### HU-023: Buscar Mantenimientos
- **Como** supervisor o administrador
- **Quiero** buscar mantenimientos por criterios multiples
- **Para** encontrar registros especificos rapidamente
- **Prioridad:** Alta | **Valor:** 5 | **Estimacion:** 3 pts
- **Criterios de aceptacion:**
  1. Busqueda por texto en descripcion
  2. Filtros: maquina, tecnico, tipo, estado, rango de fechas
  3. Multiples filtros combinables
  4. Resultados paginados

### HU-024: Asignar Tecnico
- **Como** supervisor
- **Quiero** asignar o reasignar un tecnico a un mantenimiento
- **Para** que sepa quien es responsable del trabajo
- **Prioridad:** Alta | **Valor:** 5 | **Estimacion:** 2 pts
- **Criterios de aceptacion:**
  1. Lista de tecnicos disponibles
  2. Puedo reasignar tecnico
  3. El cambio queda registrado
  4. Notificacion al tecnico asignado

### HU-025: Calcular Proximo Mantenimiento
- **Como** sistema
- **Quiero** calcular automaticamente la fecha del proximo mantenimiento
- **Para** que las alertas se generen sin intervencion manual
- **Prioridad:** Critica | **Valor:** 13 | **Estimacion:** 5 pts
- **Criterios de aceptacion:**
  1. Usa intervalo del tipo de mantenimiento
  2. Calcula horas restantes y fecha estimada
  3. Sin datos de promedio usa 8 horas/dia
  4. Valores negativos muestran "Vencido"
  5. Se actualiza al registrar horas nuevas

### HU-026: Gestionar Catalogo de Tipos de Mantenimiento
- **Como** administrador
- **Quiero** agregar, editar y desactivar tipos de mantenimiento
- **Para** personalizar el catalogo a las necesidades de la empresa
- **Prioridad:** Alta | **Valor:** 5 | **Estimacion:** 3 pts
- **Criterios de aceptacion:**
  1. CRUD completo
  2. Pre-cargados: Preventivo, Correctivo, Predictivo, Inspeccion, Cambio aceite, Cambio filtros, Revision general, Reparacion, Otros
  3. Cada tipo tiene intervalo de horas sugerido
  4. No se puede eliminar tipo en uso

---

## Epic 4: Alertas y Notificaciones

### HU-030: Recibir Alertas de Mantenimiento Proximo
- **Como** jefe de mantenimiento
- **Quiero** recibir alertas cuando un mantenimiento esta proximo a vencer
- **Para** tomar acciones antes de que se venza
- **Prioridad:** Critica | **Valor:** 13 | **Estimacion:** 5 pts
- **Criterios de aceptacion:**
  1. Alerta generada automaticamente 15, 7 y 3 dias antes
  2. Nivel de color segun urgencia
  3. Visible en el dashboard
  4. Contador en el header

### HU-031: Recibir Alertas de Mantenimiento Vencido
- **Como** jefe de mantenimiento
- **Quiero** ser notificado cuando un mantenimiento esta vencido
- **Para** priorizar la resolucion inmediata
- **Prioridad:** Critica | **Valor:** 8 | **Estimacion:** 3 pts
- **Criterios de aceptacion:**
  1. Alerta automatica al vencimiento
  2. Notificacion in-app
  3. Persistente hasta resolucion
  4. Color rojo, nivel critic

### HU-032: Gestionar Notificaciones
- **Como** usuario autenticado
- **Quiero** ver y gestionar mis notificaciones
- **Para** estar informado de lo relevante
- **Prioridad:** Alta | **Valor:** 5 | **Estimacion:** 3 pts
- **Criterios de aceptacion:**
  1. Campana con contador en header
  2. Dropdown con lista de notificaciones
  3. Marcar como leida individual o todas
  4. Persiste estado entre sesiones

### HU-033: Configurar Dias de Alerta
- **Como** administrador
- **Quiero** configurar los dias de anticipacion para alertas
- **Para** adaptar las alertas a las necesidades de la empresa
- **Prioridad:** Alta | **Valor:** 3 | **Estimacion:** 2 pts
- **Criterios de aceptacion:**
  1. Configurable por tipo de mantenimiento
  2. Multiples niveles (30, 15, 7, 3 dias)
  3. Cambios se aplican inmediatamente

---

## Epic 5: Dashboard y Reportes

### HU-040: Ver Dashboard Principal
- **Como** usuario autenticado
- **Quiero** ver un panel con las metricas clave
- **Para** tener vision rapida del estado operativo
- **Prioridad:** Critica | **Valor:** 13 | **Estimacion:** 8 pts
- **Criterios de aceptacion:**
  1. KPIs: total maquinas, mantenimientos del mes, alertas activas
  2. Grafico de mantenimientos por tipo
  3. Grafico de tendencia mensual
  4. Lista de proximos mantenimientos (top 5)
  5. Lista de alertas activas
  6. Responsive en movil

### HU-041: Ver Reporte Historial por Maquina
- **Como** usuario autenticado
- **Quiero** generar un reporte del historial de una maquina
- **Para** tener documentacion completa para revisiones
- **Prioridad:** Alta | **Valor:** 8 | **Estimacion:** 3 pts
- **Criterios de aceptacion:**
  1. Selecciono maquina
  2. Veo todos sus mantenimientos
  3. Exporto a PDF con formato profesional
  4. Exporto a CSV

### HU-042: Ver Reporte de Mantenimientos por Periodo
- **Como** supervisor o administrador
- **Quiero** ver mantenimientos en un rango de fechas
- **Para** analizar la actividad de mantenimiento
- **Prioridad:** Alta | **Valor:** 8 | **Estimacion:** 5 pts
- **Criterios de aceptacion:**
  1. Filtro de rango de fechas obligatorio
  2. Filtros adicionales: tipo, tecnico
  3. Resumen: total, por tipo, por estado
  4. Exportable a PDF y CSV

### HU-043: Ver Reporte de Cumplimiento
- **Como** administrador
- **Quiero** ver el porcentaje de cumplimiento de mantenimientos
- **Para** medir la efectividad del programa de mantenimiento
- **Prioridad:** Media | **Valor:** 5 | **Estimacion:** 3 pts
- **Criterios de aceptacion:**
  1. Calculo: completados a tiempo / programados
  2. Filtrable por periodo
  3. Meta configurable (default 95%)

### HU-044: Ver Reporte de Flota
- **Como** gerente de operaciones
- **Quiero** ver el estado actual de toda la flota
- **Para** tomar decisiones de asignacion de maquinaria
- **Prioridad:** Alta | **Valor:** 8 | **Estimacion:** 3 pts
- **Criterios de aceptacion:**
  1. Conteo por estado
  2. Distribucion por tipo
  3. Tiempo promedio de mantenimiento

---

## Epic 6: Auditoria

### HU-050: Registrar Acciones en Auditoria
- **Como** sistema
- **Quiero** registrar cada accion critica de los usuarios
- **Para** mantener un trail de auditoria completo
- **Prioridad:** Alta | **Valor:** 8 | **Estimacion:** 5 pts
- **Criterios de aceptacion:**
  1. Captura: usuario, accion, fecha, IP, datos
  2. Acciones: login, logout, CRUD, export
  3. Registros inmutables

### HU-051: Consultar Auditoria
- **Como** administrador
- **Quiero** consultar el log de auditoria
- **Para** revisar actividad sospechosa o verificar acciones
- **Prioridad:** Alta | **Valor:** 5 | **Estimacion:** 3 pts
- **Criterios de aceptacion:**
  1. Filtros: usuario, accion, fechas
  2. Paginacion
  3. Exportacion CSV
  4. Solo accesible por admin

---

## Epic 7: Configuracion

### HU-060: Configurar Parametros del Sistema
- **Como** administrador
- **Quiero** configurar los parametros generales del sistema
- **Para** adaptarlo a las necesidades de la empresa
- **Prioridad:** Media | **Valor:** 5 | **Estimacion:** 3 pts
- **Criterios de aceptacion:**
  1. Nombre empresa, logo
  2. Zona horaria
  3. Dias de alerta
  4. Timeout de sesion

### HU-061: Gestionar Tipos de Maquina
- **Como** administrador
- **Quiero** agregar y editar tipos de maquina
- **Para** clasificar correctamente mi flota
- **Prioridad:** Alta | **Valor:** 5 | **Estimacion:** 2 pts
- **Criterios de aceptacion:**
  1. CRUD completo
  2. Campos: nombre, descripcion, estado
  3. No se puede eliminar tipo en uso

---

## Resumen de Historias

| Epic | Cantidad HU | Pts Total | Sprint Asignado |
|---|---|---|---|
| Epic 1: Autenticacion | 4 | 41 | Sprint 1 |
| Epic 2: Maquinas | 6 | 39 | Sprint 1-2 |
| Epic 3: Mantenimientos | 7 | 52 | Sprint 2-3 |
| Epic 4: Alertas | 4 | 29 | Sprint 3 |
| Epic 5: Dashboard/Reportes | 5 | 37 | Sprint 3-4 |
| Epic 6: Auditoria | 2 | 13 | Sprint 4 |
| Epic 7: Configuracion | 2 | 10 | Sprint 4 |
| **TOTAL** | **30** | **221** | **Sprint 1-4** |

---

*Historias de Usuario v1.0 - 26/08/2026*
