import IORedis from 'ioredis';
import { env } from './env';
import { logger } from './logger';

export const redisConnection = new IORedis(env.REDIS_URL, {
  maxRetriesPerRequest: null, // Required by BullMQ
});

redisConnection.on('error', (err) => {
  logger.error({ err }, 'Redis connection error');
});

redisConnection.on('connect', () => {
  logger.info('Connected to Redis');
});
