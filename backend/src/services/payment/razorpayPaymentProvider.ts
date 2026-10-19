import crypto from 'crypto';
import { IPaymentProvider, PaymentOrderOptions, PaymentOrderResult, VerificationOptions, RefundOptions } from './payment.types';

export class RazorpayPaymentProvider implements IPaymentProvider {
  private keyId: string;
  private keySecret: string;

  constructor() {
    this.keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_key_id';
    this.keySecret = process.env.RAZORPAY_KEY_SECRET || 'rzp_test_secret';
  }

  public async createOrder(options: PaymentOrderOptions): Promise<PaymentOrderResult> {
    const providerOrderId = `order_rzp_${crypto.randomBytes(8).toString('hex')}`;
    return {
      providerOrderId,
      amount: options.amount,
      currency: options.currency,
      keyId: this.keyId,
    };
  }

  public verifyPaymentSignature(options: VerificationOptions): boolean {
    const body = `${options.providerOrderId}|${options.providerPaymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', this.keySecret)
      .update(body)
      .digest('hex');

    return expectedSignature === options.providerSignature;
  }

  public async refundPayment(_options: RefundOptions): Promise<{ refundId: string; status: string }> {
    return {
      refundId: `rfnd_rzp_${crypto.randomBytes(8).toString('hex')}`,
      status: 'PROCESSED',
    };
  }
}
