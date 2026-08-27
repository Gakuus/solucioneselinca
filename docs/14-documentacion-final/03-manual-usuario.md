# Manual de Usuario

## MantenimientoPlus

**Version:** 1.0 | **Fecha:** 26 de Agosto de 2026

---

## 1. Inicio de Sesion

1. Abrir la aplicacion en el navegador: `https://app.mantenimientoplus.com`
2. Ingresar su email corporativo
3. Ingresar su contrasena
4. Hacer clic en "Iniciar Sesion"
5. Si es su primer ingreso, se le pedira cambiar la contrasena

**Olvido su contrasena?** Haga clic en "Olvidaste tu contrasena?" y siga las instrucciones enviadas a su email.

---

## 2. Navegacion General

El menu lateral izquierdo contiene todas las secciones disponibles segun su rol:
- **Dashboard** - Vista general del sistema
- **Maquinas** - Gestion de maquinaria
- **Mantenimientos** - Gestion de servicios
- **Reportes** - Generacion de reportes
- **Alertas** - Notificaciones pendientes
- **Usuarios** (solo Admin) - Gestion de usuarios
- **Auditoria** (solo Admin) - Log de acciones
- **Configuracion** (solo Admin) - Parametros del sistema

---

## 3. Gestion de Maquinas

### 3.1 Registrar Nueva Maquina
1. Ir a **Maquinas** > clic en **"+ Nueva Maquina"**
2. Completar los campos obligatorios (marcados con *):
   - Codigo Interno (debe ser unico)
   - Nombre descriptivo
   - Tipo de maquina (seleccionar del catalogo)
   - Marca
   - Modelo
3. Completar campos opcionales: Numero de serie, Anio, Horas promedio diarias
4. Hacer clic en **"Guardar"**
5. La maquina aparecera con estado "Activa"

### 3.2 Buscar Maquinas
1. En la lista de maquinas, usar la barra de busqueda
2. Puede buscar por codigo, nombre, marca o modelo
3. Los resultados se filtran en tiempo real

### 3.3 Filtrar Maquinas
1. Usar los dropdowns de filtro: Estado, Tipo, Marca
2. Los filtros se pueden combinar
3. Hacer clic en "Limpiar filtros" para quitar todos

### 3.4 Ver Detalle de Maquina
1. En la lista, hacer clic en el icono de ojo (👁) de la maquina
2. Se muestra toda la informacion registrada
3. Se muestra el historial de mantenimientos

### 3.5 Editar Maquina
1. En la lista, hacer clic en el icono de lapiz (✏)
2. Modificar los campos deseados
3. Hacer clic en **"Guardar"**

### 3.6 Cambiar Estado de Maquina
1. En el detalle de la maquina, hacer clic en **"Cambiar Estado"**
2. Seleccionar el nuevo estado
3. Si es "Dada de Baja", ingresar el motivo (obligatorio)
4. Confirmar el cambio

### 3.7 Exportar a CSV
1. En la lista de maquinas, aplicar los filtros deseados
2. Hacer clic en **"Exportar CSV"**
3. Se descargara un archivo con los datos filtrados

---

## 4. Gestion de Mantenimientos

### 4.1 Registrar Mantenimiento
1. Ir a **Mantenimientos** > clic en **"+ Nuevo Mantenimiento"**
2. Seleccionar la maquina (el sistema mostrara horas actuales y ultimo servicio)
3. Seleccionar tipo de mantenimiento
4. Seleccionar tecnico responsable
5. Ingresar fecha de recepcion
6. Ingresar horas actuales de uso
7. Descripcion del trabajo realizado
8. El sistema calculara automaticamente el proximo mantenimiento
9. Hacer clic en **"Guardar"**

### 4.2 Cambiar Estado de Mantenimiento
- **Programado** → En Proceso (al iniciar el trabajo)
- **En Proceso** → Completado (al terminar)
- **Programado/En Proceso** → Cancelado (con motivo obligatorio)

### 4.3 Completar Mantenimiento
1. En el detalle del mantenimiento, hacer clic en **"Completar"**
2. La maquina volvera automaticamente a estado "Activa"
3. Se registrara la fecha de completado

---

## 5. Alertas

### 5.1 Ver Alertas
1. Ir a **Alertas** o hacer clic en la campana del header
2. Se muestran todas las alertas pendientes
3. Las alertas en rojo indican vencimiento critico

### 5.2 Marcar Alerta como Leida
1. Hacer clic en **"Marcar como leida"** en la alerta
2. La alerta se移ira de la lista de pendientes
3. El contador de la campana disminuira

---

## 6. Dashboard

El dashboard muestra:
- **KPIs principales:** Total de maquinas, mantenimientos del mes, alertas activas, tecnicos disponibles
- **Grafico de barras:** Mantenimientos por tipo
- **Grafico de linea:** Tendencia de mantenimientos (ultimos 6 meses)
- **Proximos mantenimientos:** Los 5 proximos servicios programados
- **Alertas activas:** Las 5 alertas mas urgentes

---

## 7. Reportes

### 7.1 Generar Reporte
1. Ir a **Reportes**
2. Seleccionar el tipo de reporte deseado
3. Aplicar los filtros correspondientes
4. Hacer clic en **"Generar"**
5. El reporte se mostrara en pantalla

### 7.2 Exportar Reporte
- **PDF:** Hacer clic en "Exportar PDF" para descargar formato profesional
- **CSV:** Hacer clic en "Exportar CSV" para datos tabulados

---

## 8. Mi Perfil

1. Hacer clic en su avatar (esquina superior derecha)
2. Seleccionar **"Mi Perfil"**
3. Puede actualizar su nombre y contrasena
4. Hacer clic en **"Guardar Cambios"**

---

## 9. Cerrar Sesion

1. Hacer clic en su avatar
2. Seleccionar **"Cerrar Sesion"**
3. Su sesion se cerrara y sera redirigido al login

---

## 10. Preguntas Frecuentes

**No puedo iniciar sesion**
- Verifique que su email y contrasena sean correctos
- Si fallo 5 veces, su cuenta esta bloqueada por 30 minutos
- Contacte al administrador si el problema persiste

**No ve una seccion del menu**
- Su rol no tiene permisos para esa seccion
- Contacte al administrador si necesita acceso

**La aplicacion se ve diferente en mi celular**
- MantenimientoPlus se adapta automaticamente a su dispositivo
- Algunas funciones avanzadas estan optimizadas para desktop

---

*Manual de Usuario v1.0*
