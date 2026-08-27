import Redis from 'ioredis';
import { getConfig } from './env';

let redis: Redis;

export function getRedis(): Redis {
  if (!redis) {
    const config = getConfig();
    redis = new Redis(config.REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    redis.on('connect', () => {
      console.log('✅ Redis connected');
    });

    redis.on('error', (error) => {
      console.error('❌ Redis error:', error);
    });
  }
  return redis;
}

export async function disconnectRedis(): Promise<void> {
  if (redis) {
    await redis.quit();
    console.log('Redis disconnected');
  }
}
