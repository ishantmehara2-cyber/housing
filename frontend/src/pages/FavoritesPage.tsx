import React, { useEffect, useState } from 'react';
import { PropertySearchSummary, SearchPaginationMetadata } from '@housing-clone/shared';
import { favoriteService } from '../services/favoriteService';
import { PropertyCard } from '../components/property/PropertyCard';
import { Heart, Building2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const FavoritesPage: React.FC = () => {
  const [favorites, setFavorites] = useState<PropertySearchSummary[]>([]);
  const [pagination, setPagination] = useState<SearchPaginationMetadata>({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [loading, setLoading] = useState(true);

  const fetchFavorites = (targetPage = 1) => {
    setLoading(true);
    favoriteService
      .getUserFavorites()
      .then((data) => {
        setFavorites(data);
        setPagination({
          page: targetPage,
          limit: 12,
          total: data.length,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-brand-50 text-brand-primary rounded-xl flex items-center justify-center">
              <Heart className="w-5 h-5 fill-brand-primary" />
            </div>
            <div>
              <h1 className="text-xl font-black text-gray-900">Saved Favorites</h1>
              <p className="text-xs text-gray-500 font-medium">Your bookmarked real-estate listings ({favorites.length})</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-72 bg-gray-200 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : favorites.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center space-y-4">
            <Building2 className="w-12 h-12 text-gray-300 mx-auto" />
            <h2 className="text-lg font-bold text-gray-900">No saved favorite properties yet</h2>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Click the heart icon on any property card to save it for easy access later.
            </p>
            <Link
              to="/search"
              className="inline-block bg-brand-primary text-white px-6 py-2.5 rounded-xl font-bold text-xs hover:bg-brand-hover transition shadow-sm"
            >
              Browse Properties
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((prop) => (
              <PropertyCard key={prop.id} property={prop} isFavoriteInitial={true} />
            ))}
          </div>
        )}

        {/* Server Pagination if needed */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-200 pt-6">
            <button
              disabled={!pagination.hasPreviousPage}
              onClick={() => fetchFavorites(pagination.page - 1)}
              className="flex items-center space-x-1 border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-xl text-xs font-bold disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>
            <span className="text-xs font-bold text-gray-600">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              disabled={!pagination.hasNextPage}
              onClick={() => fetchFavorites(pagination.page + 1)}
              className="flex items-center space-x-1 border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-xl text-xs font-bold disabled:opacity-40"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
