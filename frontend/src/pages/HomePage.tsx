import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ListingPurpose,
  PropertySearchSummary,
  PropertyTypeSummary,
  CitySummary,
} from '@housing-clone/shared';
import { searchService } from '../services/searchService';
import { propertyTypeService } from '../services/propertyTypeService';
import { locationService } from '../services/locationService';
import { PropertyCard } from '../components/property/PropertyCard';
import {
  Search,
  Home,
  Building2,
  Key,
  Hotel,
  Map,
  ShieldCheck,
  ArrowRight,
  PlusCircle,
  MapPin,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedPurpose, setSelectedPurpose] = useState<ListingPurpose>(ListingPurpose.BUY);
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedPropertyType, setSelectedPropertyType] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const [featuredProperties, setFeaturedProperties] = useState<PropertySearchSummary[]>([]);
  const [rentProperties, setRentProperties] = useState<PropertySearchSummary[]>([]);
  const [propertyTypes, setPropertyTypes] = useState<PropertyTypeSummary[]>([]);
  const [popularCities, setPopularCities] = useState<CitySummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [featuredRes, rentRes, typesRes, citiesRes] = await Promise.all([
          searchService.searchProperties({ listingPurpose: ListingPurpose.BUY, limit: 6 }),
          searchService.searchProperties({ listingPurpose: ListingPurpose.RENT, limit: 6 }),
          propertyTypeService.getPropertyTypes(),
          locationService.getCities(),
        ]);

        setFeaturedProperties(featuredRes.items);
        setRentProperties(rentRes.items);
        setPropertyTypes(typesRes);
        setPopularCities(citiesRes);
        if (citiesRes.length > 0 && !selectedCity) {
          setSelectedCity(citiesRes[0].slug);
        }
      } catch {
        // Fallback gracefully
      } finally {
        setLoading(false);
      }
    }
    loadHomeData();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    params.set('listingPurpose', selectedPurpose);
    if (selectedCity) params.set('city', selectedCity);
    if (selectedPropertyType) params.set('propertyType', selectedPropertyType);
    if (maxPrice) params.set('maxPrice', maxPrice);

    navigate(`/search?${params.toString()}`);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Red Marketplace Hero Banner */}
      <section className="bg-gradient-to-b from-brand-primary via-brand-primary to-brand-dark text-white pt-12 pb-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Subtle Decorative Grid */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="max-w-5xl mx-auto relative z-10 text-center space-y-6">
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-semibold text-white/90 border border-white/20">
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            <span>100% Verified Real Estate Marketplace</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
            Trusted place to find a home
          </h1>
          <p className="text-sm sm:text-lg text-white/80 max-w-2xl mx-auto font-medium">
            Search verified apartments, villas, plots and commercial spaces across India's top cities.
          </p>

          {/* Search Card Container */}
          <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-2xl border border-gray-100 text-gray-900 max-w-4xl mx-auto mt-8">
            {/* Purpose Tabs */}
            <div className="flex items-center justify-center space-x-2 border-b border-gray-200 pb-4 overflow-x-auto">
              {[
                { id: ListingPurpose.BUY, label: 'BUY', icon: Home },
                { id: ListingPurpose.RENT, label: 'RENT', icon: Key },
                { id: ListingPurpose.COMMERCIAL, label: 'COMMERCIAL', icon: Building2 },
                { id: ListingPurpose.PG_COLIVING, label: 'PG / CO-LIVING', icon: Hotel },
                { id: ListingPurpose.PLOT, label: 'PLOTS', icon: Map },
              ].map((tab) => {
                const Icon = tab.icon;
                const active = selectedPurpose === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setSelectedPurpose(tab.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                      active
                        ? 'bg-brand-primary text-white shadow-md'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Interactive Search Bar Controls */}
            <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-4">
              {/* City Selection */}
              <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-200 text-left">
                <label className="block text-[10px] font-bold text-gray-400 uppercase">City</label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="bg-transparent w-full text-xs font-bold text-gray-800 outline-none cursor-pointer"
                >
                  {popularCities.length > 0 ? (
                    popularCities.map((city) => (
                      <option key={city.id} value={city.slug}>
                        {city.name}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>Select City</option>
                  )}
                </select>
              </div>

              {/* Property Type Selection */}
              <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-200 text-left">
                <label className="block text-[10px] font-bold text-gray-400 uppercase">Property Type</label>
                <select
                  value={selectedPropertyType}
                  onChange={(e) => setSelectedPropertyType(e.target.value)}
                  className="bg-transparent w-full text-xs font-bold text-gray-800 outline-none cursor-pointer"
                >
                  <option value="">All Types</option>
                  {propertyTypes.map((t) => (
                    <option key={t.id} value={t.slug}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Budget Range Selection */}
              <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-200 text-left">
                <label className="block text-[10px] font-bold text-gray-400 uppercase">Max Budget</label>
                <select
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="bg-transparent w-full text-xs font-bold text-gray-800 outline-none cursor-pointer"
                >
                  <option value="">Any Budget</option>
                  <option value="5000000">₹ 50 Lakhs</option>
                  <option value="10000000">₹ 1 Crore</option>
                  <option value="20000000">₹ 2 Crores</option>
                  <option value="50000000">₹ 5 Crores+</option>
                </select>
              </div>

              {/* Search Submit Button */}
              <button
                type="submit"
                className="bg-brand-primary hover:bg-brand-hover text-white rounded-xl font-bold text-sm flex items-center justify-center space-x-2 py-3 transition shadow-md"
              >
                <Search className="w-4 h-4" />
                <span>Search Properties</span>
              </button>
            </form>
          </div>

          {/* Quick Marketplace Counters */}
          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto pt-6 text-center border-t border-white/10">
            <div>
              <p className="text-2xl font-black">50,000+</p>
              <p className="text-xs text-white/70">Verified Properties</p>
            </div>
            <div>
              <p className="text-2xl font-black">120+</p>
              <p className="text-xs text-white/70">Indian Cities</p>
            </div>
            <div>
              <p className="text-2xl font-black">100%</p>
              <p className="text-xs text-white/70">Direct Owner Listings</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Homepage Content Containers */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {/* Section 1: Featured Properties for Sale */}
        <section className="space-y-6">
          <div className="flex items-end justify-between">
            <div>
              <span className="text-xs font-bold text-brand-primary uppercase tracking-wider">Handpicked</span>
              <h2 className="text-2xl font-black text-gray-900">Featured Properties for Sale</h2>
            </div>
            <button
              onClick={() => navigate('/search?listingPurpose=BUY')}
              className="text-xs font-bold text-brand-primary hover:underline flex items-center space-x-1"
            >
              <span>Explore All</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-72 bg-gray-200 animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProperties.map((p) => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>
          )}
        </section>

        {/* Section 2: Popular Cities */}
        <section className="space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-1">
            <span className="text-xs font-bold text-brand-primary uppercase tracking-wider">Top Destinations</span>
            <h2 className="text-2xl font-black text-gray-900">Explore Properties in Popular Cities</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {popularCities.map((city) => (
              <button
                key={city.id}
                onClick={() => navigate(`/search?city=${city.slug}`)}
                className="bg-white border border-gray-200 hover:border-brand-primary rounded-2xl p-4 text-center hover:shadow-md transition group"
              >
                <div className="w-10 h-10 bg-brand-50 text-brand-primary rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                  <MapPin className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-gray-900 group-hover:text-brand-primary transition">
                  {city.name}
                </h3>
                <p className="text-[11px] text-gray-400 font-medium">Explore Properties</p>
              </button>
            ))}
          </div>
        </section>

        {/* Section 3: Properties for Rent Collection */}
        <section className="space-y-6">
          <div className="flex items-end justify-between">
            <div>
              <span className="text-xs font-bold text-brand-primary uppercase tracking-wider">Rental Homes</span>
              <h2 className="text-2xl font-black text-gray-900">Verified Rental Listings</h2>
            </div>
            <button
              onClick={() => navigate('/search?listingPurpose=RENT')}
              className="text-xs font-bold text-brand-primary hover:underline flex items-center space-x-1"
            >
              <span>View All Rental Homes</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rentProperties.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        </section>

        {/* Section 4: Owner / Seller Call to Action */}
        <section className="bg-gradient-to-r from-gray-900 via-gray-800 to-black text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <span className="bg-brand-primary text-white text-[10px] font-bold px-2.5 py-1 rounded uppercase tracking-wider">
              Zero Brokerage Listing
            </span>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
              Are you an Owner or Agent? Post your property for free!
            </h2>
            <p className="text-sm text-gray-300">
              Reach over 1,00,000+ active home buyers and tenants monthly with verified seller leads.
            </p>
          </div>

          <button
            onClick={() => navigate('/post-property')}
            className="bg-brand-primary hover:bg-brand-hover text-white px-8 py-4 rounded-2xl font-bold text-sm flex items-center space-x-2 transition shadow-xl shrink-0"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Post Property Free</span>
          </button>
        </section>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-20 py-12 px-4 sm:px-6 lg:px-8 text-xs text-gray-500">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 bg-brand-primary rounded-lg flex items-center justify-center text-white font-bold text-xs">
                H
              </div>
              <span className="font-black text-gray-900 text-sm">HOUSING.CLONE</span>
            </div>
            <p className="text-gray-400">
              India's premier real-estate marketplace for verified buy, rent, commercial and plot listings.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-3 text-sm">Properties in India</h4>
            <ul className="space-y-2">
              {popularCities.slice(0, 4).map((c) => (
                <li key={c.id}>
                  <button onClick={() => navigate(`/search?city=${c.slug}`)} className="hover:underline">
                    Properties in {c.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-3 text-sm">Quick Links</h4>
            <ul className="space-y-2">
              <li><button onClick={() => navigate('/search?listingPurpose=BUY')} className="hover:underline">Buy Property</button></li>
              <li><button onClick={() => navigate('/search?listingPurpose=RENT')} className="hover:underline">Rent Property</button></li>
              <li><button onClick={() => navigate('/post-property')} className="hover:underline">Post Property Free</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-3 text-sm">Security & Trust</h4>
            <p className="text-gray-400 mb-2">100% encrypted authentication and direct direct-to-S3 media storage.</p>
            <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
              ✔ SSL Secured Marketplace
            </span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between text-gray-400">
          <p>© 2026 Housing.clone Marketplace. All rights reserved.</p>
          <p className="mt-2 sm:mt-0">Built with Node.js, Prisma MySQL & React Tailwind Red Theme</p>
        </div>
      </footer>
    </div>
  );
};
