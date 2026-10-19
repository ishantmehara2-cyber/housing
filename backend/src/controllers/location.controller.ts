import { Request, Response, NextFunction } from 'express';
import {
  ApiResponse,
  StateSummary,
  CitySummary,
  LocalitySummary,
  SubLocalitySummary,
} from '@housing-clone/shared';
import { LocationService } from '../services/location.service';

export class LocationController {
  public static async getStates(_req: Request, res: Response<ApiResponse<StateSummary[]>>, next: NextFunction): Promise<void> {
    try {
      const states = await LocationService.getStates();
      res.status(200).json({ success: true, data: states });
    } catch (err) {
      next(err);
    }
  }

  public static async getCities(req: Request, res: Response<ApiResponse<CitySummary[]>>, next: NextFunction): Promise<void> {
    try {
      const stateId = req.query.stateId ? String(req.query.stateId) : undefined;
      const cities = await LocationService.getCities(stateId);
      res.status(200).json({ success: true, data: cities });
    } catch (err) {
      next(err);
    }
  }

  public static async getLocalities(req: Request, res: Response<ApiResponse<LocalitySummary[]>>, next: NextFunction): Promise<void> {
    try {
      const cityIdentifier =
        req.params.slug ||
        (req.query.cityId ? String(req.query.cityId) : undefined) ||
        (req.query.citySlug ? String(req.query.citySlug) : undefined) ||
        (req.query.city ? String(req.query.city) : undefined);

      const localities = await LocationService.getLocalities(cityIdentifier);
      res.status(200).json({ success: true, data: localities });
    } catch (err) {
      next(err);
    }
  }

  public static async getSubLocalities(req: Request, res: Response<ApiResponse<SubLocalitySummary[]>>, next: NextFunction): Promise<void> {
    try {
      const localityIdentifier =
        req.params.slug ||
        (req.query.localityId ? String(req.query.localityId) : undefined) ||
        (req.query.localitySlug ? String(req.query.localitySlug) : undefined) ||
        (req.query.locality ? String(req.query.locality) : undefined);

      const subLocalities = await LocationService.getSubLocalities(localityIdentifier);
      res.status(200).json({ success: true, data: subLocalities });
    } catch (err) {
      next(err);
    }
  }
}
