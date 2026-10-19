import React, { useEffect, useState } from 'react';
import { adminService } from '../services/adminService';
import { Flag, Check, X } from 'lucide-react';

interface ReportItem {
  id: string;
  reason: string;
  description?: string;
  status: string;
  createdAt: string;
  reporter: { firstName: string; lastName: string; email: string };
  property?: { title: string };
}

export const AdminReportsPage: React.FC = () => {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = () => {
    setLoading(true);
    adminService
      .getReports()
      .then((res) => setReports(res.items as ReportItem[]))
      .catch(() => setReports([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleResolve = async (id: string, status: 'RESOLVED' | 'DISMISSED') => {
    try {
      await adminService.updateReportStatus(id, status, 'Resolved by Moderation Team');
      fetchReports();
    } catch {
      alert('Failed to update report status');
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div>
          <h1 className="text-xl font-black text-gray-900">User Report Handling</h1>
          <p className="text-xs text-gray-500 font-medium">Investigate reported listings and abusive behavior</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((n) => (
            <div key={n} className="h-20 bg-gray-200 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : reports.length === 0 ? (
        <div className="p-8 text-center text-gray-400 space-y-2">
          <Flag className="w-10 h-10 mx-auto opacity-40 text-red-500" />
          <p className="text-xs font-bold">No user reports currently pending</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {reports.map((r) => (
            <div key={r.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-gray-900">Reason: {r.reason}</span>
                  <span className="bg-red-50 text-red-700 font-bold px-2 py-0.5 rounded text-[10px] uppercase">
                    {r.status}
                  </span>
                </div>
                {r.property && <p className="text-gray-600 font-medium">Target Property: {r.property.title}</p>}
                <p className="text-gray-400">Reporter: {r.reporter.firstName} {r.reporter.lastName} ({r.reporter.email})</p>
              </div>

              {r.status === 'PENDING' && (
                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => handleResolve(r.id, 'RESOLVED')}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-lg font-bold flex items-center space-x-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Resolve</span>
                  </button>
                  <button
                    onClick={() => handleResolve(r.id, 'DISMISSED')}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3.5 py-1.5 rounded-lg font-bold flex items-center space-x-1"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Dismiss</span>
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
