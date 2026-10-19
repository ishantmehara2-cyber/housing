import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';
import { requireAuth } from '../middlewares/auth.middleware';

export const paymentRouter = Router();

paymentRouter.post('/orders', requireAuth, PaymentController.createOrder);
paymentRouter.post('/verify', requireAuth, PaymentController.verifyPayment);
