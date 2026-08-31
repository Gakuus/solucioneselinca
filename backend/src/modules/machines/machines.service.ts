import { prisma } from '../../config/database';
import { NotFoundError, ConflictError, BadRequestError } from '../../shared/errors/AppError';
import type { CreateMachineInput, UpdateMachineInput, MachineQueryInput } from './machines.validation';
import ExcelJS from 'exceljs';

// State transition rules
const VALID_TRANSITIONS: Record<string, string[]> = {
  ACTIVE: ['INACTIVE', 'IN_MAINTENANCE', 'DECOMMISSIONED'],
  INACTIVE: ['ACTIVE'],
  IN_MAINTENANCE: ['ACTIVE', 'INACTIVE'],
  DECOMMISSIONED: [], // Final state
};

export class MachinesService {
  async findAll(query: MachineQueryInput) {
    const { page, limit, search, status, machineTypeId, sortBy, sortOrder, includeDeleted } = query;

    const where: any = {};

    if (!includeDeleted) {
      where.deletedAt = null;
    }

    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } },
        { serialNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (machineTypeId) {
      where.machineTypeId = machineTypeId;
    }

    const [machines, total] = await Promise.all([
      prisma.machine.findMany({
        where,
        include: {
          machineType: {
            select: { id: true, name: true },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.machine.count({ where }),
    ]);

    return {
      data: machines,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    const machine = await prisma.machine.findUnique({
      where: { id },
      include: {
        machineType: true,
        maintenances: {
          take: 5,
          orderBy: { receivedDate: 'desc' },
          include: {
            maintenanceType: true,
technician: {
            select: { id: true, name: true, email: true },
          },
          typeAssignments: {
            include: { maintenanceType: { select: { name: true, isPreventive: true } } },
            orderBy: { order: 'asc' },
          },
          technicianAssignments: {
            include: { technician: { select: { id: true, name: true } } },
            orderBy: { order: 'asc' },
          },
        },
        },
      },
    });

    if (!machine) {
      throw new NotFoundError('Máquina no encontrada');
    }

    return machine;
  }

  async create(data: CreateMachineInput) {
    // Check if code already exists
    const existingMachine = await prisma.machine.findUnique({
      where: { code: data.code },
    });

    if (existingMachine) {
      if (existingMachine.deletedAt) {
        throw new ConflictError(
          `Ya existe una máquina con el código: ${data.code} (desactivada). Puedes reactivarla desde el listado de inactivas.`
        );
      }
      throw new ConflictError(`Ya existe una máquina con el código: ${data.code}`);
    }

    // Verify machine type exists
    const machineType = await prisma.machineType.findUnique({
      where: { id: data.machineTypeId },
    });

    if (!machineType) {
      throw new NotFoundError('Tipo de máquina no encontrado');
    }

    const machine = await prisma.machine.create({
      data: {
        code: data.code,
        name: data.name,
        machineTypeId: data.machineTypeId,
        brand: data.brand || '',
        model: data.model || '',
        year: data.year,
        serialNumber: data.serialNumber,
        status: data.status || 'ACTIVE',
      },
      include: {
        machineType: true,
      },
    });

    return machine;
  }

  async update(id: string, data: UpdateMachineInput) {
    const existingMachine = await prisma.machine.findUnique({
      where: { id },
    });

    if (!existingMachine) {
      throw new NotFoundError('Máquina no encontrada');
    }

    // Check if code conflicts with another machine
    if (data.code && data.code !== existingMachine.code) {
      const codeExists = await prisma.machine.findUnique({
        where: { code: data.code },
      });

      if (codeExists) {
        throw new ConflictError(`Ya existe una máquina con el código: ${data.code}`);
      }
    }

    // Verify machine type exists if being updated
    if (data.machineTypeId) {
      const machineType = await prisma.machineType.findUnique({
        where: { id: data.machineTypeId },
      });

      if (!machineType) {
        throw new NotFoundError('Tipo de máquina no encontrado');
      }
    }

    const machine = await prisma.machine.update({
      where: { id },
      data: {
        ...(data.code && { code: data.code }),
        ...(data.name && { name: data.name }),
        ...(data.machineTypeId && { machineTypeId: data.machineTypeId }),
        ...(data.brand !== undefined && { brand: data.brand }),
        ...(data.model !== undefined && { model: data.model }),
        ...(data.year !== undefined && { year: data.year }),
        ...(data.serialNumber !== undefined && { serialNumber: data.serialNumber }),
      },
      include: {
        machineType: true,
      },
    });

    return machine;
  }

  async changeStatus(id: string, newStatus: string, reason?: string) {
    const machine = await prisma.machine.findUnique({
      where: { id },
    });

    if (!machine) {
      throw new NotFoundError('Máquina no encontrada');
    }

    // Validate state transition
    const allowedTransitions = VALID_TRANSITIONS[machine.status] || [];
    if (!allowedTransitions.includes(newStatus)) {
      throw new BadRequestError(
        `No se puede cambiar de ${machine.status} a ${newStatus}. Transiciones válidas: ${allowedTransitions.join(', ') || 'Ninguna'}`
      );
    }

    // DECOMMISSIONED requires a reason
    if (newStatus === 'DECOMMISSIONED' && !reason) {
      throw new BadRequestError('Se requiere un motivo para dar de baja la máquina');
    }

    const updatedMachine = await prisma.machine.update({
      where: { id },
      data: {
        status: newStatus as any,
        ...(newStatus === 'DECOMMISSIONED' && { notes: `Baja: ${reason}` }),
      },
      include: {
        machineType: true,
      },
    });

    return updatedMachine;
  }

  async getHistory(id: string) {
    const machine = await prisma.machine.findUnique({
      where: { id },
      include: {
        machineType: true,
      },
    });

    if (!machine) {
      throw new NotFoundError('Máquina no encontrada');
    }

    const [maintenances, alerts, schedules] = await Promise.all([
      prisma.maintenance.findMany({
        where: { machineId: id },
        orderBy: { receivedDate: 'desc' },
        include: {
          maintenanceType: true,
          technician: {
            select: { id: true, name: true },
          },
          items: true,
          typeAssignments: {
            include: { maintenanceType: { select: { name: true, isPreventive: true } } },
            orderBy: { order: 'asc' },
          },
          technicianAssignments: {
            include: { technician: { select: { id: true, name: true } } },
            orderBy: { order: 'asc' },
          },
        },
      }),
      prisma.alert.findMany({
        where: { machineId: id, deletedAt: null },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
      prisma.maintenanceSchedule.findMany({
        where: { machineId: id, isActive: true, deletedAt: null },
        orderBy: { nextExecution: 'asc' },
        include: {
          maintenanceType: { select: { name: true, isPreventive: true } },
        },
        take: 10,
      }),
    ]);

    // Totales y estadísticas de historial
    const totalCost = maintenances.reduce(
      (sum, m) => sum + m.items.reduce((itemSum, item) => itemSum + (item.unitCost || 0) * item.quantity, 0),
      0
    );
    const preventiveCount = maintenances.filter((m) => m.maintenanceType?.isPreventive).length;
    const correctiveCount = maintenances.length - preventiveCount;
    const avgCostPerMaintenance = maintenances.length ? totalCost / maintenances.length : 0;

    return {
      machine: {
        id: machine.id,
        code: machine.code,
        name: machine.name,
        machineTypeId: machine.machineTypeId,
        machineType: machine.machineType?.name,
        brand: machine.brand,
        model: machine.model,
        serialNumber: machine.serialNumber,
        year: machine.year,
        dailyHoursAverage: machine.dailyHoursAverage,
        status: machine.status,
        deletedAt: machine.deletedAt,
        createdAt: machine.createdAt,
      },
      stats: {
        totalMaintenances: maintenances.length,
        preventiveCount,
        correctiveCount,
        totalCost,
        avgCostPerMaintenance,
        completedCount: maintenances.filter((m) => m.status === 'COMPLETED').length,
        inProgressCount: maintenances.filter((m) => m.status === 'IN_PROGRESS').length,
        scheduledCount: maintenances.filter((m) => m.status === 'SCHEDULED').length,
        cancelledCount: maintenances.filter((m) => m.status === 'CANCELLED').length,
      },
      maintenances,
      alerts,
      schedules,
    };
  }

  async delete(id: string) {
    const existing = await prisma.machine.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('Máquina no encontrada');
    }
    await prisma.machine.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return { message: 'Máquina desactivada correctamente' };
  }

  async restore(id: string) {
    const existing = await prisma.machine.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('Máquina no encontrada');
    }
    await prisma.machine.update({
      where: { id },
      data: { deletedAt: null },
    });
    return { message: 'Máquina reactivada correctamente' };
  }

  async exportExcel(query: Omit<MachineQueryInput, 'page' | 'limit'>) {
    const { search, status, machineTypeId, sortBy, sortOrder } = query;

    const where: any = { deletedAt: null };

    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (machineTypeId) {
      where.machineTypeId = machineTypeId;
    }

    const machines = await prisma.machine.findMany({
      where,
      include: {
        machineType: {
          select: { name: true },
        },
      },
      orderBy: { [sortBy]: sortOrder },
    });

    const statusLabels: Record<string, string> = {
      ACTIVE: 'Activa',
      INACTIVE: 'Inactiva',
      IN_MAINTENANCE: 'Mantenimiento',
      DECOMMISSIONED: 'Retirada',
    };

    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Máquinas');
    ws.columns = [
      { width: 14 },
      { width: 28 },
      { width: 18 },
      { width: 18 },
      { width: 18 },
      { width: 8 },
      { width: 16 },
    ];

    ws.mergeCells(1, 1, 1, 7);
    const brand = ws.getCell(1, 1);
    brand.value = 'SOLUCIONES EL INCA';
    brand.font = { bold: true, size: 18, color: { argb: 'DC2626' } };

    ws.mergeCells(2, 1, 2, 7);
    const title = ws.getCell(2, 1);
    title.value = 'Listado de Máquinas';
    title.font = { bold: true, size: 14, color: { argb: '111827' } };

    ws.mergeCells(3, 1, 3, 7);
    const generated = ws.getCell(3, 1);
    generated.value = `Generado: ${new Date().toLocaleDateString('es-ES')}`;
    generated.font = { size: 9, color: { argb: '9CA3AF' } };

    ws.addRow([]);

    const headerRow = ws.addRow(['Código', 'Nombre', 'Tipo', 'Marca', 'Modelo', 'Año', 'Estado']);
    headerRow.eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FEF2F2' } };
      cell.font = { bold: true, color: { argb: '7F1D1D' }, size: 10 };
    });

    machines.forEach((m) => {
      const row = ws.addRow([
        m.code,
        m.name,
        m.machineType?.name || '',
        m.brand || '',
        m.model || '',
        m.year?.toString() || '',
        statusLabels[m.status] || m.status,
      ]);
      row.eachCell((cell) => {
        cell.font = { size: 10 };
        cell.border = { bottom: { style: 'thin', color: { argb: 'F3F4F6' } } };
      });
    });

    const buffer = Buffer.from((await wb.xlsx.writeBuffer()) as ArrayBuffer);
    return { buffer, filename: 'maquinas.xlsx' };
  }

  async getMachineTypes() {
    return prisma.machineType.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }
}

export const machinesService = new MachinesService();
