import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardService } from '../services/dashboardService';
import { PropertySearchSummary } from '@housing-clone/shared';
import { Building2, Edit2, Pause, Play, PlusCircle } from 'lucide-react';

export const OwnerDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<PropertySearchSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('');

  const fetchProperties = () => {
    setLoading(true);
    dashboardService
      .getManagedProperties(1, 20, filterStatus || undefined)
      .then((res) => setProperties(res.items as PropertySearchSummary[]))
      .catch(() => setProperties([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProperties();
  }, [filterStatus]);

  const handleTogglePause = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    try {
      await dashboardService.updatePropertyListingStatus(id, newStatus);
      fetchProperties();
    } catch {
      alert('Failed to update listing status');
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div>
          <h1 className="text-xl font-black text-gray-900">Property Listing Management</h1>
          <p className="text-xs text-gray-500 font-medium">Manage, edit, or pause your active property listings</p>
        </div>

        <button
          onClick={() => navigate('/post-property')}
          className="bg-brand-primary hover:bg-brand-hover text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Post New Property</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 border-b border-gray-100 pb-2">
        {['', 'ACTIVE', 'PENDING_APPROVAL', 'PAUSED', 'DRAFT'].map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              filterStatus === st
                ? 'bg-brand-primary text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {st || 'ALL'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-20 bg-gray-200 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : properties.length === 0 ? (
        <div className="p-8 text-center text-gray-400 space-y-2">
          <Building2 className="w-10 h-10 mx-auto opacity-40" />
          <p className="text-xs font-bold">No properties found matching status filter</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {properties.map((p) => (
            <div key={p.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
              <div className="flex items-center space-x-3">
                <img
                  src={p.primaryImage?.url || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=200&q=80'}
                  alt={p.title}
                  className="w-16 h-12 object-cover rounded-lg border border-gray-200"
                />
                <div>
                  <p className="font-bold text-gray-900 line-clamp-1">{p.title}</p>
                  <p className="text-gray-500 font-medium">{p.locality.name}, {p.city.name}</p>
                  <span className="text-[10px] font-bold uppercase text-brand-primary bg-brand-50 px-2 py-0.5 rounded mt-1 inline-block">
                    {p.listingState}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <button
                  onClick={() => navigate(`/post-property/${p.id}/edit`)}
                  className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>

                {p.listingState === 'ACTIVE' && (
                  <button
                    onClick={() => handleTogglePause(p.id, p.listingState)}
                    className="bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1"
                  >
                    <Pause className="w-3.5 h-3.5" />
                    <span>Pause</span>
                  </button>
                )}

                {p.listingState === 'PAUSED' && (
                  <button
                    onClick={() => handleTogglePause(p.id, p.listingState)}
                    className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Resume</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
