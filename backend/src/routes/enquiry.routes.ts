import { Router } from 'express';
import { EnquiryController } from '../controllers/enquiry.controller';
import { requireAuth } from '../middlewares/auth.middleware';

export const enquiryRouter = Router();

enquiryRouter.post('/', requireAuth, EnquiryController.createEnquiry);
