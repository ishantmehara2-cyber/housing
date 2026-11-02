/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useCallback } from 'react';
import { adminService } from '../services/adminService';
import { PropertyCategory } from '@housing-clone/shared';
import { Sliders, Plus } from 'lucide-react';

export const AdminPropertyTypesPage: React.FC = () => {
  const [types, setTypes] = useState<unknown[]>([]);
  const [amenities, setAmenities] = useState<unknown[]>([]);

  // Add Property Type Modal
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [typeName, setTypeName] = useState('');
  const [typeSlug, setTypeSlug] = useState('');

  // Add Amenity Modal
  const [showAmenityModal, setShowAmenityModal] = useState(false);
  const [amenityName, setAmenityName] = useState('');
  const [amenitySlug, setAmenitySlug] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [tData, aData] = await Promise.all([
        adminService.getPropertyTypes(),
        adminService.getAmenities(),
      ]);
      setTypes(tData);
      setAmenities(aData);
    } catch {
      // Error
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateType = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await adminService.createPropertyType({
        name: typeName,
        slug: typeSlug || typeName.toLowerCase().replace(/\s+/g, '-'),
        category: PropertyCategory.RESIDENTIAL,
        icon: 'building',
      });
      setShowTypeModal(false);
      setTypeName('');
      setTypeSlug('');
      fetchData();
    } catch {
      // Error
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateAmenity = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await adminService.createAmenity({
        name: amenityName,
        slug: amenitySlug || amenityName.toLowerCase().replace(/\s+/g, '-'),
        category: 'GENERAL',
      });
      setShowAmenityModal(false);
      setAmenityName('');
      setAmenitySlug('');
      fetchData();
    } catch {
      // Error
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <Sliders className="w-6 h-6 text-brand-primary" />
            <span>Property Types & Amenities Taxonomy</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">Configure property categories, types, and standardized feature amenities</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Property Types Column */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Property Types ({types.length})</h2>
            <button
              onClick={() => setShowTypeModal(true)}
              className="bg-brand-primary hover:bg-brand-hover text-white px-3 py-1.5 rounded-lg text-xs font-bold transition inline-flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Type</span>
            </button>
          </div>

          <div className="space-y-2">
            {types.map((t: any) => (
              <div key={t.id} className="p-3 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between">
                <div>
                  <p className="font-bold text-xs text-gray-900">{t.name}</p>
                  <p className="text-[10px] text-gray-400">Category: {t.category} • Slug: {t.slug}</p>
                </div>
                <span className="text-[10px] bg-white px-2 py-0.5 rounded border border-gray-200 font-bold">
                  {t._count?.properties || 0} Properties
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Amenities Column */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Amenities Catalog ({amenities.length})</h2>
            <button
              onClick={() => setShowAmenityModal(true)}
              className="bg-brand-primary hover:bg-brand-hover text-white px-3 py-1.5 rounded-lg text-xs font-bold transition inline-flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Amenity</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {amenities.map((a: any) => (
              <div key={a.id} className="p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 flex items-center justify-between">
                <span>{a.name}</span>
                <span className="text-[10px] text-gray-400 font-normal">{a._count?.properties || 0}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Type Modal */}
      {showTypeModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 max-w-md w-full space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Add Property Type</h2>
            <form onSubmit={handleCreateType} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Type Name</label>
                <input
                  type="text"
                  required
                  value={typeName}
                  onChange={(e) => setTypeName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-xs outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>
              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowTypeModal(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-brand-primary text-white rounded-xl text-xs font-bold"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Amenity Modal */}
      {showAmenityModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 max-w-md w-full space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Add Amenity</h2>
            <form onSubmit={handleCreateAmenity} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Amenity Name</label>
                <input
                  type="text"
                  required
                  value={amenityName}
                  onChange={(e) => setAmenityName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-xs outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>
              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAmenityModal(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-brand-primary text-white rounded-xl text-xs font-bold"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
