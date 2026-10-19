import React from 'react';
import { Link } from 'react-router-dom';
import { PropertyDetail } from '@housing-clone/shared';
import { ShieldCheck, MapPin, ChevronRight } from 'lucide-react';

interface PropertySummaryProps {
  property: PropertyDetail;
}

function formatPriceINR(price: number | null, rent: number | null): string {
  if (rent) return `₹ ${rent.toLocaleString('en-IN')} / month`;
  if (!price) return 'Contact for Price';

  if (price >= 10000000) return `₹ ${(price / 10000000).toFixed(2)} Crore`;
  if (price >= 100000) return `₹ ${(price / 100000).toFixed(2)} Lakh`;
  return `₹ ${price.toLocaleString('en-IN')}`;
}

export const PropertySummary: React.FC<PropertySummaryProps> = ({ property }) => {
  const pricePerSqFt =
    property.price && property.carpetArea
      ? Math.round(property.price / property.carpetArea)
      : property.rent && property.carpetArea
      ? Math.round(property.rent / property.carpetArea)
      : null;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-5">
      {/* Location Breadcrumbs */}
      <nav className="flex items-center space-x-1.5 text-xs text-gray-500 font-semibold overflow-x-auto pb-1">
        <Link to="/" className="hover:text-brand-primary transition">India</Link>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
        <Link to={`/search?city=${property.city.slug}`} className="hover:text-brand-primary transition">
          {property.city.name}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
        <Link to={`/search?city=${property.city.slug}&locality=${property.locality.slug}`} className="hover:text-brand-primary transition">
          {property.locality.name}
        </Link>
      </nav>

      {/* Main Title & Trust Badges */}
      <div>
        <div className="flex items-center space-x-2 mb-2">
          <span className="bg-black text-white text-[10px] font-bold px-2.5 py-0.5 rounded uppercase tracking-wider">
            {property.listingPurpose}
          </span>
          {property.verificationState === 'VERIFIED' && (
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center space-x-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>VERIFIED LISTING</span>
            </span>
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight leading-snug">
          {property.title}
        </h1>

        <p className="text-xs text-gray-500 font-medium flex items-center space-x-1 mt-2">
          <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <span>
            {property.address}, {property.locality.name}, {property.city.name}{' '}
            {property.pincode ? `(${property.pincode})` : ''}
          </span>
        </p>
      </div>

      {/* Price Banner */}
      <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl flex items-baseline justify-between">
        <div>
          <p className="text-2xl sm:text-3xl font-black text-brand-primary tracking-tight">
            {formatPriceINR(property.price, property.rent)}
          </p>
          {pricePerSqFt && (
            <p className="text-xs text-gray-500 font-semibold mt-0.5">
              @ ₹ {pricePerSqFt.toLocaleString('en-IN')} / sq.ft.
            </p>
          )}
        </div>

        {property.maintenanceFee && (
          <div className="text-right">
            <p className="text-xs text-gray-400 uppercase font-bold">Maintenance</p>
            <p className="text-sm font-bold text-gray-800">₹ {property.maintenanceFee.toLocaleString('en-IN')} / mo</p>
          </div>
        )}
      </div>

      {/* Feature Badges Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center pt-2">
        {property.bhk && (
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-[10px] font-bold text-gray-400 uppercase">Configuration</p>
            <p className="text-sm font-extrabold text-gray-900">{property.bhk} BHK</p>
          </div>
        )}
        <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
          <p className="text-[10px] font-bold text-gray-400 uppercase">Carpet Area</p>
          <p className="text-sm font-extrabold text-gray-900">{property.carpetArea} {property.areaUnit}</p>
        </div>
        <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
          <p className="text-[10px] font-bold text-gray-400 uppercase">Furnishing</p>
          <p className="text-sm font-extrabold text-gray-900">{property.furnishing}</p>
        </div>
        <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
          <p className="text-[10px] font-bold text-gray-400 uppercase">Floor</p>
          <p className="text-sm font-extrabold text-gray-900">
            {property.floorNumber ?? 'N/A'} / {property.totalFloors ?? 'N/A'}
          </p>
        </div>
      </div>
    </div>
  );
};
