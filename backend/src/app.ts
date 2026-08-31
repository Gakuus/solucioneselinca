import express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { loadConfig } from './config/env';
import { configureCors } from './config/cors';
import { connectDatabase } from './config/database';
import { getRedis } from './config/redis';
import { logger } from './shared/utils/logger';
import { errorHandler } from './shared/middleware/errorHandler';
import { requestLogger } from './shared/middleware/requestLogger';
import { rateLimiter } from './shared/middleware/rateLimiter';
import { requestId } from './shared/middleware/requestId';
import { healthRouter } from './shared/routes/health';
import authRouter from './modules/auth/auth.routes';
import machinesRouter from './modules/machines/machines.routes';
import usersRouter from './modules/users/users.routes';
import dashboardRouter from './modules/dashboard/dashboard.routes';
import catalogsRouter from './modules/catalogs/catalogs.routes';
import maintenancesRouter from './modules/maintenances/maintenances.routes';
import alertsRouter from './modules/alerts/alerts.routes';
import auditRouter from './modules/audit/audit.routes';
import reportsRouter from './modules/reports/reports.routes';
import schedulingRouter from './modules/scheduling/scheduling.routes';
import configRouter from './modules/config/config.routes';
import sparePartsRouter from './modules/spareparts/spareparts.routes';

async function bootstrap() {
  const config = loadConfig();
  
  const app = express();

  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginEmbedderPolicy: false,
  }));
  app.use(configureCors());
  app.use(cookieParser());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(requestId);
  app.use(requestLogger);
  app.use(rateLimiter);

  // Health check
  app.use('/api/v1', healthRouter);

  // Auth routes
  app.use('/api/v1/auth', authRouter);

  // Machines routes
  app.use('/api/v1/machines', machinesRouter);

  // Users routes
  app.use('/api/v1/users', usersRouter);

  // Dashboard routes
  app.use('/api/v1/dashboard', dashboardRouter);

  // Catalogs routes
  app.use('/api/v1/catalogs', catalogsRouter);

  // Maintenances routes
  app.use('/api/v1/maintenances', maintenancesRouter);

  // Alerts routes
  app.use('/api/v1/alerts', alertsRouter);

  // Audit routes
  app.use('/api/v1/audit', auditRouter);

  // Reports routes
  app.use('/api/v1/reports', reportsRouter);

  // Scheduling routes
  app.use('/api/v1/scheduling', schedulingRouter);

  // Config routes
  app.use('/api/v1/config', configRouter);

  // Spare parts routes
  app.use('/api/v1/spare-parts', sparePartsRouter);

  app.use(errorHandler);

  await connectDatabase();
  getRedis();

  const port = parseInt(config.PORT, 10);
  const host = process.env.HOST || '0.0.0.0';
  app.listen(port, host, () => {
    logger.info(`🚀 Server running on port ${port}`);
    logger.info(`📚 Environment: ${config.NODE_ENV}`);
  });

  process.on('SIGTERM', async () => {
    logger.info('SIGTERM received, shutting down gracefully...');
    const { disconnectDatabase } = await import('./config/database');
    const { disconnectRedis } = await import('./config/redis');
    await disconnectDatabase();
    await disconnectRedis();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    logger.info('SIGINT received, shutting down gracefully...');
    const { disconnectDatabase } = await import('./config/database');
    const { disconnectRedis } = await import('./config/redis');
    await disconnectDatabase();
    await disconnectRedis();
    process.exit(0);
  });

  return app;
}

bootstrap().catch((error) => {
  logger.error('Failed to start server:', error);
  process.exit(1);
});

export { bootstrap };
