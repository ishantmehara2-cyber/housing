import React, { useEffect, useState } from 'react';
import { apiClient } from '../services/apiClient';
import { CreditCard, RotateCcw } from 'lucide-react';

interface AdminTxn {
  id: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
  user: { firstName: string; lastName: string; email: string };
  refunds?: Array<{ id: string; amount: number }>;
}

export const AdminTransactionsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<AdminTxn[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTxns = () => {
    setLoading(true);
    apiClient
      .get('/admin/transactions')
      .then((res) => setTransactions(res.data.data || []))
      .catch(() => setTransactions([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTxns();
  }, []);

  const handleProcessRefund = async (id: string) => {
    const reason = prompt('Enter reason for refund:');
    if (!reason) return;

    try {
      await apiClient.post(`/admin/refunds/${id}`, { reason });
      alert('Refund processed successfully');
      fetchTxns();
    } catch {
      alert('Failed to process refund');
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div>
          <h1 className="text-xl font-black text-gray-900">Transactions & Refund Oversight</h1>
          <p className="text-xs text-gray-500 font-medium">Systemwide payment history and administrative refunds</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-20 bg-gray-200 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <div className="p-8 text-center text-gray-400 space-y-2">
          <CreditCard className="w-10 h-10 mx-auto opacity-40" />
          <p className="text-xs font-bold">No system transactions recorded</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {transactions.map((txn) => (
            <div key={txn.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-gray-900">₹ {txn.amount.toLocaleString('en-IN')}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${txn.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                    {txn.status}
                  </span>
                </div>
                <p className="text-gray-500 font-medium">User: {txn.user.firstName} {txn.user.lastName} ({txn.user.email})</p>
                <p className="text-[10px] text-gray-400">{new Date(txn.createdAt).toLocaleString()}</p>
              </div>

              {txn.status === 'SUCCESS' && (
                <button
                  onClick={() => handleProcessRefund(txn.id)}
                  className="bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 px-3.5 py-1.5 rounded-lg font-bold flex items-center space-x-1 shrink-0"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Issue Refund</span>
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
