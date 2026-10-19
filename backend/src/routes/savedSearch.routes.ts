import { Router } from 'express';
import { SavedSearchController } from '../controllers/savedSearch.controller';
import { requireAuth } from '../middlewares/auth.middleware';

export const savedSearchRouter = Router();

savedSearchRouter.post('/', requireAuth, SavedSearchController.createSavedSearch);
savedSearchRouter.get('/', requireAuth, SavedSearchController.getUserSavedSearches);
savedSearchRouter.get('/:id', requireAuth, SavedSearchController.getSavedSearchById);
savedSearchRouter.patch('/:id', requireAuth, SavedSearchController.updateSavedSearch);
savedSearchRouter.delete('/:id', requireAuth, SavedSearchController.deleteSavedSearch);
