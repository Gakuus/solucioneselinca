import Redis from 'ioredis';
import { getConfig } from './env';

let redisInstance: Redis;

export function getRedis(): Redis {
  if (!redisInstance) {
    const config = getConfig();
    redisInstance = new Redis(config.REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    redisInstance.on('connect', () => {
      console.log('✅ Redis connected');
    });

    redisInstance.on('error', (error) => {
      console.error('❌ Redis error:', error);
    });
  }
  return redisInstance;
}

export async function disconnectRedis(): Promise<void> {
  if (redisInstance) {
    await redisInstance.quit();
    console.log('Redis disconnected');
  }
}
