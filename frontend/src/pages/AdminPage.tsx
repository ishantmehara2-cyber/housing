import React, { useEffect, useState } from 'react';
import { adminService, AdminOverviewMetrics } from '../services/adminService';
import { Building2, Users, Flag, ShieldCheck, FileText } from 'lucide-react';

export const AdminPage: React.FC = () => {
  const [metrics, setMetrics] = useState<AdminOverviewMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService
      .getOverviewMetrics()
      .then((data) => setMetrics(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading || !metrics) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 animate-pulse">
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className="h-28 bg-gray-200 rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase">Users</span>
            <Users className="w-5 h-5 text-brand-primary" />
          </div>
          <p className="text-2xl font-black text-gray-900">{metrics.userCounts.total}</p>
          <p className="text-[11px] text-gray-500 font-semibold">{metrics.userCounts.suspended} Suspended</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase">Pending Approvals</span>
            <Building2 className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-600">{metrics.propertyCounts.pendingApproval}</p>
          <p className="text-[11px] text-gray-500 font-medium">{metrics.propertyCounts.active} Active Listings</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase">Pending Verifications</span>
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-600">{metrics.propertyCounts.pendingVerification}</p>
          <p className="text-[11px] text-gray-500 font-medium">Awaiting Queue</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase">User Reports</span>
            <Flag className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-2xl font-black text-red-600">{metrics.reportCounts.pending}</p>
          <p className="text-[11px] text-gray-500 font-medium">{metrics.reportCounts.total} Total Reports</p>
        </div>
      </div>

      {/* Audit Activity Feed */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center space-x-2">
          <FileText className="w-5 h-5 text-brand-primary" />
          <span>System Audit Log Activity</span>
        </h2>

        {metrics.recentAuditLogs.length === 0 ? (
          <p className="text-xs text-gray-400 font-medium text-center py-4">No recent audit activity</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {metrics.recentAuditLogs.map((log) => (
              <div key={log.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-gray-900 uppercase bg-gray-100 px-2 py-0.5 rounded text-[10px] mr-2">
                    {log.action}
                  </span>
                  <span className="text-gray-600">Entity: {log.entity}</span>
                </div>
                <span className="text-[11px] text-gray-400 font-mono">
                  {new Date(log.createdAt).toLocaleDateString()} {new Date(log.createdAt).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
