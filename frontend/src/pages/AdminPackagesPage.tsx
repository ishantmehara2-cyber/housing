import React, { useEffect, useState } from 'react';
import { PackageRecord } from '../services/paymentService';
import { Plus, Power } from 'lucide-react';
import { apiClient } from '../services/apiClient';

export const AdminPackagesPage: React.FC = () => {
  const [packages, setPackages] = useState<PackageRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // New package modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('4999');
  const [validityDays, setValidityDays] = useState('30');
  const [maxListings, setMaxListings] = useState('5');
  const [featuredListingsCount, setFeaturedListingsCount] = useState('1');

  const fetchPackages = () => {
    setLoading(true);
    apiClient
      .get('/admin/packages')
      .then((res) => setPackages(res.data.data || []))
      .catch(() => setPackages([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await apiClient.patch(`/admin/packages/${id}`, { isActive: !currentStatus });
      fetchPackages();
    } catch {
      alert('Failed to update package status');
    }
  };

  const handleCreatePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/admin/packages', {
        name,
        price: Number(price),
        validityDays: Number(validityDays),
        maxListings: Number(maxListings),
        featuredListingsCount: Number(featuredListingsCount),
      });
      setCreateModalOpen(false);
      fetchPackages();
    } catch {
      alert('Failed to create package');
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div>
          <h1 className="text-xl font-black text-gray-900">Monetization Package Catalog</h1>
          <p className="text-xs text-gray-500 font-medium">Create and configure seller subscription plans</p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="bg-brand-primary hover:bg-brand-hover text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>New Package</span>
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((n) => (
            <div key={n} className="h-20 bg-gray-200 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {packages.map((pkg) => (
            <div key={pkg.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-gray-900">{pkg.name}</h3>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${pkg.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                    {pkg.isActive ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </div>
                <p className="text-gray-500 font-medium">₹ {pkg.price.toLocaleString('en-IN')} — {pkg.maxListings} Listings ({pkg.featuredListingsCount} Featured Boosts) for {pkg.validityDays} Days</p>
              </div>

              <button
                onClick={() => handleToggleActive(pkg.id, pkg.isActive)}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1 shrink-0 ${
                  pkg.isActive ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}
              >
                <Power className="w-3.5 h-3.5" />
                <span>{pkg.isActive ? 'Deactivate' : 'Activate'}</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h2 className="text-base font-bold text-gray-900">Create Monetization Package</h2>
            <form onSubmit={handleCreatePackage} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Package Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Premium Seller Plan"
                  className="w-full p-2 border border-gray-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Validity (Days)</label>
                  <input
                    type="number"
                    required
                    value={validityDays}
                    onChange={(e) => setValidityDays(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Max Listings</label>
                  <input
                    type="number"
                    required
                    value={maxListings}
                    onChange={(e) => setMaxListings(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Featured Boosts</label>
                  <input
                    type="number"
                    required
                    value={featuredListingsCount}
                    onChange={(e) => setFeaturedListingsCount(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 font-bold"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-brand-primary text-white font-bold rounded-xl">
                  Create Package
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
