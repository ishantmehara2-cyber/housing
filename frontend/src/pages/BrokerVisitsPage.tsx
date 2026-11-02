import React, { useEffect, useState } from 'react';
import { brokerService } from '../services/brokerService';
import { Calendar, Check, X } from 'lucide-react';

interface VisitRecordItem {
  id: string;
  scheduledDate: string;
  timeSlot: string;
  status: string;
  requester?: { firstName?: string; lastName?: string };
  property?: { title?: string };
}

export const BrokerVisitsPage: React.FC = () => {
  const [visits, setVisits] = useState<VisitRecordItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVisits = () => {
    setLoading(true);
    brokerService
      .getMyBrokerVisits()
      .then((res) => setVisits(Array.isArray(res) ? (res as VisitRecordItem[]) : []))
      .catch(() => setVisits([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchVisits();
  }, []);

  const handleUpdateStatus = async (visitId: string, status: string) => {
    try {
      await brokerService.updateBrokerVisitStatus(visitId, status);
      fetchVisits();
    } catch {
      alert('Failed to update visit status');
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div>
          <h1 className="text-xl font-black text-gray-900">Property Visit Requests</h1>
          <p className="text-xs text-gray-500 font-medium">Scheduled buyer site visits for your property listings</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((n) => (
            <div key={n} className="h-20 bg-gray-200 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : visits.length === 0 ? (
        <div className="p-12 text-center text-gray-400 space-y-2">
          <Calendar className="w-12 h-12 mx-auto opacity-40 text-brand-primary" />
          <p className="text-xs font-bold">No property visits scheduled</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {visits.map((v) => (
            <div key={v.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-gray-900">{v.requester?.firstName} {v.requester?.lastName}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${v.status === 'SCHEDULED' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
                    {v.status}
                  </span>
                </div>
                <p className="text-gray-500 font-medium">Property: {v.property?.title}</p>
                <p className="text-brand-primary font-bold">{new Date(v.scheduledDate).toLocaleDateString()} — {v.timeSlot}</p>
              </div>

              {v.status === 'SCHEDULED' && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleUpdateStatus(v.id, 'COMPLETED')}
                    className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Complete</span>
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(v.id, 'CANCELLED')}
                    className="bg-red-50 text-red-700 border border-red-200 px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Cancel</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
