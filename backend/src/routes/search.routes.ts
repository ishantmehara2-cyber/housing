import { Router } from 'express';
import { SearchController } from '../controllers/search.controller';

export const searchRouter = Router();

searchRouter.get('/properties', SearchController.searchProperties);
