import { Router } from 'express';
import { DraftController } from '../controllers/draft.controller';
import { requireAuth } from '../middlewares/auth.middleware';

export const draftRouter = Router();

draftRouter.post('/drafts', requireAuth, DraftController.createDraft);
draftRouter.get('/drafts', requireAuth, DraftController.getDrafts);
draftRouter.get('/drafts/:id', requireAuth, DraftController.getDraftById);
draftRouter.patch('/drafts/:id', requireAuth, DraftController.updateDraft);
draftRouter.delete('/drafts/:id', requireAuth, DraftController.deleteDraft);
draftRouter.post('/drafts/:id/submit', requireAuth, DraftController.submitDraft);
