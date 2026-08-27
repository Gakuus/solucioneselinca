# Manual de Administrador

## MantenimientoPlus

**Version:** 1.0 | **Fecha:** 26 de Agosto de 2026

---

## 1. Administracion de Usuarios

### 1.1 Crear Usuario
1. Ir a **Configuracion** > **Usuarios**
2. Hacer clic en **"+ Nuevo Usuario"**
3. Completar: Nombre, Email, Rol, Contrasena inicial
4. Roles disponibles:
   - **Admin** - Acceso total al sistema
   - **Supervisor** - Gestion de mantenimientos y reportes
   - **Technician** - Registro de mantenimientos asignados
   - **Viewer** - Solo lectura
5. Hacer clic en **"Crear"**
6. El usuario recibira un email con sus credenciales

### 1.2 Editar Usuario
1. En la lista, hacer clic en el icono de editar
2. Modificar nombre, email o rol
3. La contrasena solo se puede restablecer, no editar
4. Hacer clic en **"Guardar"**

### 1.3 Desactivar Usuario
1. En la lista, hacer clic en el toggle de estado
2. Confirmar la desactivacion
3. El usuario no podra iniciar sesion
4. Sus datos se mantienen en el sistema

### 1.4 Restablecer Contrasena
1. En el detalle del usuario, hacer clic en **"Restablecer Contrasena"**
2. Se enviara un email con un enlace para crear nueva contrasena
3. El enlace expira en 24 horas

---

## 2. Gestion de Catalogos

### 2.1 Tipos de Maquina
1. Ir a **Configuracion** > **Catalogos** > **Tipos de Maquina**
2. **Agregar:** Hacer clic en "+", ingresar nombre y descripcion, guardar
3. **Editar:** Hacer clic en el nombre, modificar, guardar
4. **Eliminar:** Solo si no hay maquinas asociadas

### 2.2 Tipos de Mantenimiento
1. Ir a **Configuracion** > **Catalogos** > **Tipos de Mantenimiento**
2. Mismo proceso que tipos de maquina
3. Puede definir si es preventivo o correctivo por defecto

---

## 3. Configuracion del Sistema

### 3.1 General
- Nombre de la empresa
- Logo (para reportes PDF)
- Zona horaria

### 3.2 Alertas
- Dias de anticipacion para mantenimiento preventivo por tipo de maquina
- Dias de anticipacion para mantenimiento correctivo
- Configurar alertas por horas de uso

### 3.3 Seguridad
- Tiempo de expiracion de sesion (default: 8 horas)
- Politica de contrasenas:
  - Minimo de caracteres (default: 8)
  - Requerir mayusculas (default: si)
  - Requerir numeros (default: si)
  - Reutilizacion (default: ultimas 5 no repetir)

---

## 4. Auditoria

### 4.1 Consultar Log
1. Ir a **Auditoria**
2. Aplicar filtros: Usuario, Accion, Entidad, Rango de fechas
3. Los registros muestran: Fecha, Usuario, Accion, Entidad, IP

### 4.2 Ver Detalle
1. Hacer clic en un registro de auditoria
2. Se expande mostrando los valores anteriores y nuevos
3. El formato es JSON diff para facilitar la comparacion

### 4.3 Exportar
1. Aplicar filtros deseados
2. Hacer clic en **"Exportar CSV"**
3. Se descargara el log filtrado

---

## 5. Monitoreo del Sistema

### 5.1 Metricas Disponibles (Grafana)
- Usuarios activos simultaneos
- Request por minuto
- Tiempo de respuesta promedio
- Tasa de errores
- Uso de memoria y CPU

### 5.2 Alertas Automaticas del Sistema
- Si hay mas de 10 alertas vencidas pendientes
- Si un usuario tiene mas de 3 intentos fallidos
- Si la base de datos supera el 80% de uso

---

## 6. Respaldos

### 6.1 Verificar Backups
1. Los backups de PostgreSQL se ejecutan diariamente a las 2:00 AM UTC
2. Se almacenan en `/backups/postgres/` y se sincronizan a S3
3. Retencion: 30 dias

### 6.2 Restaurar Backup
```bash
# Restaurar desde backup
gunzip -c /backups/postgres/mantenimientoplus_YYYYMMDD.sql.gz | psql $DATABASE_URL
```

### 6.3 Politica de Retencion
| Dato | Retencion |
|---|---|
| Datos de maquinas | Indefinido |
| Mantenimientos | Indefinido |
| Auditoria | 2 anos |
| Logs de aplicacion | 30 dias |
| Backups | 30 dias |

---

*Manual de Administrador v1.0*
