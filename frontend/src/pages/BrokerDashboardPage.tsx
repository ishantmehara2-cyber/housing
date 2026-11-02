import React, { useEffect, useState } from 'react';
import { brokerService } from '../services/brokerService';
import { Building2, Users, Calendar, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DashboardMetricsData {
  metrics: {
    totalProperties: number;
    activeProperties: number;
    pendingProperties: number;
    rejectedProperties: number;
    totalLeads: number;
    newLeads: number;
    totalVisits: number;
    upcomingVisitsCount: number;
    completedVisitsCount: number;
  };
  recentLeads: Array<{
    id: string;
    status: string;
    enquiry?: { name?: string };
    property?: { title?: string };
  }>;
  upcomingVisits: Array<{
    id: string;
    scheduledDate: string;
    timeSlot: string;
    requester?: { firstName?: string; lastName?: string };
    property?: { title?: string };
  }>;
}

export const BrokerDashboardPage: React.FC = () => {
  const [data, setData] = useState<DashboardMetricsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    brokerService
      .getBrokerDashboardMetrics()
      .then((res) => setData(res as DashboardMetricsData))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 animate-pulse">
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className="h-28 bg-gray-200 rounded-2xl" />
        ))}
      </div>
    );
  }

  const m = data?.metrics || {
    totalProperties: 0,
    activeProperties: 0,
    pendingProperties: 0,
    totalLeads: 0,
    newLeads: 0,
    totalVisits: 0,
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div>
          <h1 className="text-xl font-black text-gray-900">Broker Portal Overview</h1>
          <p className="text-xs text-gray-500 font-medium">Real-time stats for your listed properties, buyer leads, and scheduled visits</p>
        </div>

        <Link
          to="/post-property"
          className="bg-brand-primary hover:bg-brand-hover text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm"
        >
          + Post New Property
        </Link>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase">Active Properties</span>
            <Building2 className="w-5 h-5 text-brand-primary" />
          </div>
          <p className="text-2xl font-black text-gray-900">{m.activeProperties}</p>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase">Total Leads</span>
            <Users className="w-5 h-5 text-brand-primary" />
          </div>
          <p className="text-2xl font-black text-gray-900">{m.totalLeads}</p>
          <p className="text-[10px] text-emerald-600 font-bold">{m.newLeads} new leads</p>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase">Pending Approval</span>
            <AlertCircle className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-gray-900">{m.pendingProperties}</p>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase">Visits Booked</span>
            <Calendar className="w-5 h-5 text-brand-primary" />
          </div>
          <p className="text-2xl font-black text-gray-900">{m.totalVisits}</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        <div className="space-y-3">
          <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-2">Recent Buyer Leads</h2>
          {data?.recentLeads?.length === 0 ? (
            <p className="text-xs text-gray-400 font-medium py-4">No recent leads received</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {data?.recentLeads?.map((l) => (
                <div key={l.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-gray-900">{l.enquiry?.name || 'Buyer Lead'}</p>
                    <p className="text-[11px] text-gray-400">{l.property?.title}</p>
                  </div>
                  <span className="bg-emerald-50 text-emerald-700 font-bold text-[10px] px-2 py-0.5 rounded uppercase">
                    {l.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-2">Upcoming Property Visits</h2>
          {data?.upcomingVisits?.length === 0 ? (
            <p className="text-xs text-gray-400 font-medium py-4">No upcoming visits scheduled</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {data?.upcomingVisits?.map((v) => (
                <div key={v.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-gray-900">{v.requester?.firstName} {v.requester?.lastName}</p>
                    <p className="text-[11px] text-gray-400">{v.property?.title}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-brand-primary">{new Date(v.scheduledDate).toLocaleDateString()}</p>
                    <p className="text-[10px] text-gray-400">{v.timeSlot}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
