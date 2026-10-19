import express, { Express } from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import { logger } from './utils/logger';
import { requestIdMiddleware } from './middlewares/requestId';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';
import { apiV1Router } from './routes';
import { seoRouter } from './routes/seo.routes';

export function createApp(): Express {
  const app = express();

  // Security Headers
  app.use(helmet());

  // Request ID
  app.use(requestIdMiddleware);

  // CORS
  app.use(
    cors({
      origin: env.FRONTEND_URL,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    })
  );

  // Rate Limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // Limit each IP to 500 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      error: {
        code: 'TOO_MANY_REQUESTS',
        message: 'Too many requests, please try again later.',
      },
    },
  });
  app.use(limiter);

  // Static Uploads Serving
  app.use('/uploads', express.static(path.join(process.cwd(), 'public/uploads')));

  // Body Parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());

  // Request Logger
  app.use((req, _res, next) => {
    logger.info({ method: req.method, url: req.url, ip: req.ip }, `Incoming Request ${req.method} ${req.url}`);
    next();
  });

  // SEO & Sitemap Routes at Root Level
  app.use('/', seoRouter);

  // API v1 Routes
  app.use('/api/v1', apiV1Router);

  // 404 & Error Handlers
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

export const app = createApp();

if (process.env.NODE_ENV !== 'test') {
  app.listen(env.PORT, () => {
    logger.info(`🚀 Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
    logger.info(`🔗 Health endpoint: http://localhost:${env.PORT}/api/v1/health`);
  });
}
