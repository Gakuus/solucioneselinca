import cors from 'cors';
import { getConfig } from './env';

export function configureCors() {
  const config = getConfig();
  const allowed = config.CORS_ORIGIN.split(',').map((s) => s.trim()).filter(Boolean);
  
  return cors({
    origin: allowed,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
    exposedHeaders: ['X-Request-ID'],
    maxAge: 86400,
  });
}
