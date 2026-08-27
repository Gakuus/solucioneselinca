import { PrismaClient, MachineStatus, MaintenanceStatus, MaintenanceFrequency, MaintenanceCategory, AlertType, AlertSeverity, AuditAction } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Create Users
  const users = [
    { email: 'admin@inca.com', password: await bcrypt.hash('Admin123!', 12), firstName: 'Carlos', lastName: 'Mendoza', role: 'ADMIN' as const },
    { email: 'supervisor@inca.com', password: await bcrypt.hash('Super123!', 12), firstName: 'Ana', lastName: 'Torres', role: 'SUPERVISOR' as const },
    { email: 'tecnico@inca.com', password: await bcrypt.hash('Tecnico123!', 12), firstName: 'Luis', lastName: 'García', role: 'TECHNICIAN' as const },
    { email: 'viewer@inca.com', password: await bcrypt.hash('Viewer123!', 12), firstName: 'Maria', lastName: 'López', role: 'VIEWER' as const },
  ];

  for (const userData of users) {
    await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: userData,
    });
  }
  console.log('✅ Users created');

  // 2. Create Machine Types
  const machineTypes = [
    { name: 'Excavadora', description: 'Maquinaria de excavación' },
    { name: 'Grúa', description: 'Maquinaria de izaje' },
    { name: 'Bulldozer', description: 'Maquinaria de nivelación' },
    { name: 'Cargador', description: 'Maquinaria de carga' },
    { name: 'Retroexcavadora', description: 'Maquinaria multifunción' },
  ];

  for (const machineType of machineTypes) {
    await prisma.machineType.upsert({
      where: { name: machineType.name },
      update: {},
      create: machineType,
    });
  }
  console.log('✅ Machine Types created');

  // 3. Create Maintenance Types
  const maintenanceTypes = [
    { name: 'Cambio de Aceite', description: 'Cambio de aceite y filtro', isPreventive: true },
    { name: 'Revisión de Frenos', description: 'Inspección y mantenimiento de frenos', isPreventive: true },
    { name: 'Cambio de Filtros', description: 'Reemplazo de filtros de aire e hidráulico', isPreventive: true },
    { name: 'Revisión Eléctrica', description: 'Inspección del sistema eléctrico', isPreventive: true },
    { name: 'Reparación Motor', description: 'Reparación mayor del motor', isPreventive: false },
    { name: 'Reparación Hidráulica', description: 'Reparación del sistema hidráulico', isPreventive: false },
  ];

  for (const maintenanceType of maintenanceTypes) {
    await prisma.maintenanceType.upsert({
      where: { name: maintenanceType.name },
      update: {},
      create: maintenanceType,
    });
  }
  console.log('✅ Maintenance Types created');

  // 4. Create Machines
  const machineTypeExcavadora = await prisma.machineType.findUnique({ where: { name: 'Excavadora' } });
  const machineTypeGrua = await prisma.machineType.findUnique({ where: { name: 'Grúa' } });
  const machineTypeCargador = await prisma.machineType.findUnique({ where: { name: 'Cargador' } });

  if (machineTypeExcavadora && machineTypeGrua && machineTypeCargador) {
    const machines = [
      { code: 'EXC-001', name: 'Excavadora CAT 320', machineTypeId: machineTypeExcavadora.id, brand: 'Caterpillar', model: '320', serialNumber: 'CAT320-2020-001', year: 2020, dailyHoursAverage: 8, status: 'ACTIVE' as MachineStatus },
      { code: 'GRU-001', name: 'Grúa Liebherr LTM 1100', machineTypeId: machineTypeGrua.id, brand: 'Liebherr', model: 'LTM 1100', serialNumber: 'LIE-2019-001', year: 2019, dailyHoursAverage: 6, status: 'ACTIVE' as MachineStatus },
      { code: 'CAR-001', name: 'Cargador Komatsu WA320', machineTypeId: machineTypeCargador.id, brand: 'Komatsu', model: 'WA320', serialNumber: 'KOM-2021-001', year: 2021, dailyHoursAverage: 7, status: 'IN_MAINTENANCE' as MachineStatus },
      { code: 'EXC-002', name: 'Excavadora John Deere 350G', machineTypeId: machineTypeExcavadora.id, brand: 'John Deere', model: '350G', serialNumber: 'JD-2022-001', year: 2022, dailyHoursAverage: 8, status: 'ACTIVE' as MachineStatus },
      { code: 'GRU-002', name: 'Grúa Grove GMK5250', machineTypeId: machineTypeGrua.id, brand: 'Grove', model: 'GMK5250', serialNumber: 'GRV-2018-001', year: 2018, dailyHoursAverage: 5, status: 'ACTIVE' as MachineStatus },
    ];

    for (const machine of machines) {
      await prisma.machine.upsert({
        where: { code: machine.code },
        update: {},
        create: machine,
      });
    }
    console.log('✅ Machines created');
  }

  // 5. Create Maintenance
  const machines = await prisma.machine.findMany();
  const maintenanceTypesAll = await prisma.maintenanceType.findMany();

  if (machines.length > 0 && maintenanceTypesAll.length > 0) {
    const maintenances = [
      { machineId: machines[0].id, maintenanceTypeId: maintenanceTypesAll[0].id, status: 'COMPLETED' as MaintenanceStatus, scheduledDate: new Date('2024-01-15'), completedDate: new Date('2024-01-15'), description: 'Cambio de aceite programado', totalCost: 250.00 },
      { machineId: machines[0].id, maintenanceTypeId: maintenanceTypesAll[1].id, status: 'SCHEDULED' as MaintenanceStatus, scheduledDate: new Date('2024-02-01'), description: 'Revisión de frenos preventiva', totalCost: 150.00 },
      { machineId: machines[1].id, maintenanceTypeId: maintenanceTypesAll[2].id, status: 'IN_PROGRESS' as MaintenanceStatus, scheduledDate: new Date('2024-01-20'), description: 'Cambio de filtros hidráulicos', totalCost: 180.00 },
      { machineId: machines[2].id, maintenanceTypeId: maintenanceTypesAll[4].id, status: 'SCHEDULED' as MaintenanceStatus, scheduledDate: new Date('2024-01-25'), description: 'Reparación de motor - cylinders', totalCost: 3500.00 },
      { machineId: machines[3].id, maintenanceTypeId: maintenanceTypesAll[3].id, status: 'COMPLETED' as MaintenanceStatus, scheduledDate: new Date('2024-01-10'), completedDate: new Date('2024-01-10'), description: 'Revisión eléctrica anual', totalCost: 300.00 },
    ];

    for (const maintenance of maintenances) {
      await prisma.maintenance.create({ data: maintenance });
    }
    console.log('✅ Maintenances created');
  }

  // 6. Create Alerts
  if (machines.length > 0) {
    const alerts = [
      { machineId: machines[0].id, type: 'UPCOMING' as AlertType, severity: 'MEDIUM' as AlertSeverity, title: 'Mantenimiento programado en 5 días', message: 'Se requiere cambio de aceite para EXC-001', isRead: false },
      { machineId: machines[2].id, type: 'UPCOMING' as AlertType, severity: 'HIGH' as AlertSeverity, title: 'Mantenimiento urgente pendiente', message: 'Reparación de motor programada para CAR-001', isRead: false },
      { machineId: machines[4].id, type: 'CUSTOM' as AlertType, severity: 'LOW' as AlertSeverity, title: 'Revisión programada', message: 'Revisión de frenos programada para GRU-002', isRead: true },
    ];

    for (const alert of alerts) {
      await prisma.alert.create({ data: alert });
    }
    console.log('✅ Alerts created');
  }

  // 7. Create Schedules
  if (machines.length > 0 && maintenanceTypesAll.length > 0) {
    const schedules = [
      { machineId: machines[0].id, maintenanceTypeId: maintenanceTypesAll[0].id, frequency: 'MONTHLY' as MaintenanceFrequency, interval: 1, startDate: new Date('2024-01-01'), nextExecution: new Date('2024-02-01'), isActive: true, description: 'Cambio mensual de aceite' },
      { machineId: machines[1].id, maintenanceTypeId: maintenanceTypesAll[2].id, frequency: 'QUARTERLY' as MaintenanceFrequency, interval: 1, startDate: new Date('2024-01-01'), nextExecution: new Date('2024-04-01'), isActive: true, description: 'Cambio trimestral de filtros' },
      { machineId: machines[3].id, maintenanceTypeId: maintenanceTypesAll[3].id, frequency: 'YEARLY' as MaintenanceFrequency, interval: 1, startDate: new Date('2024-01-01'), nextExecution: new Date('2025-01-01'), isActive: true, description: 'Revisión eléctrica anual' },
    ];

    for (const schedule of schedules) {
      await prisma.maintenanceSchedule.create({ data: schedule });
    }
    console.log('✅ Schedules created');
  }

  // 8. Create Audit Logs
  const usersAll = await prisma.user.findMany();
  if (usersAll.length > 0) {
    const auditLogs = [
      { userId: usersAll[0].id, action: 'CREATE' as AuditAction, entityType: 'Machine', entityId: machines[0].id, details: 'Creó máquina Excavadora CAT 320' },
      { userId: usersAll[1].id, action: 'UPDATE' as AuditAction, entityType: 'Maintenance', entityId: 'maint-1', details: 'Actualizó estado de mantenimiento a COMPLETED' },
      { userId: usersAll[0].id, action: 'CREATE' as AuditAction, entityType: 'User', entityId: usersAll[2].id, details: 'Creó usuario Luis García' },
    ];

    for (const auditLog of auditLogs) {
      await prisma.auditLog.create({ data: auditLog });
    }
    console.log('✅ Audit Logs created');
  }

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
