import { Request, Response, NextFunction } from 'express';
import { ApiResponse, PropertyDetail, slugParamSchema } from '@housing-clone/shared';
import { PropertyService } from '../services/property.service';

export class PropertyController {
  public static async getPropertyBySlug(req: Request, res: Response<ApiResponse<PropertyDetail>>, next: NextFunction): Promise<void> {
    try {
      const { slug } = slugParamSchema.parse(req.params);
      const property = await PropertyService.getPropertyBySlug(slug);
      res.status(200).json({ success: true, data: property });
    } catch (err) {
      next(err);
    }
  }
}
