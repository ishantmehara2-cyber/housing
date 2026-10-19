import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';
import { optionalAuth } from '../middlewares/auth.middleware';

export const analyticsRouter = Router();

analyticsRouter.post('/events', optionalAuth, AnalyticsController.recordEvent);
