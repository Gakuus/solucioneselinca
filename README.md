# MantenimientoPlus

Plataforma web completa para la gestión de mantenimiento de maquinaria de construcción.

## 🚀 Características Principales

- **Gestión de Máquinas**: CRUD completo con estados, historial y exportación CSV
- **Mantenimientos**: Creación, seguimiento y gestión de estados (Programado → En Progreso → Completado)
- **Programación**: Automatización de mantenimientos preventivos con frecuencias configurables
- **Alertas**: Sistema de notificaciones para mantenimientos próximos y vencidos
- **Reportes**: Métricas detalladas de costos, eficiencia y productividad
- **Auditoría**: Traza completa de acciones del sistema
- **Dashboard**: Vista general con estadísticas y métricas en tiempo real

## 🛠️ Tecnologías

### Backend
- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js
- **Base de Datos**: PostgreSQL 15 + Prisma ORM
- **Cache**: Redis 7
- **Auth**: JWT (Access + Refresh Tokens)
- **Validación**: Zod

### Frontend
- **Framework**: React 18 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Build**: Vite
- **State**: Zustand
- **Routing**: React Router v6
- **HTTP**: Axios

### Infraestructura
- **Containerización**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **Testing**: Jest + React Testing Library

## 📦 Instalación

### Prerrequisitos
- Node.js 18+
- PostgreSQL 15+
- Redis 7+
- Docker + Docker Compose (opcional)

### Opción 1: Con Docker (Recomendado)

```bash
# Clonar el repositorio
git clone https://github.com/Gakuus/solucioneselinca.git
cd solucioneselinca

# Crear archivo .env
cp .env.example .env
# Editar .env con tus configuraciones

# Levantar servicios
docker-compose up -d

# Instalar dependencias del backend
cd backend && npm install

# Instalar dependencias del frontend
cd ../frontend && npm install

# Ejecutar migraciones
cd ../backend && npm run db:migrate

# Sembrar datos de prueba
npm run db:seed

# Iniciar desarrollo
npm run dev  # Backend en http://localhost:3000
npm run dev  # Frontend en http://localhost:5173
```

### Opción 2: Sin Docker

```bash
# Clonar el repositorio
git clone https://github.com/Gakuus/solucioneselinca.git
cd solucioneselinca

# Configurar PostgreSQL
createdb mantenimientoplus

# Crear archivo .env en backend/
cat > backend/.env << EOF
DATABASE_URL=postgresql://user:password@localhost:5432/mantenimientoplus
REDIS_URL=redis://localhost:6379
JWT_SECRET=tu-secret-aqui
JWT_REFRESH_SECRET=tu-refresh-secret-aqui
CORS_ORIGIN=http://localhost:5173
EOF

# Instalar dependencias
cd backend && npm install
cd ../frontend && npm install

# Ejecutar migraciones
cd ../backend && npm run db:migrate

# Sembrar datos de prueba
npm run db:seed

# Iniciar desarrollo
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
cd frontend && npm run dev
```

## 🔐 Autenticación

### Usuarios de Prueba

| Email | Contraseña | Rol |
|-------|-----------|-----|
| admin@inca.com | Admin123! | ADMIN |
| supervisor@inca.com | Super123! | SUPERVISOR |
| tecnico@inca.com | Tecnico123! | TECHNICIAN |
| viewer@inca.com | Viewer123! | VIEWER |

### Roles y Permisos

- **ADMIN**: Acceso completo a todas las funcionalidades
- **SUPERVISOR**: Gestión de mantenimientos, máquinas y reportes
- **TECHNICIAN**: Visualización y actualización de mantenimientos asignados
- **VIEWER**: Solo lectura

## 📁 Estructura del Proyecto

```
solucioneselinca/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma        # Schema de Prisma
│   │   └── seed.ts              # Datos de prueba
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/            # Autenticación
│   │   │   ├── machines/        # Gestión de máquinas
│   │   │   ├── maintenances/    # Gestión de mantenimientos
│   │   │   ├── scheduling/      # Programación preventiva
│   │   │   ├── alerts/          # Sistema de alertas
│   │   │   ├── reports/         # Reportes y métricas
│   │   │   ├── audit/           # Auditoría
│   │   │   ├── catalogs/        # Catálogos (tipos)
│   │   │   ├── users/           # Gestión de usuarios
│   │   │   └── dashboard/       # Estadísticas
│   │   ├── shared/
│   │   │   └── middleware/      # Middleware compartido
│   │   └── app.ts               # Entry point
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/               # Páginas de la aplicación
│   │   ├── services/            # Servicios API
│   │   ├── stores/              # Estado global (Zustand)
│   │   ├── components/
│   │   │   ├── auth/            # Componentes de autenticación
│   │   │   └── layout/          # Layout y navegación
│   │   └── App.tsx              # Router principal
│   ├── Dockerfile
│   └── package.json
├── docs/                        # Documentación completa
│   ├── 01-resumen-ejecutivo/
│   ├── 02-vision-requerimientos/
│   ├── 03-arquitectura-plataforma/
│   ├── 04-diseno-interfaz-ux/
│   ├── 05-modelo-datos/
│   ├── 06-api-rest/
│   ├── 07-desarrollo-mobile/
│   ├── 08-seguridad/
│   ├── 09-devops/
│   ├── 10-pruebas/
│   ├── 11-gestion-proyecto/
│   ├── 12-monitoreo/
│   ├── 13-roadmap/
│   └── 14-anexos/
├── docker-compose.yml
├── docker-compose.override.yml
└── .github/workflows/ci.yml
```

## 🔧 API Endpoints

### Autenticación
- `POST /api/v1/auth/login` - Iniciar sesión
- `POST /api/v1/auth/refresh` - Refrescar token
- `POST /api/v1/auth/logout` - Cerrar sesión

### Máquinas
- `GET /api/v1/machines` - Listar máquinas
- `GET /api/v1/machines/:id` - Obtener máquina
- `POST /api/v1/machines` - Crear máquina
- `PUT /api/v1/machines/:id` - Actualizar máquina
- `DELETE /api/v1/machines/:id` - Eliminar máquina
- `PATCH /api/v1/machines/:id/status` - Cambiar estado
- `GET /api/v1/machines/:id/history` - Historial
- `GET /api/v1/machines/export` - Exportar CSV

### Mantenimientos
- `GET /api/v1/maintenances` - Listar mantenimientos
- `POST /api/v1/maintenances` - Crear mantenimiento
- `PUT /api/v1/maintenances/:id` - Actualizar mantenimiento
- `PATCH /api/v1/maintenances/:id/status` - Cambiar estado
- `GET /api/v1/maintenances/stats` - Estadísticas

### Programación
- `GET /api/v1/scheduling` - Listar programaciones
- `POST /api/v1/scheduling` - Crear programación
- `PUT /api/v1/scheduling/:id` - Actualizar programación
- `DELETE /api/v1/scheduling/:id` - Eliminar programación
- `PATCH /api/v1/scheduling/:id/toggle` - Activar/Desactivar
- `POST /api/v1/scheduling/:id/execute` - Ejecutar ahora

### Reportes
- `GET /api/v1/reports/maintenance` - Reporte de mantenimientos
- `GET /api/v1/reports/machine` - Reporte por máquina
- `GET /api/v1/reports/cost` - Reporte de costos
- `GET /api/v1/reports/dashboard` - Estadísticas del dashboard

## 🧪 Testing

```bash
# Backend
cd backend
npm run test              # Unit tests
npm run test:integration  # Integration tests
npm run test:coverage     # Coverage report

# Frontend
cd frontend
npm run test              # Unit tests
```

## 🚢 Despliegue

### Docker Production

```bash
# Build y ejecutar
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Ejecutar migraciones
docker-compose exec backend npm run db:migrate

# Sembrar datos iniciales
docker-compose exec backend npm run db:seed
```

### Manual

```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
# Servir dist/ con nginx o similar
```

## 📊 Funcionalidades por Sprint

| Sprint | Funcionalidades | Estado |
|--------|-----------------|--------|
| Sprint 1 | Auth, CRUD Máquinas/Usuarios, Dashboard básico | ✅ |
| Sprint 2 | Búsqueda, Filtros, Exportación, Catálogos | ✅ |
| Sprint 3 | CRUD Mantenimientos, Flujo de estados | ✅ |
| Sprint 4 | Alertas, Auditoría | ✅ |
| Sprint 5 | Reportes, Métricas Dashboard | ✅ |
| Sprint 6 | Programación preventiva | ✅ |
| Sprint 7 | Polish, Responsive, Seed data | ✅ |

## 🤝 Contribuir

1. Fork el proyecto
2. Crear branch (`git checkout -b feature/nueva-funcionalidad`)
3. Commit (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push (`git push origin feature/nueva-funcionalidad`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto es privado y confidencial.

## 📞 Soporte

Para soporte técnico, contactar a Gakuus en GitHub.
