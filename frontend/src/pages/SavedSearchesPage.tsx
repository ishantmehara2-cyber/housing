import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { savedSearchService, SavedSearchRecord } from '../services/savedSearchService';
import { Bookmark, Search, Trash2, Bell, ExternalLink, Calendar } from 'lucide-react';

export const SavedSearchesPage: React.FC = () => {
  const navigate = useNavigate();
  const [savedSearches, setSavedSearches] = useState<SavedSearchRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSavedSearches = () => {
    setLoading(true);
    savedSearchService
      .getUserSavedSearches()
      .then((data) => setSavedSearches(data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSavedSearches();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this saved search?')) return;
    try {
      await savedSearchService.deleteSavedSearch(id);
      setSavedSearches((prev) => prev.filter((s) => s.id !== id));
    } catch {
      alert('Failed to delete saved search');
    }
  };

  const handleOpenSearch = (criteria: Record<string, unknown>) => {
    const params = new URLSearchParams();
    Object.entries(criteria).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        params.set(key, String(val));
      }
    });
    navigate(`/search?${params.toString()}`);
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-brand-50 text-brand-primary rounded-xl flex items-center justify-center">
              <Bookmark className="w-5 h-5 text-brand-primary" />
            </div>
            <div>
              <h1 className="text-xl font-black text-gray-900">Saved Searches</h1>
              <p className="text-xs text-gray-500 font-medium">Reconstruct your search filters in one click ({savedSearches.length})</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-24 bg-gray-200 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : savedSearches.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center space-y-4">
            <Search className="w-12 h-12 text-gray-300 mx-auto" />
            <h2 className="text-lg font-bold text-gray-900">No saved searches yet</h2>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Perform a search on the marketplace and click "Save Search" to quickly rerun it anytime.
            </p>
            <Link
              to="/search"
              className="inline-block bg-brand-primary text-white px-6 py-2.5 rounded-xl font-bold text-xs hover:bg-brand-hover transition shadow-sm"
            >
              Start Searching Properties
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {savedSearches.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:border-gray-300 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-gray-900 text-sm">{item.name}</h3>
                    {item.enableAlerts && (
                      <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1 border border-emerald-200">
                        <Bell className="w-3 h-3 text-emerald-600" />
                        <span>Alerts On</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    <span>Saved on {new Date(item.createdAt).toLocaleDateString()}</span>
                  </p>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleOpenSearch(item.searchCriteria)}
                    className="bg-brand-primary hover:bg-brand-hover text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition shadow-sm"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open Search</span>
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition"
                    title="Delete saved search"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
