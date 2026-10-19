import { Router } from 'express';
import { VisitController } from '../controllers/visit.controller';
import { requireAuth } from '../middlewares/auth.middleware';

export const visitRouter = Router();

visitRouter.post('/', requireAuth, VisitController.createVisit);
visitRouter.get('/', requireAuth, VisitController.getUserVisits);
visitRouter.get('/:id', requireAuth, VisitController.getVisitById);
visitRouter.patch('/:id/status', requireAuth, VisitController.updateVisitStatus);
