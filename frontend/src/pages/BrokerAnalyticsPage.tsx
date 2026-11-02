import React, { useEffect, useState } from 'react';
import { brokerService } from '../services/brokerService';
import { BarChart3, Users, Calendar, Building2, TrendingUp } from 'lucide-react';

interface AnalyticsMetricsData {
  metrics: {
    totalProperties: number;
    activeProperties: number;
    totalLeads: number;
    newLeads: number;
    totalVisits: number;
    upcomingVisitsCount: number;
    completedVisitsCount: number;
  };
}

export const BrokerAnalyticsPage: React.FC = () => {
  const [data, setData] = useState<AnalyticsMetricsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    brokerService
      .getBrokerDashboardMetrics()
      .then((res) => setData(res as AnalyticsMetricsData))
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
    totalLeads: 0,
    newLeads: 0,
    totalVisits: 0,
    upcomingVisitsCount: 0,
    completedVisitsCount: 0,
  };

  const conversionRate = m.totalLeads > 0 ? ((m.completedVisitsCount / m.totalLeads) * 100).toFixed(1) : '0.0';

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div>
          <h1 className="text-xl font-black text-gray-900">Broker Business Analytics</h1>
          <p className="text-xs text-gray-500 font-medium">Real-time performance metrics and buyer engagement analytics</p>
        </div>
      </div>

      {/* Analytics KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase">Active Listings</span>
            <Building2 className="w-5 h-5 text-brand-primary" />
          </div>
          <p className="text-2xl font-black text-gray-900">{m.activeProperties}</p>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase">Total Buyer Leads</span>
            <Users className="w-5 h-5 text-brand-primary" />
          </div>
          <p className="text-2xl font-black text-gray-900">{m.totalLeads}</p>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase">Site Visits</span>
            <Calendar className="w-5 h-5 text-brand-primary" />
          </div>
          <p className="text-2xl font-black text-gray-900">{m.totalVisits}</p>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase">Visit Conversion</span>
            <TrendingUp className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-700">{conversionRate}%</p>
        </div>
      </div>

      {/* Analytics Performance Summary */}
      <div className="p-5 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-2xl space-y-2">
        <div className="flex items-center space-x-2">
          <BarChart3 className="w-5 h-5 text-brand-primary" />
          <h2 className="text-base font-bold">Business Growth Summary</h2>
        </div>
        <p className="text-xs text-gray-300">
          Your active agency profile currently manages <strong className="text-white">{m.totalProperties} total listings</strong>, with <strong className="text-white">{m.newLeads} new leads</strong> awaiting response.
        </p>
      </div>
    </div>
  );
};
