import React from 'react';
import { AmenitySummary } from '@housing-clone/shared';
import { Check, Sparkles } from 'lucide-react';

interface PropertyAmenitiesProps {
  amenities: AmenitySummary[];
}

export const PropertyAmenities: React.FC<PropertyAmenitiesProps> = ({ amenities }) => {
  if (amenities.length === 0) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
      <div className="flex items-center space-x-2 border-b border-gray-100 pb-3">
        <Sparkles className="w-5 h-5 text-brand-primary" />
        <h2 className="text-lg font-bold text-gray-900">Property Amenities ({amenities.length})</h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {amenities.map((amenity) => (
          <div
            key={amenity.id}
            className="p-3 bg-gray-50 border border-gray-100 rounded-xl flex items-center space-x-2.5"
          >
            <div className="w-6 h-6 rounded-md bg-brand-50 text-brand-primary flex items-center justify-center shrink-0">
              <Check className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold text-gray-800 truncate">{amenity.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
