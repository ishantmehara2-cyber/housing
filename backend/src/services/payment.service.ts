import crypto from 'crypto';
import { db } from '../config/db';
import { AppError } from '../middlewares/errorHandler';
import { IPaymentProvider } from './payment/payment.types';
import { MockPaymentProvider } from './payment/mockPaymentProvider';
import { RazorpayPaymentProvider } from './payment/razorpayPaymentProvider';
import { NotificationService } from './notification/notification.service';
import { AuditService } from './audit.service';
import { NotificationChannel } from '@housing-clone/shared';
import { Prisma } from '@prisma/client';

export class PaymentService {
  private static getPaymentProvider(): IPaymentProvider {
    const providerName = process.env.PAYMENT_PROVIDER || 'mock';
    if (providerName === 'mock') {
      return new MockPaymentProvider();
    }
    return new RazorpayPaymentProvider();
  }

  public static async createOrder(userId: string, packageId: string) {
    const pkg = await db.package.findUnique({ where: { id: packageId } });
    if (!pkg || !pkg.isActive) {
      throw new AppError(404, 'Package is inactive or does not exist', 'NOT_FOUND');
    }

    const provider = PaymentService.getPaymentProvider();
    const orderRef = `txn_${crypto.randomBytes(8).toString('hex')}`;

    // Create order using provider
    const orderResult = await provider.createOrder({
      amount: Number(pkg.price),
      currency: 'INR',
      orderId: orderRef,
      description: `Subscription: ${pkg.name}`,
    });

    // Create pending transaction record in MySQL
    const transaction = await db.transaction.create({
      data: {
        userId,
        amount: pkg.price,
        currency: 'INR',
        provider: process.env.PAYMENT_PROVIDER || 'RAZORPAY',
        providerOrderId: orderResult.providerOrderId,
        status: 'PENDING',
        metadata: { packageId: pkg.id, packageName: pkg.name } as Prisma.InputJsonValue,
      },
    });

    return {
      transactionId: transaction.id,
      providerOrderId: orderResult.providerOrderId,
      amount: Number(pkg.price),
      currency: 'INR',
      keyId: orderResult.keyId,
    };
  }

  public static async verifyPayment(
    userId: string,
    transactionId: string,
    verification: { providerOrderId: string; providerPaymentId: string; providerSignature: string },
    ipAddress?: string
  ) {
    const transaction = await db.transaction.findUnique({ where: { id: transactionId } });
    if (!transaction || transaction.userId !== userId) {
      throw new AppError(404, 'Transaction record not found', 'NOT_FOUND');
    }

    if (transaction.status === 'SUCCESS') {
      return { status: 'SUCCESS', message: 'Payment already verified' };
    }

    const provider = PaymentService.getPaymentProvider();
    const isValidSignature = provider.verifyPaymentSignature(verification);

    if (!isValidSignature) {
      await db.transaction.update({
        where: { id: transactionId },
        data: { status: 'FAILED' },
      });
      throw new AppError(400, 'Invalid payment signature verification', 'PAYMENT_FAILED');
    }

    const metadata = transaction.metadata as { packageId: string; packageName: string };
    const pkg = await db.package.findUnique({ where: { id: metadata.packageId } });

    if (!pkg) {
      throw new AppError(404, 'Package associated with transaction not found', 'NOT_FOUND');
    }

    // Execute payment fulfillment inside database transaction
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + pkg.validityDays);

    const { subscription, invoice } = await db.$transaction(async (tx) => {
      // 1. Update Transaction to SUCCESS
      await tx.transaction.update({
        where: { id: transactionId },
        data: {
          status: 'SUCCESS',
          providerPaymentId: verification.providerPaymentId,
        },
      });

      // 2. Create Active Subscription
      const sub = await tx.subscription.create({
        data: {
          userId,
          packageId: pkg.id,
          remainingListings: pkg.maxListings,
          startDate,
          endDate,
          status: 'ACTIVE',
        },
      });

      // 3. Generate Invoice
      const invoiceNumber = `INV-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
      const taxAmount = Number(pkg.price) * 0.18; // 18% GST

      const inv = await tx.invoice.create({
        data: {
          transactionId,
          invoiceNumber,
          amount: pkg.price,
          taxAmount,
          issuedAt: new Date(),
        },
      });

      return { subscription: sub, invoice: inv };
    });

    // Notify user
    await NotificationService.createNotification(
      userId,
      'Payment Successful & Package Activated',
      `Your subscription for "${pkg.name}" is now active. Invoice #${invoice.invoiceNumber} generated.`,
      'PAYMENT',
      NotificationChannel.IN_APP
    );

    // Audit Log
    await AuditService.log(userId, 'PAYMENT_SUCCEEDED', 'Transaction', transactionId, { packageId: pkg.id, invoiceId: invoice.id }, ipAddress);

    return {
      status: 'SUCCESS',
      subscriptionId: subscription.id,
      invoiceNumber: invoice.invoiceNumber,
    };
  }

  public static async getUserTransactions(userId: string) {
    return db.transaction.findMany({
      where: { userId },
      include: { invoices: true, refunds: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  public static async getUserInvoices(userId: string) {
    return db.invoice.findMany({
      where: { transaction: { userId } },
      include: { transaction: true },
      orderBy: { issuedAt: 'desc' },
    });
  }

  public static async getAllTransactionsForAdmin() {
    return db.transaction.findMany({
      include: { user: { select: { firstName: true, lastName: true, email: true } }, invoices: true, refunds: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  public static async processRefund(adminUserId: string, transactionId: string, reason?: string, ipAddress?: string) {
    const transaction = await db.transaction.findUnique({ where: { id: transactionId } });
    if (!transaction || transaction.status !== 'SUCCESS') {
      throw new AppError(400, 'Only successful transactions can be refunded', 'INVALID_REFUND');
    }

    const provider = PaymentService.getPaymentProvider();
    const refundResult = await provider.refundPayment({
      providerPaymentId: transaction.providerPaymentId || 'mock_pay_id',
      amount: Number(transaction.amount),
      reason,
    });

    const refund = await db.refund.create({
      data: {
        transactionId,
        amount: transaction.amount,
        reason,
        status: refundResult.status,
      },
    });

    await db.transaction.update({
      where: { id: transactionId },
      data: { status: 'REFUNDED' },
    });

    // Audit Log
    await AuditService.log(adminUserId, 'REFUND_COMPLETED', 'Refund', refund.id, { transactionId, amount: transaction.amount }, ipAddress);

    return refund;
  }
}
