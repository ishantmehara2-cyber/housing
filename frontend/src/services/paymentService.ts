import { apiClient } from './apiClient';
import { ApiResponse } from '@housing-clone/shared';

export interface PackageRecord {
  id: string;
  name: string;
  targetRole: string;
  price: number;
  validityDays: number;
  maxListings: number;
  featuredListingsCount: number;
  isActive: boolean;
}

export interface UserSubscriptionInfo {
  canPostListing: boolean;
  canCreateFeaturedListing: boolean;
  remainingListings: number;
  remainingFeaturedListings: number;
  activeSubscription?: {
    id: string;
    packageName: string;
    remainingListings: number;
    startDate: string;
    endDate: string;
    status: string;
  };
}

export interface TransactionRecord {
  id: string;
  amount: number;
  currency: string;
  provider: string;
  status: string;
  createdAt: string;
  invoices?: Array<{ id: string; invoiceNumber: string; amount: number }>;
}

export const paymentService = {
  async getPackages(): Promise<PackageRecord[]> {
    const res = await apiClient.get<ApiResponse<PackageRecord[]>>('/packages');
    return res.data.data || [];
  },

  async createOrder(packageId: string) {
    const res = await apiClient.post<ApiResponse<{ transactionId: string; providerOrderId: string; amount: number; keyId: string }>>(
      '/payments/orders',
      { packageId }
    );
    return res.data.data!;
  },

  async verifyPayment(transactionId: string, credentials: { providerOrderId: string; providerPaymentId: string; providerSignature: string }) {
    const res = await apiClient.post<ApiResponse>(
      '/payments/verify',
      { transactionId, ...credentials }
    );
    return res.data;
  },

  async getUserSubscription(): Promise<UserSubscriptionInfo> {
    const res = await apiClient.get<ApiResponse<UserSubscriptionInfo>>('/billing/subscription');
    return res.data.data!;
  },

  async getUserTransactions(): Promise<TransactionRecord[]> {
    const res = await apiClient.get<ApiResponse<TransactionRecord[]>>('/billing/transactions');
    return res.data.data || [];
  },
};
