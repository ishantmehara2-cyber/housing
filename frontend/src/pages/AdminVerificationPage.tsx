import React, { useEffect, useState } from 'react';
import { adminService } from '../services/adminService';
import { ShieldCheck, Check, X } from 'lucide-react';

interface VerificationItem {
  id: string;
  title: string;
  verificationState: string;
  locality: { name: string };
  city: { name: string };
  owner: { firstName: string; lastName: string };
}

export const AdminVerificationPage: React.FC = () => {
  const [queue, setQueue] = useState<VerificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQueue = () => {
    setLoading(true);
    adminService
      .getVerificationQueue()
      .then((res) => setQueue(res.items as VerificationItem[]))
      .catch(() => setQueue([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleVerification = async (id: string, state: 'VERIFIED' | 'REJECTED') => {
    try {
      await adminService.updateVerificationState(id, state, 'Verified by Admin Team');
      fetchQueue();
    } catch {
      alert('Failed to update verification state');
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div>
          <h1 className="text-xl font-black text-gray-900">Property Verification Queue</h1>
          <p className="text-xs text-gray-500 font-medium">Verify property documents and assign verified badges</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((n) => (
            <div key={n} className="h-20 bg-gray-200 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : queue.length === 0 ? (
        <div className="p-8 text-center text-gray-400 space-y-2">
          <ShieldCheck className="w-10 h-10 mx-auto opacity-40 text-emerald-600" />
          <p className="text-xs font-bold">No properties currently pending verification</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {queue.map((p) => (
            <div key={p.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
              <div>
                <h3 className="font-bold text-gray-900">{p.title}</h3>
                <p className="text-gray-500 font-medium">{p.locality.name}, {p.city.name} — Owner: {p.owner.firstName} {p.owner.lastName}</p>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <button
                  onClick={() => handleVerification(p.id, 'VERIFIED')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-lg font-bold flex items-center space-x-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Verify</span>
                </button>
                <button
                  onClick={() => handleVerification(p.id, 'REJECTED')}
                  className="bg-red-600 hover:bg-red-700 text-white px-3.5 py-1.5 rounded-lg font-bold flex items-center space-x-1"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Reject</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
