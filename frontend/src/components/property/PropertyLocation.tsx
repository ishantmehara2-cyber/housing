import React from 'react';
import { CitySummary, LocalitySummary } from '@housing-clone/shared';
import { MapPin, Landmark } from 'lucide-react';
import { PropertyMap } from '../maps/PropertyMap';

interface PropertyLocationProps {
  address: string;
  landmark: string | null;
  pincode: string | null;
  city: CitySummary;
  locality: LocalitySummary;
  latitude: number;
  longitude: number;
}

export const PropertyLocation: React.FC<PropertyLocationProps> = ({
  address,
  landmark,
  pincode,
  city,
  locality,
  latitude,
  longitude,
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
      <div className="flex items-center space-x-2 border-b border-gray-100 pb-3">
        <MapPin className="w-5 h-5 text-brand-primary" />
        <h2 className="text-lg font-bold text-gray-900">Location & Neighborhood</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Address & Landmark Details */}
        <div className="space-y-3">
          <div className="p-3.5 bg-gray-50 border border-gray-100 rounded-xl space-y-1">
            <p className="text-[10px] font-bold text-gray-400 uppercase">Street Address</p>
            <p className="text-xs font-bold text-gray-900">{address}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl space-y-0.5">
              <p className="text-[10px] font-bold text-gray-400 uppercase">Locality</p>
              <p className="text-xs font-bold text-gray-900">{locality.name}</p>
            </div>
            <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl space-y-0.5">
              <p className="text-[10px] font-bold text-gray-400 uppercase">City & Pincode</p>
              <p className="text-xs font-bold text-gray-900">
                {city.name} {pincode ? `(${pincode})` : ''}
              </p>
            </div>
          </div>

          {landmark && (
            <div className="p-3 bg-brand-50 border border-brand-100 rounded-xl flex items-center space-x-2 text-xs font-semibold text-brand-dark">
              <Landmark className="w-4 h-4 text-brand-primary shrink-0" />
              <span>Landmark: {landmark}</span>
            </div>
          )}
        </div>

        {/* Embedded Interactive Map */}
        <PropertyMap
          properties={[]}
          centerLat={latitude}
          centerLng={longitude}
          className="h-52 w-full"
        />
      </div>
    </div>
  );
};
