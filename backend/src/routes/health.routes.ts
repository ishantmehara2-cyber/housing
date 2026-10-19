import { Router, Request, Response } from 'express';
import { HealthCheckResponse } from '@housing-clone/shared';
import { env } from '../config/env';
import { db } from '../config/db';

export const healthRouter = Router();

healthRouter.get('/', (_req: Request, res: Response<HealthCheckResponse>) => {
  res.status(200).json({
    success: true,
    service: 'housing-clone-api',
    status: 'ok',
    environment: env.NODE_ENV,
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

healthRouter.get('/ready', async (_req: Request, res: Response) => {
  try {
    await db.$queryRaw`SELECT 1`;
    res.status(200).json({
      status: 'ready',
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch {
    res.status(503).json({
      status: 'unhealthy',
      database: 'disconnected',
      timestamp: new Date().toISOString(),
    });
  }
});
