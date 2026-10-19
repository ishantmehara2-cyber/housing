import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { logger } from '../utils/logger';
import { requestIdStore } from './requestId';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code: string = 'INTERNAL_ERROR',
    public details?: unknown
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export function notFoundHandler(req: Request, res: Response): void {
  const requestId = requestIdStore.getStore();
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Cannot ${req.method} ${req.path}`,
    },
    requestId,
    timestamp: new Date().toISOString(),
  });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  const requestId = requestIdStore.getStore();

  if (err instanceof AppError) {
    logger.warn({ err, requestId }, `AppError [${err.code}]: ${err.message}`);
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
      requestId,
      timestamp: new Date().toISOString(),
    });
    return;
  }

  if (err instanceof ZodError) {
    logger.warn({ err, requestId }, 'Validation Error');
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data',
        details: err.errors,
      },
      requestId,
      timestamp: new Date().toISOString(),
    });
    return;
  }

  if (
    err instanceof Prisma.PrismaClientInitializationError ||
    (err instanceof Prisma.PrismaClientKnownRequestError && ['P1000', 'P1001', 'P1002', 'P1008', 'P1017'].includes(err.code))
  ) {
    logger.error({ err, stack: err.stack, requestId }, 'Database Connection Error');
    res.status(503).json({
      success: false,
      error: {
        code: 'DATABASE_ERROR',
        message: 'Database service is currently unavailable. Please try again shortly.',
      },
      requestId,
      timestamp: new Date().toISOString(),
    });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const targetStr = JSON.stringify(err.meta?.target || '').toLowerCase();
      const isEmail = targetStr.includes('email');
      const isPhone = targetStr.includes('phone');
      const code = isEmail ? 'EMAIL_EXISTS' : isPhone ? 'PHONE_EXISTS' : 'DUPLICATE_ENTRY';
      const message = isEmail
        ? 'An account with this email already exists'
        : isPhone
        ? 'An account with this phone number already exists'
        : 'Duplicate record already exists';

      res.status(409).json({
        success: false,
        error: {
          code,
          message,
        },
        requestId,
        timestamp: new Date().toISOString(),
      });
      return;
    }
  }

  logger.error(
    { err, name: err.name, message: err.message, stack: err.stack, requestId },
    `Unhandled Server Error [${err.name}]: ${err.message}`
  );

  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected internal error occurred',
    },
    requestId,
    timestamp: new Date().toISOString(),
  });
}
