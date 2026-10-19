import { Request, Response, NextFunction } from 'express';
import { ApiResponse, idParamSchema } from '@housing-clone/shared';
import { PaymentService } from '../services/payment.service';
import { EntitlementService } from '../services/entitlement.service';
import { AppError } from '../middlewares/errorHandler';

export class PaymentController {
  public static async createOrder(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');

      const { packageId } = req.body;
      if (!packageId) throw new AppError(400, 'packageId parameter is required', 'VALIDATION_ERROR');

      const result = await PaymentService.createOrder(req.user.id, packageId);
      res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  public static async verifyPayment(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');

      const { transactionId, providerOrderId, providerPaymentId, providerSignature } = req.body;

      if (!transactionId || !providerOrderId || !providerPaymentId || !providerSignature) {
        throw new AppError(400, 'Missing payment verification credentials', 'VALIDATION_ERROR');
      }

      const result = await PaymentService.verifyPayment(
        req.user.id,
        transactionId,
        { providerOrderId, providerPaymentId, providerSignature },
        req.ip
      );

      res.status(200).json({ success: true, message: 'Payment verified successfully', data: result });
    } catch (err) {
      next(err);
    }
  }

  public static async getUserSubscription(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');

      const entitlements = await EntitlementService.getUserEntitlements(req.user.id);
      res.status(200).json({ success: true, data: entitlements });
    } catch (err) {
      next(err);
    }
  }

  public static async getUserTransactions(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');

      const txns = await PaymentService.getUserTransactions(req.user.id);
      res.status(200).json({ success: true, data: txns });
    } catch (err) {
      next(err);
    }
  }

  public static async getUserInvoices(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');

      const invoices = await PaymentService.getUserInvoices(req.user.id);
      res.status(200).json({ success: true, data: invoices });
    } catch (err) {
      next(err);
    }
  }

  public static async getAllTransactionsForAdmin(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');

      const txns = await PaymentService.getAllTransactionsForAdmin();
      res.status(200).json({ success: true, data: txns });
    } catch (err) {
      next(err);
    }
  }

  public static async processRefund(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');

      const { id } = idParamSchema.parse(req.params);
      const { reason } = req.body;

      const refund = await PaymentService.processRefund(req.user.id, id, reason, req.ip);
      res.status(200).json({ success: true, message: 'Refund processed successfully', data: refund });
    } catch (err) {
      next(err);
    }
  }
}
