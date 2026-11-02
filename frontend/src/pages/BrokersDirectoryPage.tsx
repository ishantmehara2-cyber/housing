import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { BrokerSummary, Role } from '@housing-clone/shared';
import { brokerService } from '../services/brokerService';
import {
  Search,
  MapPin,
  CheckCircle2,
  Star,
  Building2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  PhoneCall,
  UserCheck,
  Award,
} from 'lucide-react';

export const BrokersDirectoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const queryParam = searchParams.get('query') || '';
  const cityParam = searchParams.get('city') || '';
  const roleParam = searchParams.get('role') as Role | undefined;
  const specParam = searchParams.get('specialization') as 'BUY' | 'RENT' | 'BOTH' | undefined;
  const pageParam = Number(searchParams.get('page')) || 1;

  const [searchInput, setSearchInput] = useState(queryParam);
  const [brokers, setBrokers] = useState<BrokerSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBrokers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await brokerService.getBrokers({
        query: queryParam || undefined,
        city: cityParam || undefined,
        role: roleParam || undefined,
        specialization: specParam || undefined,
        page: pageParam,
        limit: 12,
      });

      setBrokers(res.brokers);
      setTotal(res.pagination.total);
      setTotalPages(res.pagination.totalPages);
    } catch {
      setError('Unable to load broker directory. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [queryParam, cityParam, roleParam, specParam, pageParam]);

  useEffect(() => {
    fetchBrokers();
  }, [fetchBrokers]);

  useEffect(() => {
    document.title = 'Top Real Estate Agents & Brokers | Housing Clone';
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    if (searchInput.trim()) {
      newParams.set('query', searchInput.trim());
    } else {
      newParams.delete('query');
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handleRoleFilter = (role?: Role) => {
    const newParams = new URLSearchParams(searchParams);
    if (role) {
      newParams.set('role', role);
    } else {
      newParams.delete('role');
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handleSpecFilter = (spec?: 'BUY' | 'RENT' | 'BOTH') => {
    const newParams = new URLSearchParams(searchParams);
    if (spec) {
      newParams.set('specialization', spec);
    } else {
      newParams.delete('specialization');
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', String(newPage));
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Hero Banner Header */}
      <div className="bg-gradient-to-r from-red-600 to-brand-primary text-white py-12 px-4 shadow-md">
        <div className="max-w-6xl mx-auto space-y-4">
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-red-100">
            <Award className="w-4 h-4 text-amber-300" />
            <span>Verified Partner Network</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Find Trusted Real Estate Agents & Brokers
          </h1>
          <p className="text-red-100 text-sm sm:text-base max-w-2xl">
            Connect with verified property experts, top agencies, and experienced brokers in your area to buy, sell, or rent property hassle-free.
          </p>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="pt-2 flex max-w-2xl">
            <div className="relative flex-grow">
              <Search className="w-5 h-5 absolute left-3.5 top-3.5 text-gray-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by broker name, agency, or location..."
                className="w-full pl-11 pr-4 py-3 rounded-l-xl text-gray-900 text-sm focus:outline-none bg-white shadow-inner"
              />
            </div>
            <button
              type="submit"
              className="bg-gray-900 hover:bg-black text-white px-6 py-3 rounded-r-xl font-bold text-sm transition shadow-lg shrink-0"
            >
              Search Brokers
            </button>
          </form>
        </div>
      </div>

      {/* Are You a Broker? Entry Section */}
      <div className="max-w-6xl mx-auto px-4 pt-6">
        <div className="bg-white border border-brand-200 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-l-4 border-l-brand-primary">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-gray-900 flex items-center space-x-2">
              <Building2 className="w-5 h-5 text-brand-primary" />
              <span>Are you a Broker?</span>
            </h2>
            <p className="text-xs text-gray-600 font-medium">
              Manage your property listings, leads, enquiries and business performance from your broker dashboard.
            </p>
          </div>
          <button
            onClick={() => navigate('/broker/login')}
            className="bg-brand-primary hover:bg-brand-hover text-white px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-sm shrink-0 flex items-center space-x-1.5"
          >
            <span>Login as Broker</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="max-w-6xl mx-auto px-4 pt-6">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-wrap items-center justify-between gap-4">
          {/* Role Filters */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400 mr-1">Type:</span>
            <button
              onClick={() => handleRoleFilter(undefined)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                !roleParam ? 'bg-brand-primary text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All Experts
            </button>
            <button
              onClick={() => handleRoleFilter(Role.AGENT)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                roleParam === Role.AGENT ? 'bg-brand-primary text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Agents
            </button>
            <button
              onClick={() => handleRoleFilter(Role.OWNER)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                roleParam === Role.OWNER ? 'bg-brand-primary text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Owners
            </button>
            <button
              onClick={() => handleRoleFilter(Role.DEVELOPER)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                roleParam === Role.DEVELOPER ? 'bg-brand-primary text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Developers
            </button>
          </div>

          {/* Specialization Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Services:</span>
            <button
              onClick={() => handleSpecFilter(undefined)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                !specParam ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => handleSpecFilter('BUY')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                specParam === 'BUY' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Buy / Sell
            </button>
            <button
              onClick={() => handleSpecFilter('RENT')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                specParam === 'RENT' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Rent / Lease
            </button>
          </div>
        </div>

        {/* Directory Content Header */}
        <div className="pt-6 pb-4 flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-600">
            Showing <span className="text-gray-900 font-bold">{total}</span> verified real estate professionals
          </p>
        </div>

        {/* Loading Skeletons */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-pulse space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 bg-gray-200 rounded-full shrink-0" />
                  <div className="space-y-2 flex-grow">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
                <div className="h-3 bg-gray-200 rounded w-full" />
                <div className="h-3 bg-gray-200 rounded w-2/3" />
                <div className="h-10 bg-gray-200 rounded-xl" />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 text-center space-y-4 my-8 max-w-md mx-auto">
            <p className="text-sm text-red-600 font-medium">{error}</p>
            <button
              onClick={fetchBrokers}
              className="bg-brand-primary hover:bg-brand-hover text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition inline-flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry Search</span>
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && brokers.length === 0 && (
          <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-200 text-center space-y-4 my-8 max-w-lg mx-auto">
            <UserCheck className="w-12 h-12 text-gray-300 mx-auto" />
            <h3 className="text-lg font-bold text-gray-900">No Brokers Found</h3>
            <p className="text-sm text-gray-500">
              We couldn't find any real estate agents or brokers matching your search criteria. Try removing filters or searching a different city.
            </p>
            <button
              onClick={() => {
                setSearchInput('');
                setSearchParams(new URLSearchParams());
              }}
              className="bg-brand-primary hover:bg-brand-hover text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition"
            >
              Clear All Filters
            </button>
          </div>
        )}

        {/* Broker Grid */}
        {!loading && !error && brokers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {brokers.map((broker) => (
              <div
                key={broker.id}
                className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md border border-gray-200 transition flex flex-col justify-between space-y-4"
              >
                <div>
                  {/* Top Profile Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        {broker.avatarUrl ? (
                          <img
                            src={broker.avatarUrl}
                            alt={`${broker.firstName} ${broker.lastName}`}
                            className="w-14 h-14 rounded-full object-cover border border-gray-200"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-full bg-red-50 text-brand-primary font-bold text-xl flex items-center justify-center border border-red-100">
                            {broker.firstName[0]}
                            {broker.lastName[0]}
                          </div>
                        )}
                        {broker.verified && (
                          <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-50" />
                          </div>
                        )}
                      </div>

                      <div>
                        <h3 className="font-bold text-gray-900 text-base leading-tight hover:text-brand-primary cursor-pointer transition" onClick={() => navigate(`/brokers/${broker.id}`)}>
                          {broker.firstName} {broker.lastName}
                        </h3>
                        <p className="text-xs text-gray-500 font-medium mt-0.5">
                          {broker.agencyName || (broker.role === 'DEVELOPER' ? 'Developer Associate' : 'Independent Broker')}
                        </p>
                        <span className="inline-block mt-1 bg-gray-100 text-gray-700 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                          {broker.role}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="inline-flex items-center space-x-1 bg-amber-50 text-amber-800 text-xs font-bold px-2 py-1 rounded-md">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        <span>{broker.rating}</span>
                      </div>
                      <p className="text-[11px] text-gray-400 mt-1">{broker.reviewCount} reviews</p>
                    </div>
                  </div>

                  {/* Highlights Grid */}
                  <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-gray-50 p-2 rounded-lg">
                      <p className="text-gray-400 font-medium">Experience</p>
                      <p className="font-bold text-gray-900">{broker.experienceYears} Years</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded-lg">
                      <p className="text-gray-400 font-medium">Active Listings</p>
                      <p className="font-bold text-brand-primary">{broker.activeListingCount}</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded-lg">
                      <p className="text-gray-400 font-medium">Speciality</p>
                      <p className="font-bold text-gray-900">{broker.specialization}</p>
                    </div>
                  </div>

                  {/* Location & Areas */}
                  <div className="mt-3 space-y-1.5 text-xs text-gray-600">
                    <div className="flex items-center space-x-1.5">
                      <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className="font-medium text-gray-800">{broker.city}</span>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <Building2 className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className="truncate">{broker.areasServed.slice(0, 3).join(', ')}</span>
                    </div>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="pt-2 flex items-center space-x-2">
                  <button
                    onClick={() => navigate(`/brokers/${broker.id}`)}
                    className="flex-1 bg-gray-900 hover:bg-black text-white py-2.5 rounded-xl text-xs font-bold transition text-center"
                  >
                    View Profile
                  </button>
                  <button
                    onClick={() => navigate(`/brokers/${broker.id}?contact=true`)}
                    className="flex-1 bg-brand-primary hover:bg-brand-hover text-white py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Contact</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {!loading && !error && totalPages > 1 && (
          <div className="mt-10 flex items-center justify-center space-x-3">
            <button
              onClick={() => handlePageChange(pageParam - 1)}
              disabled={pageParam <= 1}
              className="p-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-40 transition"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-xs font-semibold text-gray-600">
              Page <strong className="text-gray-900">{pageParam}</strong> of <strong className="text-gray-900">{totalPages}</strong>
            </span>
            <button
              onClick={() => handlePageChange(pageParam + 1)}
              disabled={pageParam >= totalPages}
              className="p-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-40 transition"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
