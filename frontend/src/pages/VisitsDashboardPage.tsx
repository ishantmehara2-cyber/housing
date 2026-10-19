import React, { useEffect, useState } from 'react';
import { visitService, PropertyVisitRecord } from '../services/visitService';
import { Calendar, CheckCircle, XCircle } from 'lucide-react';
import { VisitStatus } from '@housing-clone/shared';

export const VisitsDashboardPage: React.FC = () => {
  const [visits, setVisits] = useState<PropertyVisitRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVisits = () => {
    setLoading(true);
    visitService
      .getUserVisits()
      .then((data) => setVisits(data))
      .catch(() => setVisits([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchVisits();
  }, []);

  const handleUpdateStatus = async (id: string, status: VisitStatus) => {
    try {
      await visitService.updateVisitStatus(id, status);
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
          <p className="text-xs text-gray-500 font-medium">Manage and confirm buyer site-visit appointments</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-20 bg-gray-200 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : visits.length === 0 ? (
        <div className="p-8 text-center text-gray-400 space-y-2">
          <Calendar className="w-10 h-10 mx-auto opacity-40" />
          <p className="text-xs font-bold">No visit requests scheduled</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {visits.map((v) => (
            <div key={v.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
              <div className="space-y-1">
                <p className="font-bold text-gray-900">{v.property.title}</p>
                <p className="text-gray-600 font-medium">
                  Scheduled for: <span className="font-bold text-brand-primary">{new Date(v.scheduledDate).toLocaleDateString()}</span> ({v.timeSlot})
                </p>
                <span className="text-[10px] font-bold uppercase bg-gray-100 text-gray-700 px-2 py-0.5 rounded inline-block">
                  Status: {v.status}
                </span>
              </div>

              {v.status === 'SCHEDULED' && (
                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => handleUpdateStatus(v.id, VisitStatus.COMPLETED)}
                    className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Complete</span>
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(v.id, VisitStatus.CANCELLED)}
                    className="bg-red-50 text-red-700 border border-red-200 px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1"
                  >
                    <XCircle className="w-3.5 h-3.5" />
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
