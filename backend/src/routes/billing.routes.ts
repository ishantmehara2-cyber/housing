import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';
import { requireAuth } from '../middlewares/auth.middleware';

export const billingRouter = Router();

billingRouter.get('/subscription', requireAuth, PaymentController.getUserSubscription);
billingRouter.get('/transactions', requireAuth, PaymentController.getUserTransactions);
billingRouter.get('/invoices', requireAuth, PaymentController.getUserInvoices);
