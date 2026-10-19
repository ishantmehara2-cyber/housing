import React, { useEffect, useState } from 'react';
import { brokerService } from '../services/brokerService';
import { PropertyCard } from '../components/property/PropertyCard';
import { PropertySearchSummary } from '@housing-clone/shared';
import { Plus, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const BrokerPropertiesPage: React.FC = () => {
  const [properties, setProperties] = useState<PropertySearchSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    brokerService
      .getMyBrokerProperties()
      .then((res) => setProperties(res))
      .catch(() => setProperties([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div>
          <h1 className="text-xl font-black text-gray-900">My Managed Properties</h1>
          <p className="text-xs text-gray-500 font-medium">Listings associated with your broker partner account</p>
        </div>

        <Link
          to="/post-property"
          className="bg-brand-primary hover:bg-brand-hover text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Add Property</span>
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[1, 2].map((n) => (
            <div key={n} className="h-64 bg-gray-200 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : properties.length === 0 ? (
        <div className="p-12 text-center text-gray-400 space-y-2">
          <Building2 className="w-12 h-12 mx-auto opacity-40 text-brand-primary" />
          <p className="text-xs font-bold">You currently have no listed properties</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {properties.map((prop) => (
            <PropertyCard key={prop.id} property={prop} />
          ))}
        </div>
      )}
    </div>
  );
};
