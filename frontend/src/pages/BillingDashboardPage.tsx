import React, { useEffect, useState } from 'react';
import { paymentService, UserSubscriptionInfo, TransactionRecord } from '../services/paymentService';
import { Download } from 'lucide-react';

export const BillingDashboardPage: React.FC = () => {
  const [subInfo, setSubInfo] = useState<UserSubscriptionInfo | null>(null);
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([paymentService.getUserSubscription(), paymentService.getUserTransactions()])
      .then(([subRes, txnsRes]) => {
        setSubInfo(subRes);
        setTransactions(txnsRes);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div>
          <h1 className="text-xl font-black text-gray-900">Billing & Subscription Management</h1>
          <p className="text-xs text-gray-500 font-medium">Manage active plan entitlements and download invoices</p>
        </div>
      </div>

      {/* Active Subscription Banner */}
      {subInfo?.activeSubscription ? (
        <div className="p-5 bg-gradient-to-r from-brand-primary to-brand-dark text-white rounded-2xl space-y-2 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-white/80">Active Subscription</span>
            <span className="bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
              {subInfo.activeSubscription.status}
            </span>
          </div>
          <h2 className="text-xl font-black">{subInfo.activeSubscription.packageName}</h2>
          <p className="text-xs text-white/80 font-medium">
            Remaining Listing Allowance: <span className="font-bold text-white">{subInfo.remainingListings} listings</span>
          </p>
          <p className="text-[11px] text-white/70">
            Valid until {new Date(subInfo.activeSubscription.endDate).toLocaleDateString()}
          </p>
        </div>
      ) : (
        <div className="p-5 bg-gray-50 border border-gray-200 rounded-2xl text-xs space-y-2">
          <p className="font-bold text-gray-900">Free Listing Plan Active</p>
          <p className="text-gray-500">Upgrade to a seller package to unlock multi-property listings and featured priority ranking.</p>
        </div>
      )}

      {/* Transaction History Table */}
      <div className="space-y-4 pt-4">
        <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-2">Payment Transaction History</h2>

        {loading ? (
          <div className="space-y-2">
            {[1, 2].map((n) => (
              <div key={n} className="h-16 bg-gray-200 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <p className="text-xs text-gray-400 font-medium py-4 text-center">No payment transactions recorded</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {transactions.map((txn) => (
              <div key={txn.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-gray-900">₹ {txn.amount.toLocaleString('en-IN')}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${txn.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                      {txn.status}
                    </span>
                  </div>
                  <p className="text-gray-400 text-[11px]">{new Date(txn.createdAt).toLocaleDateString()}</p>
                </div>

                {txn.invoices && txn.invoices.length > 0 && (
                  <button
                    onClick={() => alert(`Downloading Invoice #${txn.invoices![0].invoiceNumber}`)}
                    className="border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center space-x-1 shrink-0"
                  >
                    <Download className="w-3.5 h-3.5 text-gray-500" />
                    <span>Invoice #{txn.invoices[0].invoiceNumber}</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
