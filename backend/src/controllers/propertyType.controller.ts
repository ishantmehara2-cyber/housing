import { Request, Response, NextFunction } from 'express';
import { ApiResponse, PropertyTypeSummary } from '@housing-clone/shared';
import { PropertyTypeService } from '../services/propertyType.service';

export class PropertyTypeController {
  public static async getPropertyTypes(_req: Request, res: Response<ApiResponse<PropertyTypeSummary[]>>, next: NextFunction): Promise<void> {
    try {
      const propertyTypes = await PropertyTypeService.getPropertyTypes();
      res.status(200).json({ success: true, data: propertyTypes });
    } catch (err) {
      next(err);
    }
  }
}
