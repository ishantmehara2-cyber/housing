import React, { useState } from 'react';
import { PropertySearchSummary } from '@housing-clone/shared';
import { Navigation, MapPin, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PropertyMapProps {
  properties: PropertySearchSummary[];
  selectedPropertyId?: string | null;
  onMarkerSelect?: (propertyId: string) => void;
  className?: string;
  centerLat?: number;
  centerLng?: number;
}

export const PropertyMap: React.FC<PropertyMapProps> = ({
  properties,
  selectedPropertyId,
  onMarkerSelect,
  className = 'h-96 w-full',
  centerLat = 19.076,
  centerLng = 72.8777,
}) => {
  const [activeProperty, setActiveProperty] = useState<PropertySearchSummary | null>(null);

  const activeProp = activeProperty || properties.find((p) => p.id === selectedPropertyId);

  return (
    <div className={`bg-gray-100 rounded-2xl border border-gray-200 overflow-hidden relative flex flex-col items-center justify-center p-4 ${className}`}>
      {/* Background Map Placeholder Pattern */}
      <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#e11d48_1px,transparent_1px)] [background-size:16px_16px]" />

      <Navigation className="w-8 h-8 text-brand-primary mb-2 animate-bounce relative z-10" />
      <p className="text-xs font-bold text-gray-800 relative z-10">Interactive Property Discovery Map</p>
      <p className="text-[11px] text-gray-500 font-mono relative z-10 mt-0.5">
        Showing {properties.length} location markers around ({centerLat.toFixed(2)}, {centerLng.toFixed(2)})
      </p>

      {/* Location Markers */}
      <div className="flex flex-wrap gap-2 justify-center max-w-md mt-4 relative z-10">
        {properties.slice(0, 6).map((p) => (
          <button
            key={p.id}
            onClick={() => {
              setActiveProperty(p);
              if (onMarkerSelect) onMarkerSelect(p.id);
            }}
            className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold flex items-center space-x-1 shadow-sm transition ${
              p.id === selectedPropertyId || activeProp?.id === p.id
                ? 'bg-brand-primary text-white scale-110'
                : 'bg-white text-gray-800 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <MapPin className="w-3 h-3" />
            <span>₹ {p.price ? (p.price / 100000).toFixed(0) + 'L' : p.rent ? (p.rent / 1000).toFixed(0) + 'k' : 'Contact'}</span>
          </button>
        ))}
      </div>

      {/* Selected Property Popup Card Overlay */}
      {activeProp && (
        <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 max-w-sm bg-white rounded-xl p-3 border border-gray-200 shadow-xl z-20 flex items-center space-x-3">
          <img
            src={activeProp.primaryImage?.url || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=200&q=80'}
            alt={activeProp.title}
            className="w-16 h-12 object-cover rounded-lg shrink-0"
          />
          <div className="min-w-0 flex-1">
            <h4 className="font-bold text-gray-900 text-xs truncate">{activeProp.title}</h4>
            <p className="text-[11px] text-brand-primary font-bold">
              {activeProp.rent ? `₹ ${activeProp.rent.toLocaleString('en-IN')}/mo` : `₹ ${(activeProp.price! / 100000).toFixed(1)} Lakh`}
            </p>
          </div>
          <Link
            to={`/property/${activeProp.slug}`}
            className="p-1.5 text-brand-primary hover:bg-brand-50 rounded-lg shrink-0"
            title="View property details"
          >
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
};
