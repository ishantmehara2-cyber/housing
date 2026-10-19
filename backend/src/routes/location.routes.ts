import { Router } from 'express';
import { LocationController } from '../controllers/location.controller';

export const locationRouter = Router();

locationRouter.get('/states', LocationController.getStates);
locationRouter.get('/cities', LocationController.getCities);
locationRouter.get('/cities/:slug/localities', LocationController.getLocalities);
locationRouter.get('/localities', LocationController.getLocalities);
locationRouter.get('/localities/:slug/sub-localities', LocationController.getSubLocalities);
locationRouter.get('/sub-localities', LocationController.getSubLocalities);
