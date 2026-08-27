import { Router, Request, Response } from 'express';
import { getPrisma } from '../../config/database';
import { getRedis } from '../../config/redis';

const router = Router();

router.get('/health', async (req: Request, res: Response) => {
  const healthCheck = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      database: 'ok',
      redis: 'ok',
    },
  };

  try {
    const prisma = getPrisma();
    await prisma.$queryRaw`SELECT 1`;
  } catch (error) {
    healthCheck.services.database = 'error';
    healthCheck.status = 'degraded';
  }

  try {
    const redis = getRedis();
    await redis.ping();
  } catch (error) {
    healthCheck.services.redis = 'error';
    healthCheck.status = 'degraded';
  }

  const statusCode = healthCheck.status === 'ok' ? 200 : 503;
  res.status(statusCode).json(healthCheck);
});

router.get('/ping', (req: Request, res: Response) => {
  res.json({ message: 'pong', timestamp: new Date().toISOString() });
});

export { router as healthRouter };
