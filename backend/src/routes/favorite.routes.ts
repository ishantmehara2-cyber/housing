import { Router } from 'express';
import { FavoriteController } from '../controllers/favorite.controller';
import { requireAuth } from '../middlewares/auth.middleware';

export const favoriteRouter = Router();

favoriteRouter.get('/', requireAuth, FavoriteController.getUserFavorites);
favoriteRouter.get('/:id', requireAuth, FavoriteController.checkFavoriteStatus);
favoriteRouter.post('/:id', requireAuth, FavoriteController.addFavorite);
favoriteRouter.delete('/:id', requireAuth, FavoriteController.removeFavorite);
