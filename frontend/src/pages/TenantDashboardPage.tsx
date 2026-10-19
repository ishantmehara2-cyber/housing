import React, { useEffect, useState } from 'react';
import { dashboardService, DashboardOverviewMetrics } from '../services/dashboardService';
import { Building2, Users, Calendar, Bell, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const TenantDashboardPage: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardOverviewMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardService
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
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase">Properties</span>
            <Building2 className="w-5 h-5 text-brand-primary" />
          </div>
          <p className="text-2xl font-black text-gray-900">{metrics.propertyCounts.total}</p>
          <p className="text-[11px] text-emerald-600 font-semibold">{metrics.propertyCounts.active} Active Listings</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase">Total Leads</span>
            <Users className="w-5 h-5 text-brand-primary" />
          </div>
          <p className="text-2xl font-black text-gray-900">{metrics.leadCounts.total}</p>
          <p className="text-[11px] text-brand-primary font-semibold">{metrics.leadCounts.newLeads} New Enquiries</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase">Upcoming Visits</span>
            <Calendar className="w-5 h-5 text-brand-primary" />
          </div>
          <p className="text-2xl font-black text-gray-900">{metrics.visitCounts.upcoming}</p>
          <p className="text-[11px] text-gray-500 font-medium">{metrics.visitCounts.total} Total Requests</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase">Unread Alerts</span>
            <Bell className="w-5 h-5 text-brand-primary" />
          </div>
          <p className="text-2xl font-black text-gray-900">{metrics.unreadNotifications}</p>
          <Link to="/notifications" className="text-[11px] text-brand-primary font-bold hover:underline">
            View Notifications
          </Link>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">Recent Enquiries & Leads</h2>

        {metrics.recentActivity.leads.length === 0 ? (
          <p className="text-xs text-gray-400 font-medium py-4 text-center">No recent lead activity</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {metrics.recentActivity.leads.map((lead) => (
              <div key={lead.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-gray-900">{lead.property.title}</p>
                  <p className="text-[11px] text-gray-400">Created: {new Date(lead.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="bg-brand-50 text-brand-primary px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px]">
                    {lead.status}
                  </span>
                  <Link to="/dashboard/leads" className="text-gray-400 hover:text-brand-primary">
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
