import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PropertySearchSummary } from '@housing-clone/shared';
import { useAuthStore } from '../../store/useAuthStore';
import { favoriteService } from '../../services/favoriteService';
import { Heart, MapPin, ShieldCheck, Sparkles } from 'lucide-react';

interface PropertyCardProps {
  property: PropertySearchSummary;
  isFavoriteInitial?: boolean;
}

function formatPriceINR(price: number | null, rent: number | null): string {
  if (rent) {
    return `₹ ${rent.toLocaleString('en-IN')} / mo`;
  }
  if (!price) return 'Contact for Price';

  if (price >= 10000000) {
    return `₹ ${(price / 10000000).toFixed(2)} Cr`;
  }
  if (price >= 100000) {
    return `₹ ${(price / 100000).toFixed(2)} Lakh`;
  }
  return `₹ ${price.toLocaleString('en-IN')}`;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property, isFavoriteInitial = false }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [isFavorite, setIsFavorite] = useState(isFavoriteInitial);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate('/auth/login');
      return;
    }

    setFavoriteLoading(true);
    try {
      if (isFavorite) {
        await favoriteService.removeFavorite(property.id);
        setIsFavorite(false);
      } else {
        await favoriteService.addFavorite(property.id);
        setIsFavorite(true);
      }
    } catch {
      // Revert state on failure
    } finally {
      setFavoriteLoading(false);
    }
  };

  const imageSrc =
    property.primaryImage?.url ||
    'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80';

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col h-full relative">
      {/* Media Image Container */}
      <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-gray-100">
        <img
          src={imageSrc}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          {property.verificationState === 'VERIFIED' && (
            <span className="bg-emerald-600/90 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-md flex items-center space-x-1 shadow-sm backdrop-blur-sm">
              <ShieldCheck className="w-3 h-3" />
              <span>VERIFIED</span>
            </span>
          )}
          {property.isFeatured && (
            <span className="bg-brand-primary/90 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-md flex items-center space-x-1 shadow-sm backdrop-blur-sm">
              <Sparkles className="w-3 h-3" />
              <span>FEATURED</span>
            </span>
          )}
        </div>

        {/* Favorite Heart Button */}
        <button
          onClick={handleFavoriteClick}
          disabled={favoriteLoading}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition shadow-md z-10 ${
            isFavorite
              ? 'bg-white text-brand-primary shadow-lg'
              : 'bg-black/30 text-white hover:bg-white hover:text-brand-primary'
          }`}
          title={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-brand-primary text-brand-primary' : ''}`} />
        </button>

        {/* Purpose Tag Overlay */}
        <div className="absolute bottom-3 left-3 bg-black/60 text-white text-[10px] font-bold px-2.5 py-0.5 rounded uppercase tracking-wider backdrop-blur-sm">
          {property.listingPurpose}
        </div>
      </div>

      {/* Property Information Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Price Header */}
          <div className="flex items-baseline justify-between mb-1">
            <span className="text-lg font-black text-brand-primary tracking-tight">
              {formatPriceINR(property.price, property.rent)}
            </span>
            <span className="text-xs text-gray-500 font-semibold">
              {property.carpetArea} {property.areaUnit}
            </span>
          </div>

          {/* Title */}
          <Link to={`/property/${property.slug}`} className="block group-hover:text-brand-primary transition">
            <h3 className="text-sm font-bold text-gray-900 line-clamp-1 mb-1">{property.title}</h3>
          </Link>

          {/* Location */}
          <p className="text-xs text-gray-500 flex items-center space-x-1 truncate mb-3">
            <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span className="truncate">
              {property.locality.name}, {property.city.name}
            </span>
          </p>

          {/* Quick Features */}
          <div className="flex flex-wrap gap-2 text-[11px] text-gray-600 font-medium">
            {property.bhk && (
              <span className="bg-gray-100 px-2 py-0.5 rounded-md">{property.bhk} BHK</span>
            )}
            <span className="bg-gray-100 px-2 py-0.5 rounded-md">{property.propertyType.name}</span>
            <span className="bg-gray-100 px-2 py-0.5 rounded-md truncate">{property.furnishing}</span>
          </div>
        </div>

        {/* Footer info / CTA */}
        <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
          <span className="text-[11px] text-gray-400 font-medium">
            {property.developerOrganization
              ? property.developerOrganization.companyName
              : 'Owner Listing'}
          </span>
          <Link
            to={`/property/${property.slug}`}
            className="text-xs font-bold text-brand-primary hover:underline flex items-center space-x-0.5"
          >
            <span>View Details</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
