import { Request, Response, NextFunction } from 'express';
import { ApiResponse, AmenitySummary } from '@housing-clone/shared';
import { AmenityService } from '../services/amenity.service';

export class AmenityController {
  public static async getAmenities(_req: Request, res: Response<ApiResponse<AmenitySummary[]>>, next: NextFunction): Promise<void> {
    try {
      const amenities = await AmenityService.getAmenities();
      res.status(200).json({ success: true, data: amenities });
    } catch (err) {
      next(err);
    }
  }
}
