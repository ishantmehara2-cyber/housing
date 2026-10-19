import React, { useEffect, useState } from 'react';
import { analyticsService, AdminAnalyticsSummary } from '../services/analyticsService';
import { BarChart3, Eye, Search, MessageSquare, Calendar } from 'lucide-react';

export const AdminAnalyticsPage: React.FC = () => {
  const [summary, setSummary] = useState<AdminAnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsService
      .getAdminAnalyticsSummary()
      .then((data) => setSummary(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading || !summary) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 animate-pulse">
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className="h-28 bg-gray-200 rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div>
          <h1 className="text-xl font-black text-gray-900">Systemwide Product Analytics</h1>
          <p className="text-xs text-gray-500 font-medium">First-party event tracking, search volume, and property views</p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase">Property Views</span>
            <Eye className="w-5 h-5 text-brand-primary" />
          </div>
          <p className="text-2xl font-black text-gray-900">{summary.eventMetrics.propertyViews}</p>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase">Searches</span>
            <Search className="w-5 h-5 text-brand-primary" />
          </div>
          <p className="text-2xl font-black text-gray-900">{summary.eventMetrics.searchesCount}</p>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase">Enquiries</span>
            <MessageSquare className="w-5 h-5 text-brand-primary" />
          </div>
          <p className="text-2xl font-black text-gray-900">{summary.eventMetrics.enquiriesCount}</p>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase">Visits Booked</span>
            <Calendar className="w-5 h-5 text-brand-primary" />
          </div>
          <p className="text-2xl font-black text-gray-900">{summary.eventMetrics.visitsCount}</p>
        </div>
      </div>

      {/* Top Properties Table */}
      <div className="space-y-3 pt-2">
        <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-2 flex items-center space-x-2">
          <BarChart3 className="w-4 h-4 text-brand-primary" />
          <span>Top Viewed Properties</span>
        </h2>

        <div className="divide-y divide-gray-100">
          {summary.topProperties.map((p) => (
            <div key={p.id} className="py-3 flex items-center justify-between text-xs">
              <span className="font-bold text-gray-900 truncate max-w-xs">{p.title}</span>
              <div className="flex items-center space-x-4 text-gray-600 font-semibold shrink-0">
                <span>{p.viewCount} Views</span>
                <span>{p.enquiryCount} Enquiries</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
