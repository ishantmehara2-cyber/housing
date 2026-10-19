import { Request, Response, NextFunction } from 'express';
import {
  paginationSchema,
  idParamSchema,
  updatePropertyStatusSchema,
  updateVerificationSchema,
  updateUserStatusSchema,
  updateUserRoleSchema,
  updateReportStatusSchema,
  createBrokerSchema,
  createStateSchema,
  updateStateSchema,
  createCitySchema,
  updateCitySchema,
  createLocalitySchema,
  updateLocalitySchema,
  createSubLocalitySchema,
  updateSubLocalitySchema,
  createPropertyTypeSchema,
  createAmenitySchema,
  toggleFeatureFlagSchema,
  updateSystemSettingSchema,
  upsertCMSContentSchema,
  ApiResponse,
} from '@housing-clone/shared';
import { AdminService } from '../services/admin.service';
import { AppError } from '../middlewares/errorHandler';

export class AdminController {
  public static async getOverviewMetrics(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');
      const result = await AdminService.getOverviewMetrics(req.user.role);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  public static async getProperties(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');
      const { page, limit } = paginationSchema.parse(req.query);
      const listingState = req.query.listingState ? String(req.query.listingState) : undefined;
      const verificationState = req.query.verificationState ? String(req.query.verificationState) : undefined;

      const result = await AdminService.getProperties(req.user.role, page, limit, listingState, verificationState);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  public static async updatePropertyStatus(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');
      const { id } = idParamSchema.parse(req.params);
      const input = updatePropertyStatusSchema.parse(req.body);

      const updated = await AdminService.updatePropertyStatus(
        req.user.id,
        req.user.role,
        id,
        input.status,
        input.rejectionReason,
        req.ip
      );
      res.status(200).json({ success: true, message: 'Property status updated', data: updated });
    } catch (err) {
      next(err);
    }
  }

  public static async getVerificationQueue(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');
      const { page, limit } = paginationSchema.parse(req.query);
      const result = await AdminService.getVerificationQueue(req.user.role, page, limit);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  public static async updateVerificationState(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');
      const { id } = idParamSchema.parse(req.params);
      const input = updateVerificationSchema.parse(req.body);

      const updated = await AdminService.updateVerificationState(
        req.user.id,
        req.user.role,
        id,
        input.verificationState,
        input.notes,
        req.ip
      );
      res.status(200).json({ success: true, message: 'Property verification state updated', data: updated });
    } catch (err) {
      next(err);
    }
  }

  public static async getUsers(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');
      const { page, limit } = paginationSchema.parse(req.query);
      const roleFilter = req.query.role ? String(req.query.role) : undefined;
      const statusFilter = req.query.status ? String(req.query.status) : undefined;

      const result = await AdminService.getUsers(req.user.role, page, limit, roleFilter, statusFilter);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  public static async updateUserStatus(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');
      const { id } = idParamSchema.parse(req.params);
      const input = updateUserStatusSchema.parse(req.body);

      const updated = await AdminService.updateUserStatus(req.user.id, req.user.role, id, input.status, req.ip);
      res.status(200).json({ success: true, message: 'User status updated', data: updated });
    } catch (err) {
      next(err);
    }
  }

  public static async updateUserRole(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');
      const { id } = idParamSchema.parse(req.params);
      const input = updateUserRoleSchema.parse(req.body);

      const updated = await AdminService.updateUserRole(req.user.id, req.user.role, id, input.role, req.ip);
      res.status(200).json({ success: true, message: 'User role updated', data: updated });
    } catch (err) {
      next(err);
    }
  }

  public static async createBroker(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');
      const input = createBrokerSchema.parse(req.body);

      const created = await AdminService.createBroker(req.user.id, req.user.role, input, req.ip);
      res.status(201).json({ success: true, message: 'Broker created successfully', data: created });
    } catch (err) {
      next(err);
    }
  }

  public static async getProjects(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');
      const { page, limit } = paginationSchema.parse(req.query);
      const result = await AdminService.getProjects(req.user.role, page, limit);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  public static async getDevelopers(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');
      const developers = await AdminService.getDevelopers(req.user.role);
      res.status(200).json({ success: true, data: developers });
    } catch (err) {
      next(err);
    }
  }

  // States Management
  public static async getStates(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');
      const states = await AdminService.getStates(req.user.role);
      res.status(200).json({ success: true, data: states });
    } catch (err) {
      next(err);
    }
  }

  public static async createState(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');
      const input = createStateSchema.parse(req.body);
      const state = await AdminService.createState(req.user.id, req.user.role, input, req.ip);
      res.status(201).json({ success: true, message: 'State created', data: state });
    } catch (err) {
      next(err);
    }
  }

  public static async updateState(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');
      const { id } = idParamSchema.parse(req.params);
      const input = updateStateSchema.parse(req.body);
      const state = await AdminService.updateState(req.user.id, req.user.role, id, input, req.ip);
      res.status(200).json({ success: true, message: 'State updated', data: state });
    } catch (err) {
      next(err);
    }
  }

  // Cities Management
  public static async getCities(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');
      const stateId = req.query.stateId ? String(req.query.stateId) : undefined;
      const cities = await AdminService.getCities(req.user.role, stateId);
      res.status(200).json({ success: true, data: cities });
    } catch (err) {
      next(err);
    }
  }

  public static async createCity(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');
      const input = createCitySchema.parse(req.body);
      const city = await AdminService.createCity(req.user.id, req.user.role, input, req.ip);
      res.status(201).json({ success: true, message: 'City created', data: city });
    } catch (err) {
      next(err);
    }
  }

  public static async updateCity(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');
      const { id } = idParamSchema.parse(req.params);
      const input = updateCitySchema.parse(req.body);
      const city = await AdminService.updateCity(req.user.id, req.user.role, id, input, req.ip);
      res.status(200).json({ success: true, message: 'City updated', data: city });
    } catch (err) {
      next(err);
    }
  }

  // Localities Management
  public static async getLocalities(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');
      const cityId = req.query.cityId ? String(req.query.cityId) : undefined;
      const localities = await AdminService.getLocalities(req.user.role, cityId);
      res.status(200).json({ success: true, data: localities });
    } catch (err) {
      next(err);
    }
  }

  public static async createLocality(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');
      const input = createLocalitySchema.parse(req.body);
      const locality = await AdminService.createLocality(req.user.id, req.user.role, input, req.ip);
      res.status(201).json({ success: true, message: 'Locality created', data: locality });
    } catch (err) {
      next(err);
    }
  }

  public static async updateLocality(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');
      const { id } = idParamSchema.parse(req.params);
      const input = updateLocalitySchema.parse(req.body);
      const locality = await AdminService.updateLocality(req.user.id, req.user.role, id, input, req.ip);
      res.status(200).json({ success: true, message: 'Locality updated', data: locality });
    } catch (err) {
      next(err);
    }
  }

  // SubLocalities Management
  public static async getSubLocalities(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');
      const localityId = req.query.localityId ? String(req.query.localityId) : undefined;
      const subLocalities = await AdminService.getSubLocalities(req.user.role, localityId);
      res.status(200).json({ success: true, data: subLocalities });
    } catch (err) {
      next(err);
    }
  }

  public static async createSubLocality(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');
      const input = createSubLocalitySchema.parse(req.body);
      const subLocality = await AdminService.createSubLocality(req.user.id, req.user.role, input, req.ip);
      res.status(201).json({ success: true, message: 'SubLocality created', data: subLocality });
    } catch (err) {
      next(err);
    }
  }

  public static async updateSubLocality(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');
      const { id } = idParamSchema.parse(req.params);
      const input = updateSubLocalitySchema.parse(req.body);
      const subLocality = await AdminService.updateSubLocality(req.user.id, req.user.role, id, input, req.ip);
      res.status(200).json({ success: true, message: 'SubLocality updated', data: subLocality });
    } catch (err) {
      next(err);
    }
  }

  public static async getPropertyTypes(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');
      const pts = await AdminService.getPropertyTypes(req.user.role);
      res.status(200).json({ success: true, data: pts });
    } catch (err) {
      next(err);
    }
  }

  public static async createPropertyType(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');
      const input = createPropertyTypeSchema.parse(req.body);
      const pt = await AdminService.createPropertyType(req.user.id, req.user.role, input, req.ip);
      res.status(201).json({ success: true, message: 'Property type created', data: pt });
    } catch (err) {
      next(err);
    }
  }

  public static async getAmenities(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');
      const amenities = await AdminService.getAmenities(req.user.role);
      res.status(200).json({ success: true, data: amenities });
    } catch (err) {
      next(err);
    }
  }

  public static async createAmenity(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');
      const input = createAmenitySchema.parse(req.body);
      const amenity = await AdminService.createAmenity(req.user.id, req.user.role, input, req.ip);
      res.status(201).json({ success: true, message: 'Amenity created', data: amenity });
    } catch (err) {
      next(err);
    }
  }

  public static async getLeads(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');
      const { page, limit } = paginationSchema.parse(req.query);
      const result = await AdminService.getLeads(req.user.role, page, limit);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  public static async getEnquiries(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');
      const { page, limit } = paginationSchema.parse(req.query);
      const result = await AdminService.getEnquiries(req.user.role, page, limit);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  public static async getVisits(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');
      const { page, limit } = paginationSchema.parse(req.query);
      const result = await AdminService.getVisits(req.user.role, page, limit);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  public static async getReports(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');
      const { page, limit } = paginationSchema.parse(req.query);
      const statusFilter = req.query.status ? String(req.query.status) : undefined;

      const result = await AdminService.getReports(req.user.role, page, limit, statusFilter);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  public static async updateReportStatus(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');
      const { id } = idParamSchema.parse(req.params);
      const input = updateReportStatusSchema.parse(req.body);

      const updated = await AdminService.updateReportStatus(
        req.user.id,
        req.user.role,
        id,
        input.status,
        input.resolution,
        req.ip
      );
      res.status(200).json({ success: true, message: 'Report status updated', data: updated });
    } catch (err) {
      next(err);
    }
  }

  public static async getAuditLogs(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');
      const { page, limit } = paginationSchema.parse(req.query);
      const result = await AdminService.getAuditLogs(req.user.role, page, limit);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  public static async getFeatureFlags(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');
      const flags = await AdminService.getFeatureFlags(req.user.role);
      res.status(200).json({ success: true, data: flags });
    } catch (err) {
      next(err);
    }
  }

  public static async toggleFeatureFlag(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');
      const { id } = idParamSchema.parse(req.params);
      const input = toggleFeatureFlagSchema.parse(req.body);

      const updated = await AdminService.toggleFeatureFlag(req.user.id, req.user.role, id, input.isEnabled, req.ip);
      res.status(200).json({ success: true, message: 'Feature flag status updated', data: updated });
    } catch (err) {
      next(err);
    }
  }

  public static async getSystemSettings(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');
      const settings = await AdminService.getSystemSettings(req.user.role);
      res.status(200).json({ success: true, data: settings });
    } catch (err) {
      next(err);
    }
  }

  public static async updateSystemSetting(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');
      const input = updateSystemSettingSchema.parse(req.body);

      const updated = await AdminService.updateSystemSetting(req.user.id, req.user.role, input.key, input.value, req.ip);
      res.status(200).json({ success: true, message: 'System setting updated', data: updated });
    } catch (err) {
      next(err);
    }
  }

  public static async getCMSContents(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');
      const contents = await AdminService.getCMSContents(req.user.role);
      res.status(200).json({ success: true, data: contents });
    } catch (err) {
      next(err);
    }
  }

  public static async upsertCMSContent(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');
      const input = upsertCMSContentSchema.parse(req.body);

      const cms = await AdminService.upsertCMSContent(req.user.id, req.user.role, input, req.ip);
      res.status(200).json({ success: true, message: 'CMS content updated', data: cms });
    } catch (err) {
      next(err);
    }
  }

  public static async getSystemHealth(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');
      const health = await AdminService.getSystemHealth(req.user.role);
      res.status(200).json({ success: true, data: health });
    } catch (err) {
      next(err);
    }
  }
}
