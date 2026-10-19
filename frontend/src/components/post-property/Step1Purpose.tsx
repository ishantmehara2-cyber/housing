import React, { useEffect, useState } from 'react';
import { ListingPurpose, PropertyCategory, PropertyTypeSummary } from '@housing-clone/shared';
import { propertyTypeService } from '../../services/propertyTypeService';
import { Building2, Home, Key, Hotel, Map } from 'lucide-react';

interface Step1PurposeProps {
  listingPurpose: ListingPurpose;
  propertyCategory: PropertyCategory;
  propertyTypeId: string;
  onChange: (data: { listingPurpose: ListingPurpose; propertyCategory: PropertyCategory; propertyTypeId: string }) => void;
}

const PURPOSES = [
  { id: ListingPurpose.BUY, label: 'Sell / Buy', icon: Home, category: PropertyCategory.RESIDENTIAL },
  { id: ListingPurpose.RENT, label: 'Rent', icon: Key, category: PropertyCategory.RESIDENTIAL },
  { id: ListingPurpose.COMMERCIAL, label: 'Commercial', icon: Building2, category: PropertyCategory.COMMERCIAL },
  { id: ListingPurpose.PG_COLIVING, label: 'PG / Co-Living', icon: Hotel, category: PropertyCategory.RESIDENTIAL },
  { id: ListingPurpose.PLOT, label: 'Plot / Land', icon: Map, category: PropertyCategory.RESIDENTIAL },
];

export const Step1Purpose: React.FC<Step1PurposeProps> = ({
  listingPurpose,
  propertyCategory,
  propertyTypeId,
  onChange,
}) => {
  const [types, setTypes] = useState<PropertyTypeSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    propertyTypeService
      .getPropertyTypes()
      .then((data) => setTypes(data))
      .finally(() => setLoading(false));
  }, []);

  const handlePurposeSelect = (purpose: typeof PURPOSES[0]) => {
    // Select default property type matching category
    const matchingType = types.find((t) => t.category === purpose.category) || types[0];
    onChange({
      listingPurpose: purpose.id,
      propertyCategory: purpose.category,
      propertyTypeId: matchingType ? matchingType.id : propertyTypeId,
    });
  };

  const handleTypeSelect = (typeId: string) => {
    const selectedType = types.find((t) => t.id === typeId);
    onChange({
      listingPurpose,
      propertyCategory: selectedType ? selectedType.category : propertyCategory,
      propertyTypeId: typeId,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">Select Listing Purpose</h2>
        <p className="text-sm text-gray-500">Choose what type of transaction you are offering</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {PURPOSES.map((item) => {
          const Icon = item.icon;
          const isSelected = listingPurpose === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handlePurposeSelect(item)}
              className={`p-4 rounded-xl border-2 text-center flex flex-col items-center space-y-2 transition ${
                isSelected
                  ? 'border-brand-primary bg-brand-50 text-brand-primary font-bold shadow-sm'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700 bg-white'
              }`}
            >
              <Icon className={`w-6 h-6 ${isSelected ? 'text-brand-primary' : 'text-gray-400'}`} />
              <span className="text-sm font-semibold">{item.label}</span>
            </button>
          );
        })}
      </div>

      <div>
        <h3 className="text-md font-bold text-gray-900 mb-3">Property Type</h3>
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Loading property types...</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {types.map((type) => {
              const isSelected = propertyTypeId === type.id;
              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => handleTypeSelect(type.id)}
                  className={`p-3.5 rounded-xl border text-left flex items-center space-x-3 transition ${
                    isSelected
                      ? 'border-brand-primary bg-brand-50 ring-2 ring-brand-primary text-brand-primary font-bold'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700 bg-white'
                  }`}
                >
                  <span className="text-sm">{type.name}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
