import { prisma } from '../../config/database';
import { NotFoundError, ConflictError, BadRequestError } from '../../shared/errors/AppError';
import type {
  CreateSparePartInput,
  UpdateSparePartInput,
  SparePartQueryInput,
  AddMovementInput,
} from './spareparts.validation';

const MOVEMENT_INCLUDE = {
  movements: {
    include: {
      user: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: 'desc' as const },
  },
};

export class SparePartsService {
  async findAll(query: SparePartQueryInput) {
    const { page, limit, search, category, machineTypeId, lowStock, includeDeleted, sortBy, sortOrder } = query;

    const where: any = {};

    if (!includeDeleted) {
      where.deletedAt = null;
    }

    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' as const } },
        { name: { contains: search, mode: 'insensitive' as const } },
        { supplier: { contains: search, mode: 'insensitive' as const } },
        { location: { contains: search, mode: 'insensitive' as const } },
      ];
    }

    if (category) {
      where.category = category;
    }

    if (machineTypeId) {
      where.machineTypeId = machineTypeId;
    }

    // Prisma no permite comparar columnas directamente; al activar lowStock
    // traemos los repuestos que tienen mínimo definido y filtramos en memoria.
    if (lowStock) {
      where.minStock = { gt: 0 };
    }

    const [data, total] = await Promise.all([
      prisma.sparePart.findMany({
        where,
        include: {
          machineType: { select: { id: true, name: true } },
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.sparePart.count({ where }),
    ]);

    const filtered = lowStock ? data.filter((p) => p.quantity <= p.minStock) : data;

    return {
      data: filtered,
      pagination: {
        page,
        limit,
        total: lowStock ? filtered.length : total,
        totalPages: lowStock ? Math.ceil(filtered.length / limit) : Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    const sparePart = await prisma.sparePart.findUnique({
      where: { id },
      include: {
        machineType: { select: { id: true, name: true } },
        ...MOVEMENT_INCLUDE,
      },
    });

    if (!sparePart || sparePart.deletedAt) {
      throw new NotFoundError('Repuesto no encontrado');
    }

    return sparePart;
  }

  async create(data: CreateSparePartInput) {
    const existing = await prisma.sparePart.findFirst({
      where: { code: data.code, deletedAt: null },
    });

    if (existing) {
      throw new ConflictError(`Ya existe un repuesto con el código: ${data.code}`);
    }

    if (data.machineTypeId) {
      const type = await prisma.machineType.findUnique({ where: { id: data.machineTypeId } });
      if (!type) {
        throw new BadRequestError('Tipo de máquina no encontrado');
      }
    }

    return prisma.sparePart.create({
      data,
      include: { machineType: { select: { id: true, name: true } } },
    });
  }

  async update(id: string, data: UpdateSparePartInput) {
    await this.findById(id);

    if (data.code) {
      const conflict = await prisma.sparePart.findFirst({
        where: { code: data.code, deletedAt: null, id: { not: id } },
      });
      if (conflict) {
        throw new ConflictError(`Ya existe un repuesto con el código: ${data.code}`);
      }
    }

    if (data.machineTypeId) {
      const type = await prisma.machineType.findUnique({ where: { id: data.machineTypeId } });
      if (!type) {
        throw new BadRequestError('Tipo de máquina no encontrado');
      }
    }

    return prisma.sparePart.update({
      where: { id },
      data,
      include: { machineType: { select: { id: true, name: true } } },
    });
  }

  async addMovement(id: string, data: AddMovementInput, userId?: string) {
    const sparePart = await this.findById(id);

    let newQuantity = sparePart.quantity;

    if (data.type === 'IN' || data.type === 'ADJUST') {
      if (data.type === 'ADJUST') {
        newQuantity = data.quantity;
      } else {
        newQuantity = sparePart.quantity + data.quantity;
      }
    } else if (data.type === 'OUT') {
      if (sparePart.quantity - data.quantity < 0) {
        throw new BadRequestError(
          `Stock insuficiente. Disponible: ${sparePart.quantity} ${sparePart.unit}`
        );
      }
      newQuantity = sparePart.quantity - data.quantity;
    }

    return prisma.$transaction(async (tx) => {
      const movement = await tx.sparePartMovement.create({
        data: {
          sparePartId: id,
          type: data.type,
          quantity: data.quantity,
          unitCost: data.unitCost,
          notes: data.notes,
          userId,
        },
        include: { user: { select: { id: true, name: true } } },
      });

      await tx.sparePart.update({
        where: { id },
        data: { quantity: newQuantity, unitCost: data.unitCost ?? sparePart.unitCost },
      });

      return movement;
    });
  }

  async delete(id: string) {
    const sparePart = await this.findById(id);
    return prisma.sparePart.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  }

  async restore(id: string) {
    const sparePart = await prisma.sparePart.findUnique({ where: { id } });
    if (!sparePart) {
      throw new NotFoundError('Repuesto no encontrado');
    }
    return prisma.sparePart.update({
      where: { id },
      data: { deletedAt: null, isActive: true },
    });
  }
}

export const sparePartsService = new SparePartsService();
