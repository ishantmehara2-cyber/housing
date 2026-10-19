import React, { useEffect, useState } from 'react';
import { PropertySearchSummary } from '@housing-clone/shared';
import { recentlyViewedService } from '../services/recentlyViewedService';
import { PropertyCard } from '../components/property/PropertyCard';
import { Clock, Trash2, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const RecentlyViewedPage: React.FC = () => {
  const [history, setHistory] = useState<PropertySearchSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = () => {
    setLoading(true);
    recentlyViewedService
      .getUserHistory()
      .then((data) => setHistory(data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleClearAll = async () => {
    if (!confirm('Are you sure you want to clear your browsing history?')) return;
    try {
      await recentlyViewedService.clearHistory();
      setHistory([]);
    } catch {
      alert('Failed to clear browsing history');
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-brand-50 text-brand-primary rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-brand-primary" />
            </div>
            <div>
              <h1 className="text-xl font-black text-gray-900">Recently Viewed Properties</h1>
              <p className="text-xs text-gray-500 font-medium">Your recent real-estate property browsing history ({history.length})</p>
            </div>
          </div>

          {history.length > 0 && (
            <button
              onClick={handleClearAll}
              className="text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 border border-red-200 px-3.5 py-2 rounded-xl flex items-center space-x-1.5 transition"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear History</span>
            </button>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-72 bg-gray-200 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : history.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center space-y-4">
            <Building2 className="w-12 h-12 text-gray-300 mx-auto" />
            <h2 className="text-lg font-bold text-gray-900">No recently viewed properties</h2>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Properties you view while signed in will appear here so you can easily return to them.
            </p>
            <Link
              to="/search"
              className="inline-block bg-brand-primary text-white px-6 py-2.5 rounded-xl font-bold text-xs hover:bg-brand-hover transition shadow-sm"
            >
              Browse Properties
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {history.map((prop) => (
              <PropertyCard key={prop.id} property={prop} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
