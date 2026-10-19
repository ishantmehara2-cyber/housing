import { Router } from 'express';
import { GeocodingController } from '../controllers/geocoding.controller';

export const geocodingRouter = Router();

geocodingRouter.get('/search', GeocodingController.searchAddress);
geocodingRouter.get('/reverse', GeocodingController.reverseGeocode);
