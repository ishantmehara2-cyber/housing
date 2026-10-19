import { Router } from 'express';
import { AmenityController } from '../controllers/amenity.controller';

export const amenityRouter = Router();

amenityRouter.get('/amenities', AmenityController.getAmenities);
