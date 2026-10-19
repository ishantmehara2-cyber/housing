import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import { requireAuth } from '../middlewares/auth.middleware';

export const dashboardRouter = Router();

dashboardRouter.get('/overview', requireAuth, DashboardController.getOverviewMetrics);
dashboardRouter.get('/properties', requireAuth, DashboardController.getManagedProperties);
dashboardRouter.patch('/properties/:id/status', requireAuth, DashboardController.updatePropertyListingStatus);
