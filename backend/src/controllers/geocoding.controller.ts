import { Request, Response, NextFunction } from 'express';
import { geocodingSearchSchema, reverseGeocodingSchema, ApiResponse } from '@housing-clone/shared';
import { GeocodingService } from '../services/geocoding/geocoding.service';
import { GeocodingResult } from '../services/geocoding/geocoding.types';

export class GeocodingController {
  public static async searchAddress(req: Request, res: Response<ApiResponse<GeocodingResult[]>>, next: NextFunction): Promise<void> {
    try {
      const { q } = geocodingSearchSchema.parse(req.query);
      const results = await GeocodingService.searchAddress(q);

      res.status(200).json({ success: true, data: results });
    } catch (err) {
      next(err);
    }
  }

  public static async reverseGeocode(req: Request, res: Response<ApiResponse<GeocodingResult>>, next: NextFunction): Promise<void> {
    try {
      const { lat, lng } = reverseGeocodingSchema.parse(req.query);
      const result = await GeocodingService.reverseGeocode(lat, lng);

      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
}
