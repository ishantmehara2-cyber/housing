import { Router } from 'express';
import { PropertyTypeController } from '../controllers/propertyType.controller';

export const propertyTypeRouter = Router();

propertyTypeRouter.get('/property-types', PropertyTypeController.getPropertyTypes);
