# Requisitos Funcionales Detallados

## MantenimientoPlus

**Version:** 1.0 | **Fecha:** 26 de Agosto de 2026

---

## 1. Modulo de Autenticacion

### RF-001: Inicio de Sesion
- **Prioridad:** Critica
- **Descripcion:** El sistema debe permitir inicio de sesion con email y contrasena
- **Criterios de aceptacion:**
  - CA-01: Login exitoso genera access token (15min) y refresh token (7 dias)
  - CA-02: Credenciales invalidas no revelan si el email existe
  - CA-03: 5 intentos fallidos bloquean la cuenta por 30 min
  - CA-04: Evento registrado en auditoria con IP

### RF-002: Autenticacion JWT
- **Prioridad:** Critica
- **Descripcion:** Implementar JWT para autenticacion stateless
- **Criterios de aceptacion:**
  - CA-01: Access token contiene payload (user_id, role, exp)
  - CA-02: Refresh token permite renovar access token sin re-login
  - CA-03: Token invalidado al hacer logout
  - CA-04: Token expirado retorna HTTP 401

### RF-003: RBAC - Control de Acceso
- **Prioridad:** Critica
- **Descripcion:** Controlar acceso segun rol: Administrador, Supervisor, Tecnico, Consulta
- **Matriz de permisos:**
  - Administrador: CRUD completo en todo
  - Supervisor: CRUD maquinas, CRUD mantenimientos, ver reportes
  - Tecnico: Crear/leer mantenimientos, ver historial, reportes limitados
  - Consulta: Solo lectura en todo
- **Criterios de aceptacion:**
  - CA-01: Usuario sin permiso recibe HTTP 403
  - CA-02: Menus se filtran segun rol
  - CA-03: Endpoints validan rol en cada peticion

### RF-004: Gestion de Usuarios
- **Prioridad:** Critica
- **Descripcion:** CRUD completo de usuarios por administrador
- **Campos:** Nombre, email, rol, estado (activo/inactivo), fecha creacion
- **Criterios de aceptacion:**
  - CA-01: Email unico en el sistema
  - CA-02: Contrasena temporal generada automaticamente
  - CA-03: Usuario desactivado no puede iniciar sesion
  - CA-04: No se puede eliminar usuario con registros asociados

### RF-005: Bloqueo por Intentos Fallidos
- **Prioridad:** Alta
- **Descripcion:** Bloquear cuenta tras 5 intentos fallidos por 30 minutos
- **Criterios de aceptacion:**
  - CA-01: Contador de intentos se reinicia tras login exitoso
  - CA-02: BloqueoAutomatico despues de 5 intentos
  - CA-03: Administrador puede desbloquear manualmente

### RF-006: Cierre de Sesion
- **Prioridad:** Critica
- **Descripcion:** Logout que invalida el token JWT
- **Criterios de aceptacion:**
  - CA-01: Refresh token se elimina de la base de datos
  - CA-02: Evento registrado en auditoria
  - CA-03: Sesion invalidada inmediatamente

---

## 2. Modulo de Maquinas

### RF-010: Registro de Maquinas
- **Prioridad:** Critica
- **Descripcion:** Registrar maquinas con campos: ID unico (auto), codigo interno, nombre, tipo, marca, modelo, numero de serie, anio, estado, fecha de alta
- **Criterios de aceptacion:**
  - CA-01: ID generado automaticamente (UUID)
  - CA-02: Codigo interno unico (validacion en tiempo real)
  - CA-03: Estado por defecto: "Activa"
  - CA-04: Fecha de alta automatica
  - CA-05: Auditoria de creacion registrada

### RF-011: Edicion de Maquinas
- **Prioridad:** Critica
- **Descripcion:** Modificar informacion de maquina existente
- **Criterios de aceptacion:**
  - CA-01: Solo campos editables: nombre, tipo, marca, modelo, serie, anio, estado
  - CA-02: Codigo interno no editable una vez creado
  - CA-03: Cambio de estado registrado en historial
  - CA-04: Auditoria con valores antes/despues

### RF-012: Busqueda y Filtrado de Maquinas
- **Prioridad:** Critica
- **Descripcion:** Buscar por codigo, nombre, tipo o marca. Filtrar por estado, tipo, marca
- **Criterios de aceptacion:**
  - CA-01: Busqueda en tiempo real (debounce 300ms)
  - CA-02: Multiples filtros combinables
  - CA-03: Ordenamiento por cualquier columna
  - CA-04: Paginacion con 20 elementos por pagina

### RF-013: Vista Detalle de Maquina
- **Prioridad:** Critica
- **Descripcion:** Mostrar toda la informacion de la maquina mas historial de mantenimientos
- **Criterios de aceptacion:**
  - CA-01: Muestra todos los campos de la maquina
  - CA-02: Lista cronologica de mantenimientos
  - CA-03: Indicador de proximo mantenimiento
  - CA-04: Boton para nuevo mantenimiento

### RF-014: Exportar Listado de Maquinas
- **Prioridad:** Media
- **Descripcion:** Exportar listado filtrado a CSV
- **Criterios de aceptacion:**
  - CA-01: Incluye filtros aplicados
  - CA-02: Formato CSV con UTF-8
  - CA-03: Nombre de archivo con fecha

### RF-015: Gestion de Estados de Maquina
- **Prioridad:** Alta
- **Descripcion:** Estados: Activa, En Mantenimiento, Inactiva, Dada de Baja
- **Criterios de aceptacion:**
  - CA-01: Transiciones validas (no se puede pasar de Baja a Activa)
  - CA-02: Cambio automatico a "En Mantenimiento" al iniciar servicio
  - CA-03: Regreso automatico a "Activa" al completar servicio
  - CA-04: "Dada de Baja" requiere motivo obligatorio

---

## 3. Modulo de Mantenimientos

### RF-020: Registro de Mantenimiento
- **Prioridad:** Critica
- **Descripcion:** Registrar mantenimiento con: fecha recepcion, fecha mantenimiento, tipo, descripcion, observaciones, tecnico responsable, horas actuales, horas hasta proximo, fecha estimada proximo, estado
- **Criterios de aceptacion:**
  - CA-01: Maquina seleccionada via autocomplete
  - CA-02: Tipo seleccionado de catalogo configurable
  - CA-03: Tecnico seleccionado de lista de usuarios con rol Tecnico/Supervisor
  - CA-04: Horas actuales pre-cargadas del ultimo registro
  - CA-05: Estado por defecto: "Programado"
  - CA-06: Auditoria completa registrada

### RF-021: Calculo Automatico de Proximo Mantenimiento
- **Prioridad:** Critica
- **Descripcion:** Calcular fecha estimada del proximo mantenimiento basado en horas de uso y tipo
- **Formula:** Horas hasta proximo = Intervalo del tipo - Horas actuales. Fecha estimada = Fecha actual + (Horas hasta proximo / Promedio horas diarias)
- **Criterios de aceptacion:**
  - CA-01: Calculo automatico al registrar mantenimiento
  - CA-02: Actualizacion al modificar horas de uso
  - CA-03: Valores negativos se muestran como "Vencido"
  - CA-04: Sin datos de promedio se usa estimacion de 8 horas/dia

### RF-022: Gestion de Estados de Mantenimiento
- **Prioridad:** Critica
- **Descripcion:** Estados: Programado, En Proceso, Completado, Cancelado
- **Criterios de aceptacion:**
  - CA-01: Transiciones: Programado -> En Proceso -> Completado
  - CA-02: Cancelado solo desde Programado o En Proceso
  - CA-03: Completado registra fecha real de finalizacion
  - CA-04: Cancelado requiere motivo obligatorio

### RF-023: Historial de Mantenimientos por Maquina
- **Prioridad:** Critica
- **Descripcion:** Lista cronologica completa de todos los mantenimientos de una maquina
- **Criterios de aceptacion:**
  - CA-01: Orden cronologico descendente (mas reciente primero)
  - CA-02: Filtros: tipo, estado, rango de fechas, tecnico
  - CA-03: Exportacion a PDF y CSV
  - CA-04: Paginacion con 10 elementos por pagina

### RF-024: Asignacion de Tecnico
- **Prioridad:** Alta
- **Descripcion:** Asignar tecnico responsable a cada mantenimiento
- **Criterios de aceptacion:**
  - CA-01: Lista filtrada por usuarios activos con rol Tecnico o Supervisor
  - CA-02: Un tecnico puede tener multiples mantenimientos asignados
  - CA-03: Reasignacion permitida con registro de cambio

### RF-025: Edicion de Mantenimiento
- **Prioridad:** Alta
- **Descripcion:** Modificar mantenimiento existente
- **Criterios de aceptacion:**
  - CA-01: Campos editables: descripcion, observaciones, horas, tecnico, estado
  - CA-02: Fecha de mantenimiento editable solo si esta en estado Programado
  - CA-03: Auditoria con valores antes/despues
  - CA-04: No se pueden eliminar mantenimientos (solo cancelar)

### RF-026: Busqueda de Mantenimientos
- **Prioridad:** Alta
- **Descripcion:** Buscar por maquina, tecnico, fecha o tipo
- **Criterios de aceptacion:**
  - CA-01: Busqueda global por texto en descripcion y observaciones
  - CA-02: Filtros avanzados combinables
  - CA-03: Resultados paginados

---

## 4. Modulo de Catalogos

### RF-030: Catalogo de Tipos de Maquina
- **Prioridad:** Alta
- **Descripcion:** CRUD configurable de tipos de maquina
- **Criterios de aceptacion:**
  - CA-01: Campos: nombre, descripcion, estado (activo/inactivo)
  - CA-02: No se puede eliminar tipo en uso
  - CA-03: Desactivar oculta de selects pero mantiene en registros existentes

### RF-031: Catalogo de Tipos de Mantenimiento
- **Prioridad:** Alta
- **Descripcion:** CRUD configurable con valores pre-cargados
- **Valores iniciales:** Preventivo, Correctivo, Predictivo, Inspeccion, Cambio de aceite, Cambio de filtros, Revision general, Reparacion, Otros
- **Criterios de aceptacion:**
  - CA-01: Cada tipo tiene: nombre, descripcion, intervalo_horas_sugerido, estado
  - CA-02: Pre-cargados al instalar el sistema
  - CA-03: No se pueden eliminar tipos en uso

### RF-032: Configuracion de Intervalos
- **Prioridad:** Alta
- **Descripcion:** Asociar intervalos de horas a cada tipo de mantenimiento
- **Criterios de aceptacion:**
  - CA-01: Intervalo configurable por tipo (ej: Cambio aceite = 250 horas)
  - CA-02: Used para calculo automatico de proximo mantenimiento
  - CA-03: Sin intervalo definido, usa valor por defecto (500 horas)

---

## 5. Modulo de Alertas

### RF-040: Alertas por Mantenimiento Proximo
- **Prioridad:** Critica
- **Descripcion:** Generar alerta cuando un mantenimiento esta proximo a vencer
- **Criterios de aceptacion:**
  - CA-01: Dias de anticipacion configurables (default: 15, 7, 3 dias)
  - CA-02: Niveles: info (30d), warning (15d), danger (7d), critical (vencido)
  - CA-03: Se genera automaticamente via tarea programada diaria
  - CA-04: Contador visible en header del dashboard

### RF-041: Alertas por Mantenimiento Vencido
- **Prioridad:** Critica
- **Descripcion:** Generar alerta cuando la fecha de mantenimiento ya paso
- **Criterios de aceptacion:**
  - CA-01: Se genera automaticamente
  - CA-02: Notificacion in-app al jefe de mantenimiento
  - CA-03: Alerta persistente hasta que se resuelva

### RF-042: Notificaciones In-App
- **Prioridad:** Alta
- **Descripcion:** Sistema de notificaciones dentro de la aplicacion
- **Criterios de aceptacion:**
  - CA-01: Campana de notificaciones en el header con contador
  - CA-02: Dropdown con lista de notificaciones recientes
  - CA-03: Marcar como leida individual o todas
  - CA-04: Persistencia de estado (leida/no leida)

### RF-043: Configuracion de Alertas
- **Prioridad:** Alta
- **Descripcion:** El administrador puede configurar dias de anticipacion
- **Criterios de aceptacion:**
  - CA-01: Configurable por tipo de mantenimiento
  - CA-02: Multiples niveles de alerta
  - CA-03: Cambios aplicables inmediatamente

---

## 6. Modulo de Dashboard y Reportes

### RF-050: Dashboard Principal
- **Prioridad:** Critica
- **Descripcion:** Panel principal con metricas clave
- **Criterios de aceptacion:**
  - CA-01: KPIs: total maquinas, mantenimientos del mes, alertas activas, tecnico disponibles
  - CA-02: Grafico de mantenimientos por tipo (barras)
  - CA-03: Grafico de tendencia mensual (linea)
  - CA-04: Lista de proximos mantenimientos (top 5)
  - CA-05: Lista de alertas activas
  - CA-06: Responsive: layout adaptado a movil

### RF-051: Reporte Historial por Maquina
- **Prioridad:** Critica
- **Descripcion:** Historial completo de mantenimientos de una maquina
- **Criterios de aceptacion:**
  - CA-01: Incluye todos los campos del mantenimiento
  - CA-02: Ordenado por fecha descendente
  - CA-03: Exportable a PDF y CSV
  - CA-04: Incluye datos de la maquina en el encabezado

### RF-052: Reporte de Mantenimientos por Periodo
- **Prioridad:** Alta
- **Descripcion:** Mantenimientos en un rango de fechas
- **Criterios de aceptacion:**
  - CA-01: Filtro de rango de fechas obligatorio
  - CA-02: Filtros adicionales: tipo maquina, tipo mantenimiento, tecnico
  - CA-03: Resumen: total, por tipo, por estado
  - CA-04: Exportable a PDF y CSV

### RF-053: Reporte de Cumplimiento
- **Prioridad:** Alta
- **Descripcion:** Porcentaje de mantenimientos completados a tiempo
- **Criterios de aceptacion:**
  - CA-01: Calculo: completados a tiempo / programados totales
  - CA-02: Filtrable por periodo, tipo, tecnico
  - CA-03: Meta configurable (default: 95%)

### RF-054: Reporte de Estado de Flota
- **Prioridad:** Alta
- **Descripcion:** Estado actual de todas las maquinas
- **Criterios de aceptacion:**
  - CA-01: Conteo por estado: activas, en mantenimiento, inactivas, dadas de baja
  - CA-02: Distribucion por tipo de maquina
  - CA-03: Tiempo promedio de mantenimiento

### RF-055: Exportacion de Reportes
- **Prioridad:** Alta
- **Descripcion:** Exportar cualquier reporte a PDF o CSV
- **Criterios de aceptacion:**
  - CA-01: PDF con formato profesional (logo, fecha, filtros aplicados)
  - CA-02: CSV con datos planos
  - CA-03: Nombre de archivo descriptivo con fecha

---

## 7. Modulo de Auditoria

### RF-060: Registro de Auditoria
- **Prioridad:** Alta
- **Descripcion:** Registrar cada accion critica del sistema
- **Criterios de aceptacion:**
  - CA-01: Captura: usuario, accion, fecha/hora, IP, datos antes/despues
  - CA-02: Acciones registradas: login, logout, create, update, delete, export
  - CA-03: Registros inmutables (no editables ni eliminables)

### RF-061: Consulta de Auditoria
- **Prioridad:** Alta
- **Descripcion:** Consultar log de auditoria con filtros
- **Criterios de aceptacion:**
  - CA-01: Filtros: usuario, accion, rango de fechas
  - CA-02: Paginacion con 50 registros por pagina
  - CA-03: Exportacion a CSV
  - CA-04: Accesible solo por administradores

---

## 8. Modulo de Configuracion

### RF-070: Configuracion General
- **Prioridad:** Media
- **Descripcion:** Parametros generales del sistema
- **Criterios de aceptacion:**
  - CA-01: Nombre de empresa, logo, moneda
  - CA-02: Zona horaria
  - CA-03: Idioma (default: espanol)

### RF-071: Gestion de Sesiones
- **Prioridad:** Media
- **Descripcion:** Control de sesiones activas
- **Criterios de aceptacion:**
  - CA-01: Timeout de sesion configurable (default: 30 min)
  - CA-02: Maximo una sesion activa por usuario
  - CA-03: Admin puede cerrar sesiones de otros usuarios

---

## 9. Modulo de Interfaz

### RF-080: Responsive Design
- **Prioridad:** Critica
- **Descripcion:** La interfaz debe adaptarse a PC, tablet y movil
- **Criterios de aceptacion:**
  - CA-01: Breakpoints: movil (< 768px), tablet (768-1024px), desktop (> 1024px)
  - CA-02: Navegacion colapsable en movil (hamburger menu)
  - CA-03: Tablas con scroll horizontal en movil
  - CA-04: Formularios de una columna en movil

### RF-081: Navegacion
- **Prioridad:** Alta
- **Descripcion:** Menu lateral con secciones segun rol
- **Criterios de aceptacion:**
  - CA-01: Menu lateral fijo en desktop, drawer en movil
  - CA-02: Indicador de seccion activa
  - CA-03: Breadcrumb para navegacion profunda
  - CA-04: Buscador global en header

### RF-082: Formularios
- **Prioridad:** Alta
- **Descripcion:** Formularios con validacion en tiempo real
- **Criterios de aceptacion:**
  - CA-01: Validacion en tiempo real (on blur)
  - CA-02: Mensajes de error claros y especificos
  - CA-03: Campos obligatorios marcados con asterisco
  - CA-04: Confirmacion antes de guardar
  - CA-05: No perder datos al navegar accidentalmente

### RF-083: Feedback al Usuario
- **Prioridad:** Alta
- **Descripcion:** Indicadores de carga, mensajes de exito/error
- **Criterios de aceptacion:**
  - CA-01: Spinner/loading durante operaciones async
  - CA-02: Toast notifications para exito/error
  - CA-03: Skeleton loading para datos
  - CA-04: Empty states ilustrados

---

*Requisitos Funcionales v1.0 - 26/08/2026*
