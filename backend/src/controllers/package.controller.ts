import { Request, Response, NextFunction } from 'express';
import { ApiResponse, idParamSchema } from '@housing-clone/shared';
import { PackageService } from '../services/package.service';
import { AppError } from '../middlewares/errorHandler';

export class PackageController {
  public static async getActivePackages(_req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const packages = await PackageService.getActivePackages();
      res.status(200).json({ success: true, data: packages });
    } catch (err) {
      next(err);
    }
  }

  public static async getAllPackagesForAdmin(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');

      const packages = await PackageService.getAllPackagesForAdmin();
      res.status(200).json({ success: true, data: packages });
    } catch (err) {
      next(err);
    }
  }

  public static async createPackage(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');

      const { name, targetRole, price, validityDays, maxListings, featuredListingsCount } = req.body;
      if (!name || price === undefined || !validityDays || !maxListings) {
        throw new AppError(400, 'Missing required package fields', 'VALIDATION_ERROR');
      }

      const created = await PackageService.createPackage({
        name,
        targetRole,
        price: Number(price),
        validityDays: Number(validityDays),
        maxListings: Number(maxListings),
        featuredListingsCount: Number(featuredListingsCount || 0),
      });

      res.status(201).json({ success: true, data: created });
    } catch (err) {
      next(err);
    }
  }

  public static async updatePackageStatus(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');

      const { id } = idParamSchema.parse(req.params);
      const { isActive } = req.body;

      if (isActive === undefined) throw new AppError(400, 'isActive parameter required', 'VALIDATION_ERROR');

      const updated = await PackageService.updatePackageStatus(id, Boolean(isActive));
      res.status(200).json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  }
}
