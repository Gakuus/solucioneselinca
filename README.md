# MantenimientoPlus

Plataforma web responsive para la gestión de mantenimiento preventivo y correctivo de maquinaria de construcción.

## Stack

- **Frontend:** React 18 + TypeScript + Tailwind CSS + shadcn/ui
- **Backend:** Node.js + Express + Prisma ORM
- **Database:** PostgreSQL 15
- **Cache:** Redis 7
- **Auth:** JWT (access 15min + refresh 7d)
- **Container:** Docker + Docker Compose
- **CI/CD:** GitHub Actions

## Inicio Rápido

```bash
# Clonar repositorio
git clone git@github.com:Gakuus/solucioneselinca.git
cd solucioneselinca

# Copiar variables de entorno
cp .env.example .env

# Levantar servicios
docker compose up -d

# Instalar dependencias backend
cd backend && npm install

# Instalar dependencias frontend
cd ../frontend && npm install

# Ejecutar migraciones
cd ../backend && npx prisma migrate dev

# Cargar datos iniciales
npx prisma db seed

# Iniciar en desarrollo
# Terminal 1: cd backend && npm run dev
# Terminal 2: cd frontend && npm run dev
```

## Estructura del Proyecto

```
solucioneselinca/
├── backend/          # API Node.js + Express
├── frontend/         # React + TypeScript
├── docs/             # Documentación empresarial (14 fases)
├── nginx/            # Configuración Nginx
├── docker-compose.yml
└── .env.example
```

## Equipo

- Tech Lead
- Backend Developers (2)
- Frontend Developer (1)
- DevOps Engineer (1)
- QA Engineer (1)

## Licencia

Propietario - Gakuus
