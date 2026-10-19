import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  PropertySearchSummary,
  SearchPaginationMetadata,
  ListingPurpose,
  PropertyTypeSummary,
  CitySummary,
  LocalitySummary,
} from '@housing-clone/shared';
import { searchService } from '../services/searchService';
import { propertyTypeService } from '../services/propertyTypeService';
import { locationService } from '../services/locationService';
import { PropertyCard } from '../components/property/PropertyCard';
import { SaveSearchModal } from '../components/search/SaveSearchModal';
import { useAuthStore } from '../store/useAuthStore';
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  RefreshCw,
  Building2,
  Bookmark,
} from 'lucide-react';

export const SearchPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();

  const [properties, setProperties] = useState<PropertySearchSummary[]>([]);
  const [pagination, setPagination] = useState<SearchPaginationMetadata>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const [propertyTypes, setPropertyTypes] = useState<PropertyTypeSummary[]>([]);
  const [cities, setCities] = useState<CitySummary[]>([]);
  const [localities, setLocalities] = useState<LocalitySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveModalOpen, setSaveModalOpen] = useState(false);

  // Extract current query state from URL
  const purposeParam = (searchParams.get('listingPurpose') as ListingPurpose) || ListingPurpose.BUY;
  const cityParam = searchParams.get('city') || '';
  const localityParam = searchParams.get('locality') || '';
  const typeParam = searchParams.get('propertyType') || '';
  const bhkParam = searchParams.get('bhk') || '';
  const minPriceParam = searchParams.get('minPrice') || '';
  const maxPriceParam = searchParams.get('maxPrice') || '';
  const minAreaParam = searchParams.get('minCarpetArea') || '';
  const furnishingParam = searchParams.get('furnishing') || '';
  const verificationParam = searchParams.get('verificationState') || '';
  const sortParam = searchParams.get('sortBy') || 'newest';
  const pageParam = Number(searchParams.get('page')) || 1;

  // Initial Filter Catalogs Fetch
  useEffect(() => {
    Promise.all([
      propertyTypeService.getPropertyTypes(),
      locationService.getCities(),
    ]).then(([typesRes, citiesRes]) => {
      setPropertyTypes(typesRes);
      setCities(citiesRes);
    });
  }, []);

  // Fetch localities when city changes
  useEffect(() => {
    if (cityParam) {
      locationService.getLocalities(cityParam).then((res) => setLocalities(res)).catch(() => setLocalities([]));
    } else {
      setLocalities([]);
    }
  }, [cityParam]);

  // Execute Search query from URL params
  useEffect(() => {
    setLoading(true);
    const query: Record<string, unknown> = {
      listingPurpose: purposeParam,
      sortBy: sortParam,
      page: pageParam,
      limit: 12,
    };

    if (cityParam) query.city = cityParam;
    if (localityParam) query.locality = localityParam;
    if (typeParam) query.propertyType = typeParam;
    if (bhkParam) query.bhk = Number(bhkParam);
    if (minPriceParam) query.minPrice = Number(minPriceParam);
    if (maxPriceParam) query.maxPrice = Number(maxPriceParam);
    if (minAreaParam) query.minCarpetArea = Number(minAreaParam);
    if (furnishingParam) query.furnishing = furnishingParam;
    if (verificationParam) query.verificationState = verificationParam;

    searchService
      .searchProperties(query as Parameters<typeof searchService.searchProperties>[0])
      .then((res) => {
        setProperties(res.items);
        setPagination(res.pagination);
      })
      .finally(() => setLoading(false));
  }, [
    purposeParam,
    cityParam,
    localityParam,
    typeParam,
    bhkParam,
    minPriceParam,
    maxPriceParam,
    minAreaParam,
    furnishingParam,
    verificationParam,
    sortParam,
    pageParam,
  ]);

  const updateSearchParam = (key: string, value: string) => {
    const updated = new URLSearchParams(searchParams);
    if (value) {
      updated.set(key, value);
    } else {
      updated.delete(key);
    }
    updated.set('page', '1'); // Reset to page 1 on filter change
    setSearchParams(updated);
  };

  const handleClearFilters = () => {
    setSearchParams({ listingPurpose: ListingPurpose.BUY });
  };

  const handleSaveSearchClick = () => {
    if (!isAuthenticated) {
      navigate('/auth/login');
      return;
    }
    setSaveModalOpen(true);
  };

  const currentCriteria: Record<string, unknown> = {
    listingPurpose: purposeParam,
    city: cityParam,
    locality: localityParam,
    propertyType: typeParam,
    bhk: bhkParam ? Number(bhkParam) : undefined,
    minPrice: minPriceParam ? Number(minPriceParam) : undefined,
    maxPrice: maxPriceParam ? Number(maxPriceParam) : undefined,
  };

  return (
    <div className="bg-gray-50 min-h-screen py-6 px-4 sm:px-6 lg:px-8">
      <SaveSearchModal
        isOpen={saveModalOpen}
        onClose={() => setSaveModalOpen(false)}
        currentCriteria={currentCriteria}
      />

      <div className="max-w-7xl mx-auto">
        {/* Top Header & Search Bar */}
        <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-black text-gray-900 capitalize">
              {purposeParam.toLowerCase()} Properties {cityParam ? `in ${cityParam}` : 'in India'}
            </h1>
            <p className="text-xs text-gray-500 font-medium">
              Showing {pagination.total} verified real-estate listings
            </p>
          </div>

          <div className="flex items-center space-x-3 w-full md:w-auto">
            {/* Save Search CTA */}
            <button
              onClick={handleSaveSearchClick}
              className="flex items-center space-x-1.5 bg-brand-50 hover:bg-brand-100 text-brand-primary border border-brand-200 px-3.5 py-2 rounded-xl text-xs font-bold transition"
            >
              <Bookmark className="w-4 h-4" />
              <span>Save Search</span>
            </button>

            {/* Sort Selection */}
            <div className="flex items-center space-x-2 bg-gray-100 px-3 py-2 rounded-xl text-xs font-semibold text-gray-700">
              <span className="text-gray-400">Sort By:</span>
              <select
                value={sortParam}
                onChange={(e) => updateSearchParam('sortBy', e.target.value)}
                className="bg-transparent font-bold text-gray-900 outline-none cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="area_desc">Carpet Area: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Desktop Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column: Filter Sidebar */}
          <aside className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-6 self-start">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="font-bold text-gray-900 text-sm flex items-center space-x-2">
                <Filter className="w-4 h-4 text-brand-primary" />
                <span>Filter Listings</span>
              </h2>
              <button
                onClick={handleClearFilters}
                className="text-[11px] font-bold text-brand-primary hover:underline flex items-center space-x-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reset All</span>
              </button>
            </div>

            {/* Purpose Tabs */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">Purpose</label>
              <div className="grid grid-cols-3 gap-1 bg-gray-100 p-1 rounded-xl text-xs font-bold">
                {[ListingPurpose.BUY, ListingPurpose.RENT, ListingPurpose.COMMERCIAL].map((purpose) => (
                  <button
                    key={purpose}
                    onClick={() => updateSearchParam('listingPurpose', purpose)}
                    className={`py-1.5 rounded-lg transition ${
                      purposeParam === purpose
                        ? 'bg-brand-primary text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {purpose}
                  </button>
                ))}
              </div>
            </div>

            {/* City Selection */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">City</label>
              <select
                value={cityParam}
                onChange={(e) => updateSearchParam('city', e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-semibold text-gray-800 outline-none"
              >
                <option value="">All Cities</option>
                {cities.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Locality Selection */}
            {localities.length > 0 && (
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Locality</label>
                <select
                  value={localityParam}
                  onChange={(e) => updateSearchParam('locality', e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-semibold text-gray-800 outline-none"
                >
                  <option value="">All Localities</option>
                  {localities.map((l) => (
                    <option key={l.id} value={l.slug}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Property Type */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Property Type</label>
              <select
                value={typeParam}
                onChange={(e) => updateSearchParam('propertyType', e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-semibold text-gray-800 outline-none"
              >
                <option value="">All Types</option>
                {propertyTypes.map((t) => (
                  <option key={t.id} value={t.slug}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            {/* BHK Selection */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">BHK Configuration</label>
              <div className="flex flex-wrap gap-1.5">
                {[1, 2, 3, 4, 5].map((bhk) => (
                  <button
                    key={bhk}
                    onClick={() => updateSearchParam('bhk', bhkParam === String(bhk) ? '' : String(bhk))}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition ${
                      bhkParam === String(bhk)
                        ? 'border-brand-primary bg-brand-primary text-white shadow-sm'
                        : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {bhk} BHK
                  </button>
                ))}
              </div>
            </div>

            {/* Verification State */}
            <div>
              <label className="flex items-center space-x-2 cursor-pointer text-xs font-bold text-gray-800">
                <input
                  type="checkbox"
                  checked={verificationParam === 'VERIFIED'}
                  onChange={(e) => updateSearchParam('verificationState', e.target.checked ? 'VERIFIED' : '')}
                  className="rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
                />
                <span>Verified Listings Only</span>
              </label>
            </div>
          </aside>

          {/* Right Column: Property Grid & Pagination */}
          <main className="lg:col-span-3 space-y-6">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="h-72 bg-gray-200 animate-pulse rounded-2xl" />
                ))}
              </div>
            ) : properties.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center space-y-3">
                <Building2 className="w-12 h-12 text-gray-300 mx-auto" />
                <h3 className="text-lg font-bold text-gray-900">No properties matched your filter criteria</h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  Try adjusting your budget, location or BHK filter parameters.
                </p>
                <button
                  onClick={handleClearFilters}
                  className="bg-brand-primary text-white px-5 py-2 rounded-xl text-xs font-bold hover:bg-brand-hover transition"
                >
                  Clear Search Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((p) => (
                  <PropertyCard key={p.id} property={p} />
                ))}
              </div>
            )}

            {/* Server Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-200 pt-6">
                <button
                  disabled={!pagination.hasPreviousPage}
                  onClick={() => updateSearchParam('page', String(pagination.page - 1))}
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
                  onClick={() => updateSearchParam('page', String(pagination.page + 1))}
                  className="flex items-center space-x-1 border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-xl text-xs font-bold disabled:opacity-40"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};
