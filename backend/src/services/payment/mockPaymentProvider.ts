import crypto from 'crypto';
import { IPaymentProvider, PaymentOrderOptions, PaymentOrderResult, VerificationOptions, RefundOptions } from './payment.types';
import { AppError } from '../../middlewares/errorHandler';

export class MockPaymentProvider implements IPaymentProvider {
  constructor() {
    if (process.env.NODE_ENV === 'production') {
      throw new AppError(500, 'Mock payment provider is strictly disabled in production environments.', 'SECURITY_ERROR');
    }
  }

  public async createOrder(options: PaymentOrderOptions): Promise<PaymentOrderResult> {
    const providerOrderId = `order_mock_${crypto.randomBytes(8).toString('hex')}`;
    return {
      providerOrderId,
      amount: options.amount,
      currency: options.currency,
      keyId: 'rzp_test_mock_key_id',
    };
  }

  public verifyPaymentSignature(options: VerificationOptions): boolean {
    return Boolean(options.providerOrderId && options.providerPaymentId && options.providerSignature);
  }

  public async refundPayment(_options: RefundOptions): Promise<{ refundId: string; status: string }> {
    return {
      refundId: `rfnd_mock_${crypto.randomBytes(8).toString('hex')}`,
      status: 'PROCESSED',
    };
  }
}
