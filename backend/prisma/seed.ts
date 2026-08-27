import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const machineTypes = [
    { name: 'Excavadora', description: 'Maquinaria para excavación' },
    { name: 'Grúa', description: 'Maquinaria para levantamiento' },
    { name: 'Bulldozer', description: 'Maquinaria para empuje de tierra' },
    { name: 'Cargador', description: 'Maquinaria para carga de materiales' },
    { name: 'Retroexcavadora', description: 'Maquinaria multifunción' },
    { name: 'Compactador', description: 'Maquinaria para compactación' },
    { name: 'Mixer', description: 'Mezcladora de concreto' },
    { name: 'Camión', description: 'Transporte de materiales' },
  ];

  for (const type of machineTypes) {
    await prisma.machineType.upsert({
      where: { name: type.name },
      update: {},
      create: type,
    });
  }
  console.log('✅ Machine types seeded');

  const maintenanceTypes = [
    { name: 'Cambio de Aceite', description: 'Cambio de aceite y filtro', isPreventive: true },
    { name: 'Revisión de Filtros', description: 'Inspección y cambio de filtros', isPreventive: true },
    { name: 'Mantenimiento de Orugas', description: 'Revisión y ajuste de orugas', isPreventive: true },
    { name: 'Cambio de Neumáticos', description: 'Reemplazo de neumáticos', isPreventive: true },
    { name: 'Revisión Hidráulica', description: 'Inspección del sistema hidráulico', isPreventive: true },
    { name: 'Revisión Eléctrica', description: 'Inspección del sistema eléctrico', isPreventive: true },
    { name: 'Reparación Motor', description: 'Reparación del motor', isPreventive: false },
    { name: 'Reparación Hidráulica', description: 'Reparación del sistema hidráulico', isPreventive: false },
    { name: 'Reparación Eléctrica', description: 'Reparación del sistema eléctrico', isPreventive: false },
    { name: 'Reparación de Orugas', description: 'Reparación del sistema de orugas', isPreventive: false },
  ];

  for (const type of maintenanceTypes) {
    await prisma.maintenanceType.upsert({
      where: { name: type.name },
      update: {},
      create: type,
    });
  }
  console.log('✅ Maintenance types seeded');

  const adminPassword = await bcrypt.hash('Admin123!', 12);
  await prisma.user.upsert({
    where: { email: 'admin@mantenimientoplus.com' },
    update: {},
    create: {
      name: 'Administrador',
      email: 'admin@mantenimientoplus.com',
      passwordHash: adminPassword,
      role: UserRole.ADMIN,
      isActive: true,
    },
  });
  console.log('✅ Admin user seeded');

  const supervisorPassword = await bcrypt.hash('Super123!', 12);
  await prisma.user.upsert({
    where: { email: 'supervisor@mantenimientoplus.com' },
    update: {},
    create: {
      name: 'Supervisor General',
      email: 'supervisor@mantenimientoplus.com',
      passwordHash: supervisorPassword,
      role: UserRole.SUPERVISOR,
      isActive: true,
    },
  });
  console.log('✅ Supervisor user seeded');

  const technicianPassword = await bcrypt.hash('Tech123!', 12);
  await prisma.user.upsert({
    where: { email: 'tecnico@mantenimientoplus.com' },
    update: {},
    create: {
      name: 'Técnico Principal',
      email: 'tecnico@mantenimientoplus.com',
      passwordHash: technicianPassword,
      role: UserRole.TECHNICIAN,
      isActive: true,
    },
  });
  console.log('✅ Technician user seeded');

  const systemConfigs = [
    { key: 'company_name', value: 'MantenimientoPlus', description: 'Nombre de la empresa' },
    { key: 'timezone', value: 'America/Mexico_City', description: 'Zona horaria del sistema' },
    { key: 'alert_days_preventive', value: 7, description: 'Días de anticipación para mantenimiento preventivo' },
    { key: 'alert_days_corrective', value: 3, description: 'Días de anticipación para mantenimiento correctivo' },
    { key: 'session_timeout_hours', value: 8, description: 'Tiempo de expiración de sesión en horas' },
    { key: 'password_min_length', value: 8, description: 'Longitud mínima de contraseña' },
    { key: 'password_require_uppercase', value: true, description: 'Requerir mayúsculas en contraseña' },
    { key: 'password_require_numbers', value: true, description: 'Requerir números en contraseña' },
  ];

  for (const config of systemConfigs) {
    await prisma.systemConfig.upsert({
      where: { key: config.key },
      update: { value: config.value },
      create: config,
    });
  }
  console.log('✅ System config seeded');

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
