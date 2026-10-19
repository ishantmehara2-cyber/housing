import React, { useEffect, useState } from 'react';
import { PropertySearchSummary, ListingPurpose } from '@housing-clone/shared';
import { searchService } from '../../services/searchService';
import { PropertyCard } from './PropertyCard';
import { Building2 } from 'lucide-react';

interface SimilarPropertiesProps {
  currentPropertyId: string;
  citySlug: string;
  listingPurpose: ListingPurpose;
}

export const SimilarProperties: React.FC<SimilarPropertiesProps> = ({
  currentPropertyId,
  citySlug,
  listingPurpose,
}) => {
  const [similarProperties, setSimilarProperties] = useState<PropertySearchSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    searchService
      .searchProperties({
        city: citySlug,
        listingPurpose,
        limit: 4,
      })
      .then((res) => {
        // Exclude current property
        const filtered = res.items.filter((p) => p.id !== currentPropertyId).slice(0, 3);
        setSimilarProperties(filtered);
      })
      .catch(() => setSimilarProperties([]))
      .finally(() => setLoading(false));
  }, [currentPropertyId, citySlug, listingPurpose]);

  if (!loading && similarProperties.length === 0) return null;

  return (
    <div className="space-y-4 pt-6">
      <div className="flex items-center space-x-2">
        <Building2 className="w-5 h-5 text-brand-primary" />
        <h2 className="text-xl font-black text-gray-900">Similar Properties You May Like</h2>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-64 bg-gray-200 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {similarProperties.map((prop) => (
            <PropertyCard key={prop.id} property={prop} />
          ))}
        </div>
      )}
    </div>
  );
};
