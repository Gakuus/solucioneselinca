# Guia de Despliegue

## MantenimientoPlus

**Version:** 1.0 | **Fecha:** 26 de Agosto de 2026

---

## 1. Requisitos Previos

### Servidor Minimo (Produccion)
- **CPU:** 2 nucleos
- **RAM:** 4 GB
- **Disco:** 40 GB SSD
- **OS:** Ubuntu 22.04 LTS
- **Docker:** 24.x
- **Docker Compose:** v2.x

### Dominio y SSL
- Dominio configurado (ej: app.mantenimientoplus.com)
- Certificado SSL (Let's Encrypt o comercial)
- DNS apuntando al servidor

---

## 2. Preparacion del Servidor

### 2.1 Instalar Docker
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
sudo usermod -aG docker $USER
```

### 2.2 Instalar Docker Compose
```bash
sudo apt install docker-compose-plugin
```

### 2.3 Clonar Repositorio
```bash
git clone https://github.com/org/mantenimientoplus.git
cd mantenimientoplus
```

### 2.4 Configurar Variables de Entorno
```bash
cp .env.example .env
# Editar .env con valores de produccion
nano .env
```

Variables requeridas en `.env`:
```
DATABASE_URL=postgresql://user:password@postgres:5432/mantenimientoplus
REDIS_URL=redis://redis:6379
JWT_SECRET=<generar con openssl rand -base64 32>
DB_NAME=mantenimientoplus
DB_USER=<usuario_seguro>
DB_PASSWORD=<contrasena_segura>
REDIS_PASSWORD=<contrasena_redis>
NODE_ENV=production
SENTRY_DSN=<dsn_de_sentry>
```

---

## 3. Despliegue

### 3.1 Build y Levantar
```bash
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
```

### 3.2 Ejecutar Migraciones
```bash
docker compose -f docker-compose.prod.yml exec app npx prisma migrate deploy
```

### 3.3 Seed Data Inicial
```bash
docker compose -f docker-compose.prod.yml exec app npx prisma db seed
```

### 3.4 Verificar Salud
```bash
# Health check
curl http://localhost:3000/health

# Ver logs
docker compose -f docker-compose.prod.yml logs -f app
```

---

## 4. Configuracion Nginx

### 4.1 SSL con Let's Encrypt
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d app.mantenimientoplus.com
```

### 4.2 Verificar Configuracion
```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## 5. Monitoreo Post-Despliegue

### 5.1 Verificar Metricas
- Abrir Grafana: `http://localhost:3001` (admin/grafana)
- Dashboard de Application Overview debe mostrar datos
- Verificar que las alertas estan configuradas

### 5.2 Verificar Backups
```bash
# Ejecutar backup manual de prueba
./scripts/backup.sh
# Verificar que se creo el archivo
ls -la /backups/postgres/
```

### 5.3 Verificar Logs
```bash
# Logs de la aplicacion
docker compose -f docker-compose.prod.yml logs app | tail -50

# Logs de nginx
sudo tail -f /var/log/nginx/access.log
```

---

## 6. Rollback

Si hay problemas post-despliegue:

```bash
# Detener la nueva version
docker compose -f docker-compose.prod.yml down

# Restaurar la imagen anterior
git checkout <previous-tag>
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d

# Si hay cambios de BD, revertir migracion
docker compose -f docker-compose.prod.yml exec app npx prisma migrate resolve --rolled-back <migration_name>
```

---

## 7. Actualizaciones

### Proceso de Actualizacion
1. Crear branch `release/X.Y.Z`
2. Actualizar version en `package.json`
3. Crear PR a `main`
4. Code review y merge
5. Tag: `git tag vX.Y.Z`
6. Push tag: `git push origin vX.Y.Z`
7. Pipeline CI/CD despliega automaticamente a produccion

---

*Guia de Despliegue v1.0*
