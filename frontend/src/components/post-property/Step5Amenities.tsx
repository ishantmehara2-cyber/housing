import React, { useEffect, useState } from 'react';
import { AmenitySummary } from '@housing-clone/shared';
import { amenityService } from '../../services/amenityService';
import { Check } from 'lucide-react';

interface Step5AmenitiesProps {
  selectedAmenityIds: string[];
  onChange: (amenityIds: string[]) => void;
}

export const Step5Amenities: React.FC<Step5AmenitiesProps> = ({ selectedAmenityIds, onChange }) => {
  const [amenities, setAmenities] = useState<AmenitySummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    amenityService
      .getAmenities()
      .then((data) => setAmenities(data))
      .finally(() => setLoading(false));
  }, []);

  const toggleAmenity = (id: string) => {
    if (selectedAmenityIds.includes(id)) {
      onChange(selectedAmenityIds.filter((item) => item !== id));
    } else {
      onChange([...selectedAmenityIds, id]);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">Select Property Amenities</h2>
        <p className="text-sm text-gray-500">Highlight key features to attract buyers and tenants</p>
      </div>

      {loading ? (
        <div className="p-8 text-center text-gray-400 text-sm">Loading amenities...</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {amenities.map((amenity) => {
            const isSelected = selectedAmenityIds.includes(amenity.id);

            return (
              <button
                key={amenity.id}
                type="button"
                onClick={() => toggleAmenity(amenity.id)}
                className={`p-3 rounded-xl border text-left flex items-center justify-between transition ${
                  isSelected
                    ? 'border-brand-primary bg-brand-50 text-brand-primary font-bold shadow-sm'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700 bg-white'
                }`}
              >
                <span className="text-sm truncate">{amenity.name}</span>
                <div
                  className={`w-5 h-5 rounded-md flex items-center justify-center border transition ${
                    isSelected ? 'bg-brand-primary border-brand-primary text-white' : 'border-gray-300'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5" />}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
