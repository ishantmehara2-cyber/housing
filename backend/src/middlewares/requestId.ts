import { Request, Response, NextFunction } from 'express';
import { AsyncLocalStorage } from 'async_hooks';

export const requestIdStore = new AsyncLocalStorage<string>();

export function requestIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const existingId = req.header('X-Request-ID');
  const requestId = existingId || `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  req.headers['x-request-id'] = requestId;
  res.setHeader('X-Request-ID', requestId);

  requestIdStore.run(requestId, () => {
    next();
  });
}
