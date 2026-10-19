import { Router } from 'express';
import { RecommendationController } from '../controllers/recommendation.controller';
import { requireAuth, optionalAuth } from '../middlewares/auth.middleware';

export const recommendationRouter = Router();

recommendationRouter.get('/', optionalAuth, RecommendationController.getPersonalizedFeed);
recommendationRouter.get('/properties/:id/similar', RecommendationController.getSimilarProperties);
recommendationRouter.get('/preferences', requireAuth, RecommendationController.getUserPreferences);
recommendationRouter.patch('/preferences', requireAuth, RecommendationController.updateUserPreferences);
recommendationRouter.post('/feedback', requireAuth, RecommendationController.recordFeedback);
