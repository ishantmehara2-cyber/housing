import React, { useEffect, useState } from 'react';
import { adminService } from '../services/adminService';
import { Building2, Check, X, ShieldAlert } from 'lucide-react';

interface PropertyItem {
  id: string;
  title: string;
  listingPurpose: string;
  listingState: string;
  verificationState: string;
  owner: { firstName: string; lastName: string; email: string };
  city: { name: string };
  locality: { name: string };
  createdAt: string;
}

export const AdminPropertiesPage: React.FC = () => {
  const [properties, setProperties] = useState<PropertyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [listingFilter, setListingFilter] = useState('PENDING_APPROVAL');

  // Rejection modal
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedPropId, setSelectedPropId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('Incomplete or invalid property details');

  const fetchProperties = () => {
    setLoading(true);
    adminService
      .getProperties(1, 20, listingFilter || undefined)
      .then((res) => setProperties(res.items as PropertyItem[]))
      .catch(() => setProperties([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProperties();
  }, [listingFilter]);

  const handleApprove = async (id: string) => {
    try {
      await adminService.updatePropertyStatus(id, 'ACTIVE');
      fetchProperties();
    } catch {
      alert('Failed to approve property');
    }
  };

  const handleConfirmReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPropId) return;

    try {
      await adminService.updatePropertyStatus(selectedPropId, 'REJECTED', rejectionReason);
      setRejectModalOpen(false);
      setSelectedPropId(null);
      fetchProperties();
    } catch {
      alert('Failed to reject property');
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div>
          <h1 className="text-xl font-black text-gray-900">Property Moderation Portal</h1>
          <p className="text-xs text-gray-500 font-medium">Review pending property submissions before publishing</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 border-b border-gray-100 pb-2">
        {['PENDING_APPROVAL', 'ACTIVE', 'REJECTED', ''].map((st) => (
          <button
            key={st}
            onClick={() => setListingFilter(st)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              listingFilter === st ? 'bg-brand-primary text-white' : 'text-gray-600 hover:bg-gray-100'
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
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-gray-900">{p.title}</h3>
                  <span className="bg-brand-50 text-brand-primary font-bold px-2 py-0.5 rounded uppercase text-[10px]">
                    {p.listingState}
                  </span>
                </div>
                <p className="text-gray-500 font-medium">
                  {p.locality.name}, {p.city.name} — Owner: {p.owner.firstName} {p.owner.lastName} ({p.owner.email})
                </p>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                {p.listingState === 'PENDING_APPROVAL' && (
                  <>
                    <button
                      onClick={() => handleApprove(p.id)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-lg font-bold flex items-center space-x-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedPropId(p.id);
                        setRejectModalOpen(true);
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white px-3.5 py-1.5 rounded-lg font-bold flex items-center space-x-1"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rejection Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-5 h-5 text-red-600" />
              <h2 className="text-base font-bold text-gray-900">Reject Property Listing</h2>
            </div>

            <form onSubmit={handleConfirmReject} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Rejection Reason *</label>
                <textarea
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-bold text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
