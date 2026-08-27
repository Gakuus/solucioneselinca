import { PrismaClient, MachineStatus, MaintenanceStatus, MaintenanceFrequency, AlertType, AlertSeverity, AuditAction } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Create Users
  const adminHash = await bcrypt.hash('Admin123!', 12);
  const superHash = await bcrypt.hash('Super123!', 12);
  const tecHash = await bcrypt.hash('Tecnico123!', 12);
  const viewerHash = await bcrypt.hash('Viewer123!', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@inca.com' },
    update: {},
    create: { name: 'Carlos Mendoza', email: 'admin@inca.com', passwordHash: adminHash, role: 'ADMIN' },
  });
  const supervisor = await prisma.user.upsert({
    where: { email: 'supervisor@inca.com' },
    update: {},
    create: { name: 'Ana Torres', email: 'supervisor@inca.com', passwordHash: superHash, role: 'SUPERVISOR' },
  });
  const tecnico = await prisma.user.upsert({
    where: { email: 'tecnico@inca.com' },
    update: {},
    create: { name: 'Luis García', email: 'tecnico@inca.com', passwordHash: tecHash, role: 'TECHNICIAN' },
  });
  await prisma.user.upsert({
    where: { email: 'viewer@inca.com' },
    update: {},
    create: { name: 'María López', email: 'viewer@inca.com', passwordHash: viewerHash, role: 'VIEWER' },
  });
  console.log('✅ Users created');

  // 2. Machine Types
  const mtExcavadora = await prisma.machineType.upsert({
    where: { name: 'Excavadora' }, update: {},
    create: { name: 'Excavadora', description: 'Maquinaria de excavación' },
  });
  const mtGrua = await prisma.machineType.upsert({
    where: { name: 'Grúa' }, update: {},
    create: { name: 'Grúa', description: 'Maquinaria de izaje' },
  });
  const mtBulldozer = await prisma.machineType.upsert({
    where: { name: 'Bulldozer' }, update: {},
    create: { name: 'Bulldozer', description: 'Maquinaria de nivelación' },
  });
  const mtCargador = await prisma.machineType.upsert({
    where: { name: 'Cargador' }, update: {},
    create: { name: 'Cargador', description: 'Maquinaria de carga' },
  });
  console.log('✅ Machine Types created');

  // 3. Maintenance Types
  const mtoCambioAceite = await prisma.maintenanceType.upsert({
    where: { name: 'Cambio de Aceite' }, update: {},
    create: { name: 'Cambio de Aceite', description: 'Cambio de aceite y filtro', isPreventive: true },
  });
  const mtoFrenos = await prisma.maintenanceType.upsert({
    where: { name: 'Revisión de Frenos' }, update: {},
    create: { name: 'Revisión de Frenos', description: 'Inspección y mantenimiento de frenos', isPreventive: true },
  });
  const mtoFiltros = await prisma.maintenanceType.upsert({
    where: { name: 'Cambio de Filtros' }, update: {},
    create: { name: 'Cambio de Filtros', description: 'Reemplazo de filtros de aire e hidráulico', isPreventive: true },
  });
  const mtoElectrica = await prisma.maintenanceType.upsert({
    where: { name: 'Revisión Eléctrica' }, update: {},
    create: { name: 'Revisión Eléctrica', description: 'Inspección del sistema eléctrico', isPreventive: true },
  });
  const mtoMotor = await prisma.maintenanceType.upsert({
    where: { name: 'Reparación Motor' }, update: {},
    create: { name: 'Reparación Motor', description: 'Reparación mayor del motor', isPreventive: false },
  });
  const mtoHidraulica = await prisma.maintenanceType.upsert({
    where: { name: 'Reparación Hidráulica' }, update: {},
    create: { name: 'Reparación Hidráulica', description: 'Reparación del sistema hidráulico', isPreventive: false },
  });
  console.log('✅ Maintenance Types created');

  // 4. Machines
  const exc1 = await prisma.machine.upsert({
    where: { code: 'EXC-001' }, update: {},
    create: { code: 'EXC-001', name: 'Excavadora CAT 320', machineTypeId: mtExcavadora.id, brand: 'Caterpillar', model: '320', serialNumber: 'CAT320-2020-001', year: 2020, dailyHoursAverage: 8, status: 'ACTIVE' as MachineStatus },
  });
  const gru1 = await prisma.machine.upsert({
    where: { code: 'GRU-001' }, update: {},
    create: { code: 'GRU-001', name: 'Grúa Liebherr LTM 1100', machineTypeId: mtGrua.id, brand: 'Liebherr', model: 'LTM 1100', serialNumber: 'LIE-2019-001', year: 2019, dailyHoursAverage: 6, status: 'ACTIVE' as MachineStatus },
  });
  const car1 = await prisma.machine.upsert({
    where: { code: 'CAR-001' }, update: {},
    create: { code: 'CAR-001', name: 'Cargador Komatsu WA320', machineTypeId: mtCargador.id, brand: 'Komatsu', model: 'WA320', serialNumber: 'KOM-2021-001', year: 2021, dailyHoursAverage: 7, status: 'IN_MAINTENANCE' as MachineStatus },
  });
  const exc2 = await prisma.machine.upsert({
    where: { code: 'EXC-002' }, update: {},
    create: { code: 'EXC-002', name: 'Excavadora John Deere 350G', machineTypeId: mtExcavadora.id, brand: 'John Deere', model: '350G', serialNumber: 'JD-2022-001', year: 2022, dailyHoursAverage: 8, status: 'ACTIVE' as MachineStatus },
  });
  const gru2 = await prisma.machine.upsert({
    where: { code: 'GRU-002' }, update: {},
    create: { code: 'GRU-002', name: 'Grúa Grove GMK5250', machineTypeId: mtGrua.id, brand: 'Grove', model: 'GMK5250', serialNumber: 'GRV-2018-001', year: 2018, dailyHoursAverage: 5, status: 'ACTIVE' as MachineStatus },
  });
  console.log('✅ Machines created');

  // 5. Maintenances
  await prisma.maintenance.create({ data: { machineId: exc1.id, maintenanceTypeId: mtoCambioAceite.id, technicianId: tecnico.id, receivedDate: new Date('2024-01-15'), maintenanceDate: new Date('2024-01-15'), currentHours: 4520, description: 'Cambio de aceite programado', status: 'COMPLETED', completedAt: new Date('2024-01-15'), hoursUntilNext: 250, nextMaintenanceDate: new Date('2024-04-15') } });
  await prisma.maintenance.create({ data: { machineId: exc1.id, maintenanceTypeId: mtoFrenos.id, technicianId: tecnico.id, receivedDate: new Date('2024-02-01'), currentHours: 4700, description: 'Revisión de frenos preventiva', status: 'SCHEDULED', estimatedNextDate: new Date('2024-02-01') } });
  await prisma.maintenance.create({ data: { machineId: gru1.id, maintenanceTypeId: mtoFiltros.id, technicianId: tecnico.id, receivedDate: new Date('2024-01-20'), currentHours: 3200, description: 'Cambio de filtros hidráulicos', status: 'IN_PROGRESS' } });
  await prisma.maintenance.create({ data: { machineId: car1.id, maintenanceTypeId: mtoMotor.id, technicianId: tecnico.id, receivedDate: new Date('2024-01-25'), currentHours: 5100, description: 'Reparación de motor - cilindros', status: 'SCHEDULED' } });
  await prisma.maintenance.create({ data: { machineId: exc2.id, maintenanceTypeId: mtoElectrica.id, technicianId: tecnico.id, receivedDate: new Date('2024-01-10'), maintenanceDate: new Date('2024-01-10'), currentHours: 2800, description: 'Revisión eléctrica anual', status: 'COMPLETED', completedAt: new Date('2024-01-10') } });
  console.log('✅ Maintenances created');

  // 6. Alerts
  await prisma.alert.create({ data: { machineId: exc1.id, type: 'UPCOMING' as AlertType, severity: 'MEDIUM' as AlertSeverity, message: 'Cambio de aceite programado en 5 días para EXC-001' } });
  await prisma.alert.create({ data: { machineId: car1.id, type: 'UPCOMING' as AlertType, severity: 'HIGH' as AlertSeverity, message: 'Reparación de motor urgente pendiente para CAR-001' } });
  await prisma.alert.create({ data: { machineId: gru2.id, type: 'CUSTOM' as AlertType, severity: 'LOW' as AlertSeverity, message: 'Revisión de frenos programada para GRU-002', isRead: true } });
  console.log('✅ Alerts created');

  // 7. Schedules
  await prisma.maintenanceSchedule.create({ data: { machineId: exc1.id, maintenanceTypeId: mtoCambioAceite.id, frequency: 'MONTHLY' as MaintenanceFrequency, interval: 1, startDate: new Date('2024-01-01'), nextExecution: new Date('2024-02-01'), isActive: true, description: 'Cambio mensual de aceite' } });
  await prisma.maintenanceSchedule.create({ data: { machineId: gru1.id, maintenanceTypeId: mtoFiltros.id, frequency: 'QUARTERLY' as MaintenanceFrequency, interval: 1, startDate: new Date('2024-01-01'), nextExecution: new Date('2024-04-01'), isActive: true, description: 'Cambio trimestral de filtros' } });
  await prisma.maintenanceSchedule.create({ data: { machineId: exc2.id, maintenanceTypeId: mtoElectrica.id, frequency: 'YEARLY' as MaintenanceFrequency, interval: 1, startDate: new Date('2024-01-01'), nextExecution: new Date('2025-01-01'), isActive: true, description: 'Revisión eléctrica anual' } });
  console.log('✅ Schedules created');

  // 8. Audit Logs
  await prisma.auditLog.create({ data: { userId: admin.id, action: 'CREATE' as AuditAction, entityType: 'Machine', entityId: exc1.id, newValues: { code: 'EXC-001', name: 'Excavadora CAT 320' } } });
  await prisma.auditLog.create({ data: { userId: supervisor.id, action: 'UPDATE' as AuditAction, entityType: 'Maintenance', entityId: 'maint-1', newValues: { status: 'COMPLETED' } } });
  await prisma.auditLog.create({ data: { userId: admin.id, action: 'CREATE' as AuditAction, entityType: 'User', entityId: tecnico.id, newValues: { name: 'Luis García', role: 'TECHNICIAN' } } });
  console.log('✅ Audit Logs created');

  console.log('🎉 Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
