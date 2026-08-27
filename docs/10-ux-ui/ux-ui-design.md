# Diseno UX/UI

## MantenimientoPlus

**Version:** 1.0 | **Fecha:** 26 de Agosto de 2026

---

## 1. Principios de Diseno

1. **Simplicidad:** Interfaz limpia, sin elementos redundantes
2. **Consistencia:** Patrones uniformes en toda la aplicacion
3. **Accesibilidad:** WCAG 2.1 AA minimo
4. **Responsive:** Experiencia optima en todos los dispositivos
5. **Feedback:** Siempre informar al usuario del resultado de sus acciones
6. **Eficiencia:** Minimizar clicks para completar tareas

## 2. Paleta de Colores

| Uso | Color | Hex |
|---|---|---|
| Primario | Azul corporativo | #2563EB |
| Primario oscuro | Hover | #1D4ED8 |
| Secundario | Gris corporativo | #64748B |
| Exito | Verde | #16A34A |
| Advertencia | Amarillo | #EAB308 |
| Error/Peligro | Rojo | #DC2626 |
| Info | Azul claro | #0EA5E9 |
| Fondo principal | Gris claro | #F8FAFC |
| Fondo sidebar | Azul oscuro | #1E293B |
| Texto principal | Negro | #0F172A |
| Texto secundario | Gris | #64748B |
| Borde | Gris claro | #E2E8F0 |

## 3. Tipografia

| Elemento | Font | Size | Weight |
|---|---|---|---|
| H1 | Inter | 28px | Bold |
| H2 | Inter | 24px | Semibold |
| H3 | Inter | 20px | Semibold |
| Body | Inter | 14px | Regular |
| Small | Inter | 12px | Regular |
| Button | Inter | 14px | Medium |

## 4. Breakpoints

| Dispositivo | Ancho | Layout |
|---|---|---|
| Movil | < 768px | 1 columna, sidebar colapsada (hamburger) |
| Tablet | 768-1024px | 2 columnas, sidebar icon-only |
| Desktop | > 1024px | Layout completo con sidebar fijo |

---

## 5. Pantallas Detalladas

### 5.1 Login

**Objetivo:** Autenticar al usuario de forma segura y rapida.

**Componentes:**
- Logo de la empresa (centrado arriba)
- Formulario centrado con:
  - Campo email (con icono de envelope)
  - Campo contrasena (con icono de candado y toggle show/hide)
  - Boton "Iniciar Sesion" (primario, full-width)
  - Link "Olvidaste tu contrasena?" (debajo del boton)
- Footer con copyright

**Wireframe textual:**
```
┌─────────────────────────────────────────┐
│                                         │
│              [LOGO EMPRESA]             │
│                                         │
│         ┌─────────────────────┐         │
│         │  Email              │         │
│         │  [input email]      │         │
│         │                     │         │
│         │  Contrasena         │         │
│         │  [input password]   │         │
│         │                     │         │
│         │  [  Iniciar Sesion  ]│         │
│         │                     │         │
│         │  Olvidaste tu pass? │         │
│         └─────────────────────┘         │
│                                         │
│         Copyright 2026                  │
└─────────────────────────────────────────┘
```

**Flujo de usuario:**
1. Ingresa email y contrasena
2. Hace clic en "Iniciar Sesion"
3. Si exitoso -> Redirige a Dashboard
4. Si error -> Muestra toast de error
5. Si bloqueado -> Muestra mensaje de bloqueo con tiempo restante

**Validaciones en tiempo real:**
- Email: formato valido, no vacio
- Contrasena: minimo 8 caracteres

---

### 5.2 Dashboard Principal

**Objetivo:** Proveer vision rapida del estado operativo de la flota.

**Componentes:**
- Header: Logo, buscador global, campana de notificaciones (con contador), avatar con dropdown de usuario
- Sidebar: Navegacion principal
- Contenido:
  - Fila de KPIs (4 cards): Total Maquinas, Mantenimientos del Mes, Alertas Activas, Tecnicos Disponibles
  - Grafico de barras: Mantenimientos por Tipo (ultimo mes)
  - Grafico de linea: Tendencia de Mantenimientos (ultimos 6 meses)
  - Lista: Proximos Mantenimientos (top 5)
  - Lista: Alertas Activas (top 5)

**Wireframe textual:**
```
┌──────────────────────────────────────────────────────────────┐
│ [Logo]  [Buscador global...........]  [🔔 3] [Avatar ▼]     │
├──────────┬───────────────────────────────────────────────────┤
│          │                                                   │
│ Dashboard│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐            │
│ Maquinas │  │ 🏗️   │ │ 🔧   │ │ ⚠️   │ │ 👷   │            │
│ Manttos  │  │ 45   │ │ 12   │ │ 8    │ │ 6    │            │
│ Reportes │  │ Total│ │ Mes  │ │Alerts│ │Tecs  │            │
│ Alertas  │  └──────┘ └──────┘ └──────┘ └──────┘            │
│ Auditoria│                                                   │
│ Config   │  ┌─────────────────┐ ┌─────────────────┐        │
│          │  │ Manttos por tipo│ │ Tendencia 6m    │        │
│          │  │ [grafico barras]│ │ [grafico linea] │        │
│          │  └─────────────────┘ └─────────────────┘        │
│          │                                                   │
│          │  ┌─────────────────┐ ┌─────────────────┐        │
│          │  │ Proximos Manttos│ │ Alertas Activas │        │
│          │  │ EXC-001 15/09  │ │ EXC-001 🔴 3d   │        │
│          │  │ GRU-002 20/09  │ │ GRU-002 🟡 7d   │        │
│          │  │ BUL-003 25/09  │ │ BUL-003 🟠 12d  │        │
│          │  └─────────────────┘ └─────────────────┘        │
└──────────┴───────────────────────────────────────────────────┘
```

**Cards KPI - Colores segun estado:**
- Total Maquinas: Azul primario
- Mantenimientos del Mes: Verde (si >= meta) o Amarillo
- Alertas: Rojo si > 0 vencidas, Amarillo si solo proximas
- Tecnicos: Gris

---

### 5.3 Lista de Maquinas

**Objetivo:** Ver, buscar y filtrar todas las maquinas registradas.

**Componentes:**
- Barra de acciones: Boton "+ Nueva Maquina", Boton "Exportar CSV"
- Barra de busqueda y filtros:
  - Input de busqueda (texto libre)
  - Filtro: Estado (dropdown)
  - Filtro: Tipo de maquina (dropdown)
  - Filtro: Marca (dropdown)
  - Boton "Limpiar filtros"
- Tabla de maquinas:
  - Columnas: Codigo, Nombre, Tipo, Marca, Modelo, Estado, Acciones
  - Ordenamiento por columnas (clic en header)
  - Badge de color para estado
  - Iconos de accion: Ver detalle, Editar
- Paginacion inferior

**Wireframe textual:**
```
┌──────────────────────────────────────────────────────────────┐
│ Maquinas                              [+ Nueva] [Exportar]   │
├──────────────────────────────────────────────────────────────┤
│ [🔍 Buscar...] [Estado ▼] [Tipo ▼] [Marca ▼] [Limpiar]     │
├──────┬────────┬──────────────┬────────┬───────┬────────┬─────┤
│ Codigo│ Nombre │ Tipo         │ Marca  │ Estado│ Modelo │ Acc │
├──────┼────────┼──────────────┼────────┼───────┼────────┼─────┤
│EXC001│Exc CAT │Excavadora    │CAT     │🟢 Act │ 320F   │ 👁 ✏│
│GRU001│Grua    │Grua          │Liebherr│🟡 Mant│ LTM1100│ 👁 ✏│
│BUL001│Buldozer│Buldoser      │CAT     │🟢 Act │ D6     │ 👁 ✏│
├──────┴────────┴──────────────┴────────┴───────┴────────┴─────┤
│                    « 1 2 3 »                                 │
└──────────────────────────────────────────────────────────────┘
```

---

### 5.4 Formulario Nueva Maquina

**Objetivo:** Registrar una nueva maquina en el sistema.

**Componentes:**
- Header con titulo "Nueva Maquina" y breadcrumb
- Formulario de una columna (responsive) o dos columnas (desktop)
- Campos:
  - Codigo Interno* (input, validacion unica en tiempo real)
  - Nombre* (input)
  - Tipo de Maquina* (select/searchable)
  - Marca* (input o select)
  - Modelo* (input)
  - Numero de Serie (input, opcional)
  - Anio (input numerico, opcional)
  - Horas Promedio Diarias (input numerico, default 8)
- Botones: "Guardar" (primario) y "Cancelar" (secundario)
- Indicadores de campos obligatorios con asterisco rojo

---

### 5.5 Detalle de Maquina

**Objetivo:** Ver toda la informacion de una maquina y su historial.

**Componentes:**
- Header con Codigo y Nombre, badge de estado
- Seccion de datos: Todos los campos en layout de grid
- Acciones: Editar, Cambiar Estado, Nuevo Mantenimiento
- Tabla de historial de mantenimientos (ultimos 10 con link a ver todos)
- Indicador de proximo mantenimiento (countdown visual)

---

### 5.6 Lista de Mantenimientos

**Objetivo:** Ver y filtrar todos los mantenimientos registrados.

**Componentes:**
- Barra de acciones: "+ Nuevo Mantenimiento", "Exportar"
- Filtros: Maquina, Tecnico, Tipo, Estado, Rango de fechas
- Tabla: Fecha, Maquina, Tipo, Tecnico, Horas, Estado, Acciones
- Paginacion

---

### 5.7 Formulario Nuevo Mantenimiento

**Objetivo:** Registrar un mantenimiento de forma rapida y completa.

**Componentes:**
- Maquina* (autocomplete/searchable select)
- Al seleccionar maquina: muestra horas actuales y ultimo mantenimiento
- Tipo de Mantenimiento* (select del catalogo)
- Tecnico Responsable* (select de usuarios tecnico/supervisor)
- Fecha de Recepcion* (date picker)
- Fecha de Mantenimiento (date picker)
- Horas Actuales de Uso* (input numerico)
- Descripcion* (textarea)
- Observaciones (textarea, opcional)
- Panel de calculo automatico:
  - "Horas hasta proximo: [calculado]"
  - "Fecha estimada proximo: [calculado]"
- Botones: "Guardar" y "Cancelar"

---

### 5.8 Reportes

**Objetivo:** Generar y exportar reportes operativos y gerenciales.

**Componentes:**
- Grid de tipos de reporte (cards clickeables):
  - Historial por Maquina
  - Mantenimientos por Periodo
  - Cumplimiento
  - Estado de Flota
  - Carga de Tecnicos
- Al seleccionar reporte:
  - Filtros especificos
  - Boton "Generar"
  - Area de resultados (tablas + graficos)
  - Botones "Exportar PDF" y "Exportar CSV"

---

### 5.9 Gestion de Usuarios (Admin)

**Objetivo:** Administrar usuarios del sistema.

**Componentes:**
- Tabla de usuarios con: Nombre, Email, Rol, Estado, Ultimo Login, Acciones
- Boton "+ Nuevo Usuario"
- Modal de creacion/edicion:
  - Nombre*, Email*, Rol* (select), Contrasena (solo en creacion)
- Toggle de activar/desactivar
- Confirmacion antes de desactivar

---

### 5.10 Auditoria (Admin)

**Objetivo:** Consultar el log de acciones del sistema.

**Componentes:**
- Filtros: Usuario, Accion, Tipo de Entidad, Rango de fechas
- Tabla: Fecha/Hora, Usuario, Accion, Entidad, Detalle, IP
- Detalle expandible con old_values y new_values (JSON diff)
- Boton "Exportar CSV"

---

### 5.11 Configuracion (Admin)

**Objetivo:** Parametrizar el sistema.

**Componentes:**
- Tabs: General, Alertas, Catalogos, Sesiones
- General: Nombre empresa, Logo, Zona horaria
- Alertas: Dias de anticipacion por tipo
- Catalogos: CRUD de tipos de maquina y tipos de mantenimiento
- Sesiones: Timeout, politica de contrasenas

---

## 6. Componentes UI Reutilizables

| Componente | Descripcion | Uso |
|---|---|---|
| Button | Primario, Secundario, Peligro, Texto | Acciones |
| Input | Texto, Password, Number, Date | Formularios |
| Select | Dropdown simple, searchable | Selecciones |
| Table | Ordenable, con paginacion | Listas de datos |
| Modal | Dialogo de confirmacion, formularios | Acciones que requieren confirmacion |
| Toast | Exito, Error, Warning, Info | Feedback |
| Badge | Colores por estado/rol | Indicadores |
| Card | Container con header y body | KPIs, contenido |
| Sidebar | Navegacion lateral fija | Layout |
| Spinner | Loading indicator | Operaciones async |
| EmptyState | Ilustracion + mensaje | Sin datos |
| Pagination | Anterior/Siguiente + numeros | Listas |
| DateRangePicker | Seleccion de rango de fechas | Filtros de reportes |
| SearchInput | Input con debounce y icono | Busquedas |

---

## 7. Flujo de Navegacion

```
Login
  └── Dashboard
       ├── Maquinas
       │    ├── Lista
       │    ├── Nuevo (Formulario)
       │    └── Detalle
       │         ├── Editar (Formulario)
       │         ├── Historial
       │         └── Nuevo Mantenimiento
       ├── Mantenimientos
       │    ├── Lista
       │    ├── Nuevo (Formulario)
       │    └── Detalle/Editar
       ├── Reportes
       │    ├── Tipo de Reporte
       │    └── Resultados + Exportar
       ├── Alertas
       │    └── Lista + Marcar Leida
       ├── [Admin] Usuarios
       │    ├── Lista
       │    └── Nuevo/Editar (Modal)
       ├── [Admin] Auditoria
       │    └── Lista + Filtros
       └── [Admin] Configuracion
            └── Tabs de configuracion
```

---

## 8. Estados de UI

### 8.1 Loading States
- **Skeleton screens** para listas y tablas
- **Spinner centralizado** para operaciones puntuales
- **Optimistic updates** para marcar alertas como leidas

### 8.2 Empty States
- Maquinas: "No hay maquinas registradas. [Crear primera maquina]"
- Mantenimientos: "No hay mantenimientos. [Registrar mantenimiento]"
- Alertas: "No hay alertas pendientes. Todo esta al dia."
- Reportes: "Selecciona un tipo de reporte para comenzar."

### 8.3 Error States
- **Formularios:** Mensaje inline debajo del campo con error
- **Tablas:** "Error al cargar datos. [Reintentar]"
- **Pagina completa:** "Algo salio mal. [Volver al dashboard]"
- **404:** "Pagina no encontrada. [Volver al inicio]"

### 8.4 Success States
- **Toast verde** con mensaje: "Maquina creada exitosamente"
- **Toast verde:** "Mantenimiento registrado"
- **Toast verde:** "Reporte exportado"

---

*Diseno UX/UI v1.0 - 26/08/2026*
