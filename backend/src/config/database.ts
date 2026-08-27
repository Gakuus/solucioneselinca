import { PrismaClient } from '@prisma/client';
import { getConfig } from './env';

let prisma: PrismaClient;

export function getPrisma(): PrismaClient {
  if (!prisma) {
    const config = getConfig();
    prisma = new PrismaClient({
      log: config.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
  }
  return prisma;
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
  if (prisma) {
    await prisma.$disconnect();
    console.log('Database disconnected');
  }
}
