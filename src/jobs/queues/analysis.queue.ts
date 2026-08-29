import { Queue } from 'bullmq';
import { redisConnection } from '../../config/redis.config';

export const analysisQueue = new Queue('AnalysisQueue', { 
  connection: redisConnection 
});
