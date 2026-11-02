import { Request, Response, NextFunction } from 'express';
import {
  brokerQuerySchema,
  contactBrokerSchema,
  createBrokerSchema,
  updateBrokerProfileSchema,
  resetBrokerPasswordSchema,
  idParamSchema,
  ApiResponse,
} from '@housing-clone/shared';
import { BrokerService } from '../services/broker.service';
import { AppError } from '../middlewares/errorHandler';

export class BrokerController {
  // Public
  public static async getBrokers(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const input = brokerQuerySchema.parse(req.query);
      const result = await BrokerService.getBrokers(input);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  public static async getBrokerById(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const { id } = idParamSchema.parse(req.params);
      const broker = await BrokerService.getBrokerById(id);
      res.status(200).json({ success: true, data: broker });
    } catch (err) {
      next(err);
    }
  }

  public static async contactBroker(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const { id } = idParamSchema.parse(req.params);
      const input = contactBrokerSchema.parse(req.body);
      const userId = req.user ? req.user.id : 'guest_user';

      const enquiry = await BrokerService.contactBroker(userId, id, input, req.ip);
      res.status(201).json({ success: true, message: 'Enquiry sent to broker successfully', data: enquiry });
    } catch (err) {
      next(err);
    }
  }

  // Admin Broker Management
  public static async createBrokerByAdmin(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');

      const input = createBrokerSchema.parse(req.body);
      const broker = await BrokerService.createBrokerByAdmin(input, req.user.id, req.ip);

      res.status(201).json({ success: true, message: 'Broker created successfully', data: broker });
    } catch (err) {
      next(err);
    }
  }

  public static async getBrokersForAdmin(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');

      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;

      const result = await BrokerService.getBrokersForAdmin(page, limit);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  public static async updateBrokerStatusByAdmin(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');

      const { id } = idParamSchema.parse(req.params);
      const { status } = req.body;

      const updated = await BrokerService.updateBrokerStatusByAdmin(id, status, req.user.id, req.ip);
      res.status(200).json({ success: true, message: 'Broker status updated', data: updated });
    } catch (err) {
      next(err);
    }
  }

  public static async resetBrokerPasswordByAdmin(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');

      const { id } = idParamSchema.parse(req.params);
      const { newPassword } = resetBrokerPasswordSchema.parse(req.body);

      const result = await BrokerService.resetBrokerPasswordByAdmin(id, newPassword, req.user.id, req.ip);
      res.status(200).json({ success: true, message: result.message });
    } catch (err) {
      next(err);
    }
  }

  // Broker Portal Self Actions
  public static async getBrokerDashboard(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');

      const metrics = await BrokerService.getBrokerDashboardMetrics(req.user.id);
      res.status(200).json({ success: true, data: metrics });
    } catch (err) {
      next(err);
    }
  }

  public static async getBrokerProperties(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');

      const properties = await BrokerService.getBrokerProperties(req.user.id);
      res.status(200).json({ success: true, data: properties });
    } catch (err) {
      next(err);
    }
  }

  public static async getBrokerLeads(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');

      const leads = await BrokerService.getBrokerLeads(req.user.id);
      res.status(200).json({ success: true, data: leads });
    } catch (err) {
      next(err);
    }
  }

  public static async assignLeadToSubAgent(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');

      const { id } = idParamSchema.parse(req.params);
      const { targetAgentId } = req.body;
      if (!targetAgentId) throw new AppError(400, 'targetAgentId is required', 'VALIDATION_ERROR');

      const updated = await BrokerService.assignLeadToSubAgent(req.user.id, id, targetAgentId);
      res.status(200).json({ success: true, message: 'Lead assigned successfully', data: updated });
    } catch (err) {
      next(err);
    }
  }

  public static async updateLeadStatusByBroker(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');

      const { id } = idParamSchema.parse(req.params);
      const { status, notes } = req.body;
      if (!status) throw new AppError(400, 'status is required', 'VALIDATION_ERROR');

      const updated = await BrokerService.updateLeadStatusByBroker(req.user.id, id, status, notes);
      res.status(200).json({ success: true, message: 'Lead status updated', data: updated });
    } catch (err) {
      next(err);
    }
  }

  public static async getBrokerTeam(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');

      const team = await BrokerService.getBrokerTeam(req.user.id);
      res.status(200).json({ success: true, data: team });
    } catch (err) {
      next(err);
    }
  }

  public static async addSubAgentByBroker(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');

      const { firstName, lastName, email, phone, password } = req.body;
      if (!firstName || !lastName || !email || !phone || !password) {
        throw new AppError(400, 'Missing sub-agent registration fields', 'VALIDATION_ERROR');
      }

      const subAgent = await BrokerService.addSubAgentByBroker(req.user.id, { firstName, lastName, email, phone, password });
      res.status(201).json({ success: true, message: 'Sub-agent added to team successfully', data: subAgent });
    } catch (err) {
      next(err);
    }
  }

  public static async getBrokerEnquiries(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');

      const enquiries = await BrokerService.getBrokerEnquiries(req.user.id);
      res.status(200).json({ success: true, data: enquiries });
    } catch (err) {
      next(err);
    }
  }

  public static async getBrokerVisits(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');

      const visits = await BrokerService.getBrokerVisits(req.user.id);
      res.status(200).json({ success: true, data: visits });
    } catch (err) {
      next(err);
    }
  }

  public static async updateBrokerVisitStatus(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');

      const { id } = idParamSchema.parse(req.params);
      const { status } = req.body;

      const updated = await BrokerService.updateBrokerVisitStatus(req.user.id, id, status);
      res.status(200).json({ success: true, message: 'Visit status updated', data: updated });
    } catch (err) {
      next(err);
    }
  }

  public static async getBrokerProfile(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');

      const profile = await BrokerService.getBrokerProfile(req.user.id);
      res.status(200).json({ success: true, data: profile });
    } catch (err) {
      next(err);
    }
  }

  public static async updateBrokerProfile(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');

      const input = updateBrokerProfileSchema.parse(req.body);
      const updated = await BrokerService.updateBrokerProfile(req.user.id, input);

      res.status(200).json({ success: true, message: 'Broker profile updated', data: updated });
    } catch (err) {
      next(err);
    }
  }
}
