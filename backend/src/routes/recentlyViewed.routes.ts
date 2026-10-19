import { Router } from 'express';
import { RecentlyViewedController } from '../controllers/recentlyViewed.controller';
import { requireAuth } from '../middlewares/auth.middleware';

export const recentlyViewedRouter = Router();

recentlyViewedRouter.get('/', requireAuth, RecentlyViewedController.getUserHistory);
recentlyViewedRouter.post('/:id', requireAuth, RecentlyViewedController.recordView);
recentlyViewedRouter.delete('/:id', requireAuth, RecentlyViewedController.deleteItem);
recentlyViewedRouter.delete('/', requireAuth, RecentlyViewedController.clearHistory);
