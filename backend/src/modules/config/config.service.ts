import { prisma } from '../../config/database';
import { NotFoundError } from '../../shared/errors/AppError';

export interface SystemConfig {
  key: string;
  value: any;
  description: string | null;
}

const DEFAULT_CONFIG: Record<string, { value: any; description: string }> = {
  alert_days_before: {
    value: 7,
    description: 'Días de anticipación para alertas de mantenimiento próximo',
  },
  company_name: {
    value: 'SOLUCIONES EL INCA',
    description: 'Nombre de la empresa',
  },
  session_timeout_minutes: {
    value: 30,
    description: 'Tiempo de inactividad (minutos) antes de cerrar la sesión',
  },
};

export class ConfigService {
  isKnownKey(key: string): boolean {
    return Object.prototype.hasOwnProperty.call(DEFAULT_CONFIG, key);
  }

  private getDefaults(): SystemConfig[] {
    return Object.entries(DEFAULT_CONFIG).map(([key, def]) => ({
      key,
      value: def.value,
      description: def.description,
    }));
  }

  async getAll(): Promise<SystemConfig[]> {
    const stored = await prisma.systemConfig.findMany({
      orderBy: { key: 'asc' },
    });

    const storedMap = new Map(stored.map((s) => [s.key, s]));

    // Merge defaults with stored values so missing keys still show up
    return this.getDefaults().map((def) => {
      const record = storedMap.get(def.key);
      return {
        key: def.key,
        value: record ? record.value : def.value,
        description: record?.description ?? def.description,
      };
    });
  }

  async getByKey(key: string): Promise<SystemConfig> {
    const record = await prisma.systemConfig.findUnique({ where: { key } });

    // Allow reading any stored key; fall back to defaults for known keys
    if (record) {
      return {
        key: record.key,
        value: record.value,
        description: record.description,
      };
    }

    const def = DEFAULT_CONFIG[key];
    if (def) {
      return {
        key,
        value: def.value,
        description: def.description,
      };
    }

    throw new NotFoundError(`Configuración "${key}" no encontrada`);
  }

  async update(key: string, value: unknown): Promise<SystemConfig> {
    const record = await prisma.systemConfig.findUnique({ where: { key } });

    if (record) {
      const updated = await prisma.systemConfig.update({
        where: { key },
        data: { value: value as any },
      });
      return {
        key: updated.key,
        value: updated.value,
        description: updated.description,
      };
    }

    // Create if it's a known default key (prevents arbitrary key creation)
    const def = DEFAULT_CONFIG[key];
    const description = def?.description ?? null;

    const created = await prisma.systemConfig.create({
      data: {
        key,
        value: value as any,
        description,
      },
    });

    return {
      key: created.key,
      value: created.value,
      description: created.description,
    };
  }

  /**
   * Utility for other services to read a config value with a fallback.
   * Returns the parsed value or the provided default if not set.
   */
  async getValue<T>(key: string, fallback: T): Promise<T> {
    try {
      const record = await prisma.systemConfig.findUnique({ where: { key } });
      if (record) {
        return record.value as T;
      }
      const def = DEFAULT_CONFIG[key];
      if (def) {
        return def.value as T;
      }
      return fallback;
    } catch {
      return fallback;
    }
  }
}

export const configService = new ConfigService();
