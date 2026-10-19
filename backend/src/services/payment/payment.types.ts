export interface PaymentOrderOptions {
  amount: number;
  currency: string;
  orderId: string;
  description?: string;
}

export interface PaymentOrderResult {
  providerOrderId: string;
  amount: number;
  currency: string;
  keyId?: string;
}

export interface VerificationOptions {
  providerOrderId: string;
  providerPaymentId: string;
  providerSignature: string;
}

export interface RefundOptions {
  providerPaymentId: string;
  amount: number;
  reason?: string;
}

export interface IPaymentProvider {
  createOrder(options: PaymentOrderOptions): Promise<PaymentOrderResult>;
  verifyPaymentSignature(options: VerificationOptions): boolean;
  refundPayment(options: RefundOptions): Promise<{ refundId: string; status: string }>;
}
