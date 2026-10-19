import { Router } from 'express';
import { LeadController } from '../controllers/lead.controller';
import { requireAuth } from '../middlewares/auth.middleware';

export const leadRouter = Router();

leadRouter.get('/', requireAuth, LeadController.getUserLeads);
leadRouter.get('/:id', requireAuth, LeadController.getLeadById);
leadRouter.patch('/:id/status', requireAuth, LeadController.updateLeadStatus);
