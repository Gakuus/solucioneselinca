import { PrismaClient } from '@prisma/client';
import { getConfig } from './env';

let prismaClient: PrismaClient;

export function getPrisma(): PrismaClient {
  if (!prismaClient) {
    const config = getConfig();
    prismaClient = new PrismaClient({
      log: config.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
  }
  return prismaClient;
}

export async function connectDatabase(): Promise<void> {
  try {
    const client = getPrisma();
    await client.$connect();
    console.log('✅ Database connected');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

export async function disconnectDatabase(): Promise<void> {
  if (prismaClient) {
    await prismaClient.$disconnect();
    console.log('Database disconnected');
  }
}

// Lazy proxy so `import { prisma }` works without calling getPrisma()
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    return (getPrisma() as any)[prop];
  },
});
