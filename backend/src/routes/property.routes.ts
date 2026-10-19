import { Router } from 'express';
import { PropertyController } from '../controllers/property.controller';

export const propertyRouter = Router();

propertyRouter.get('/properties/:slug', PropertyController.getPropertyBySlug);
