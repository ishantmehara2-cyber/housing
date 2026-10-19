import { Request, Response, NextFunction } from 'express';
import { createEnquirySchema, ApiResponse } from '@housing-clone/shared';
import { EnquiryService } from '../services/enquiry.service';
import { AppError } from '../middlewares/errorHandler';

export class EnquiryController {
  public static async createEnquiry(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');

      const input = createEnquirySchema.parse(req.body);
      const result = await EnquiryService.createEnquiry(req.user.id, input, req.ip);

      res.status(201).json({ success: true, message: 'Enquiry sent successfully', data: result });
    } catch (err) {
      next(err);
    }
  }
}
