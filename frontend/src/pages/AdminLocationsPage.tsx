/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useCallback } from 'react';
import { adminService } from '../services/adminService';
import { MapPin, Plus, Loader2, Search, CheckCircle, XCircle } from 'lucide-react';

export const AdminLocationsPage: React.FC = () => {
  const [states, setStates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [localities, setLocalities] = useState<any[]>([]);
  const [subLocalities, setSubLocalities] = useState<any[]>([]);

  const [selectedStateId, setSelectedStateId] = useState<string>('');
  const [selectedCityId, setSelectedCityId] = useState<string>('');
  const [selectedLocalityId, setSelectedLocalityId] = useState<string>('');

  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showStateModal, setShowStateModal] = useState(false);
  const [stateName, setStateName] = useState('');
  const [stateCode, setStateCode] = useState('');
  const [submittingState, setSubmittingState] = useState(false);

  const [showCityModal, setShowCityModal] = useState(false);
  const [cityName, setCityName] = useState('');
  const [citySlug, setCitySlug] = useState('');
  const [cityStateId, setCityStateId] = useState('');
  const [submittingCity, setSubmittingCity] = useState(false);

  const [showLocalityModal, setShowLocalityModal] = useState(false);
  const [localityName, setLocalityName] = useState('');
  const [localitySlug, setLocalitySlug] = useState('');
  const [pincode, setPincode] = useState('');
  const [submittingLocality, setSubmittingLocality] = useState(false);

  const [showSubLocalityModal, setShowSubLocalityModal] = useState(false);
  const [subLocalityName, setSubLocalityName] = useState('');
  const [subLocalitySlug, setSubLocalitySlug] = useState('');
  const [submittingSubLocality, setSubmittingSubLocality] = useState(false);

  // Fetch States
  const fetchStates = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminService.getStates();
      setStates(data);
      if (data.length > 0 && !selectedStateId) {
        setSelectedStateId((data[0] as any).id);
      }
    } catch {
      // Error
    } finally {
      setLoading(false);
    }
  }, [selectedStateId]);

  // Fetch Cities
  const fetchCities = useCallback(async () => {
    try {
      const data = await adminService.getCities(selectedStateId || undefined);
      setCities(data);
      if (data.length > 0 && (!selectedCityId || !data.some((c: any) => c.id === selectedCityId))) {
        setSelectedCityId((data[0] as any).id);
      }
    } catch {
      // Error
    }
  }, [selectedStateId, selectedCityId]);

  // Fetch Localities
  const fetchLocalities = useCallback(async () => {
    if (!selectedCityId) {
      setLocalities([]);
      return;
    }
    try {
      const data = await adminService.getLocalities(selectedCityId);
      setLocalities(data);
      if (data.length > 0 && (!selectedLocalityId || !data.some((l: any) => l.id === selectedLocalityId))) {
        setSelectedLocalityId((data[0] as any).id);
      }
    } catch {
      // Error
    }
  }, [selectedCityId, selectedLocalityId]);

  // Fetch SubLocalities
  const fetchSubLocalities = useCallback(async () => {
    if (!selectedLocalityId) {
      setSubLocalities([]);
      return;
    }
    try {
      const data = await adminService.getSubLocalities(selectedLocalityId);
      setSubLocalities(data);
    } catch {
      // Error
    }
  }, [selectedLocalityId]);

  useEffect(() => {
    fetchStates();
  }, [fetchStates]);

  useEffect(() => {
    fetchCities();
  }, [fetchCities]);

  useEffect(() => {
    fetchLocalities();
  }, [fetchLocalities]);

  useEffect(() => {
    fetchSubLocalities();
  }, [fetchSubLocalities]);

  // Handlers
  const handleCreateState = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmittingState(true);
      await adminService.createState({
        name: stateName,
        code: stateCode.toUpperCase(),
      });
      setShowStateModal(false);
      setStateName('');
      setStateCode('');
      fetchStates();
    } catch {
      // Error
    } finally {
      setSubmittingState(false);
    }
  };

  const handleCreateCity = async (e: React.FormEvent) => {
    e.preventDefault();
    const stId = cityStateId || selectedStateId || (states[0]?.id as string);
    if (!stId) return;

    try {
      setSubmittingCity(true);
      await adminService.createCity({
        name: cityName,
        slug: citySlug || cityName.toLowerCase().replace(/\s+/g, '-'),
        stateId: stId,
        latitude: 19.076,
        longitude: 72.8777,
        isPopular: true,
      });

      setShowCityModal(false);
      setCityName('');
      setCitySlug('');
      fetchCities();
    } catch {
      // Error
    } finally {
      setSubmittingCity(false);
    }
  };

  const handleCreateLocality = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCityId) return;
    try {
      setSubmittingLocality(true);
      const slug = localitySlug || localityName.toLowerCase().replace(/\s+/g, '-');
      await adminService.createLocality({
        name: localityName,
        slug,
        cityId: selectedCityId,
        pincode: pincode || undefined,
        latitude: 19.076,
        longitude: 72.8777,
      });

      setShowLocalityModal(false);
      setLocalityName('');
      setLocalitySlug('');
      setPincode('');
      fetchLocalities();
    } catch {
      // Error
    } finally {
      setSubmittingLocality(false);
    }
  };

  const handleCreateSubLocality = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLocalityId) return;
    try {
      setSubmittingSubLocality(true);
      const slug = subLocalitySlug || subLocalityName.toLowerCase().replace(/\s+/g, '-');
      await adminService.createSubLocality({
        name: subLocalityName,
        slug,
        localityId: selectedLocalityId,
        latitude: 19.076,
        longitude: 72.8777,
      });

      setShowSubLocalityModal(false);
      setSubLocalityName('');
      setSubLocalitySlug('');
      fetchSubLocalities();
    } catch {
      // Error
    } finally {
      setSubmittingSubLocality(false);
    }
  };

  const handleToggleCityActive = async (cityId: string, currentActive: boolean) => {
    try {
      await adminService.updateCity(cityId, { isActive: !currentActive });
      fetchCities();
    } catch {
      // Error
    }
  };

  const filteredLocalities = localities.filter((loc: any) =>
    loc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-gray-200 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <MapPin className="w-6 h-6 text-brand-primary" />
            <span>Locations & City Directory</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Database-backed location hierarchy: State → City → Locality → SubLocality
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowStateModal(true)}
            className="bg-gray-800 hover:bg-gray-900 text-white px-3.5 py-2 rounded-xl font-bold text-xs transition inline-flex items-center space-x-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add State</span>
          </button>
          <button
            onClick={() => {
              setCityStateId(selectedStateId);
              setShowCityModal(true);
            }}
            className="bg-brand-primary hover:bg-brand-hover text-white px-3.5 py-2 rounded-xl font-bold text-xs transition inline-flex items-center space-x-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add City</span>
          </button>
          <button
            onClick={() => setShowLocalityModal(true)}
            disabled={!selectedCityId}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl font-bold text-xs transition inline-flex items-center space-x-1.5 shadow-sm disabled:opacity-50"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Locality</span>
          </button>
          <button
            onClick={() => setShowSubLocalityModal(true)}
            disabled={!selectedLocalityId}
            className="bg-purple-600 hover:bg-purple-700 text-white px-3.5 py-2 rounded-xl font-bold text-xs transition inline-flex items-center space-x-1.5 shadow-sm disabled:opacity-50"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Sub-Locality</span>
          </button>
        </div>
      </div>

      {/* State Filter bar & Search */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-2 overflow-x-auto w-full md:w-auto">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider shrink-0">State:</span>
          {states.map((st: any) => (
            <button
              key={st.id}
              onClick={() => setSelectedStateId(st.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                selectedStateId === st.id
                  ? 'bg-brand-primary text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {st.name} ({st.code})
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search localities..."
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-brand-primary"
          />
        </div>
      </div>

      {/* Grid Layout: Cities, Localities, SubLocalities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Cities List */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 space-y-3">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Cities ({cities.length})
            </h2>
            <button
              onClick={() => {
                setCityStateId(selectedStateId);
                setShowCityModal(true);
              }}
              className="text-xs font-bold text-brand-primary hover:underline flex items-center space-x-1"
            >
              <Plus className="w-3 h-3" />
              <span>Add</span>
            </button>
          </div>

          {loading ? (
            <div className="p-4 text-xs text-gray-400">Loading cities...</div>
          ) : cities.length === 0 ? (
            <div className="p-4 text-xs text-gray-400 text-center">No cities found for this state</div>
          ) : (
            <div className="space-y-1 max-h-[500px] overflow-y-auto pr-1">
              {cities.map((c: any) => (
                <div
                  key={c.id}
                  onClick={() => setSelectedCityId(c.id)}
                  className={`w-full text-left p-3 rounded-xl border text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                    selectedCityId === c.id
                      ? 'border-brand-primary bg-brand-50 text-brand-primary shadow-sm'
                      : 'border-gray-100 hover:border-gray-200 text-gray-700 bg-gray-50'
                  }`}
                >
                  <div>
                    <p className="font-bold flex items-center space-x-1">
                      <span>{c.name}</span>
                      {c.isPopular && (
                        <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">
                          Popular
                        </span>
                      )}
                    </p>
                    <p className="text-[10px] text-gray-400 font-normal">{c.state?.name}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleCityActive(c.id, c.isActive);
                      }}
                      title={c.isActive ? 'Deactivate City' : 'Activate City'}
                      className="text-gray-400 hover:text-gray-700"
                    >
                      {c.isActive ? (
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-gray-300" />
                      )}
                    </button>
                    <span className="text-[10px] bg-white px-2 py-0.5 rounded border border-gray-200 font-bold">
                      {c._count?.localities || 0}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Column 2: Localities List */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 space-y-3">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Localities ({localities.length})
            </h2>
            <button
              onClick={() => setShowLocalityModal(true)}
              disabled={!selectedCityId}
              className="text-xs font-bold text-emerald-600 hover:underline flex items-center space-x-1 disabled:opacity-40"
            >
              <Plus className="w-3 h-3" />
              <span>Add</span>
            </button>
          </div>

          <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
            {filteredLocalities.map((loc: any) => (
              <div
                key={loc.id}
                onClick={() => setSelectedLocalityId(loc.id)}
                className={`p-3 rounded-xl border text-xs cursor-pointer transition flex items-center justify-between ${
                  selectedLocalityId === loc.id
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold shadow-sm'
                    : 'border-gray-100 bg-gray-50 hover:border-gray-200 text-gray-800 font-semibold'
                }`}
              >
                <div>
                  <p className="font-bold">{loc.name}</p>
                  <p className="text-[10px] text-gray-400 font-normal">
                    Pincode: {loc.pincode || 'N/A'} • {loc._count?.properties || 0} Properties
                  </p>
                </div>
                <span className="text-[10px] bg-white px-1.5 py-0.5 rounded border font-bold text-gray-500">
                  {loc._count?.subLocalities || 0} subs
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Column 3: SubLocalities List */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 space-y-3">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Sub-Localities ({subLocalities.length})
            </h2>
            <button
              onClick={() => setShowSubLocalityModal(true)}
              disabled={!selectedLocalityId}
              className="text-xs font-bold text-purple-600 hover:underline flex items-center space-x-1 disabled:opacity-40"
            >
              <Plus className="w-3 h-3" />
              <span>Add</span>
            </button>
          </div>

          {subLocalities.length === 0 ? (
            <div className="p-4 text-xs text-gray-400 text-center">No sub-localities listed for selected area</div>
          ) : (
            <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
              {subLocalities.map((sub: any) => (
                <div key={sub.id} className="p-3 bg-gray-50 border border-gray-100 rounded-xl space-y-0.5">
                  <p className="font-bold text-gray-900 text-xs">{sub.name}</p>
                  <p className="text-[10px] text-gray-400">Slug: {sub.slug}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add State Modal */}
      {showStateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 max-w-md w-full space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Add New State</h2>
            <form onSubmit={handleCreateState} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">State Name *</label>
                <input
                  type="text"
                  required
                  value={stateName}
                  onChange={(e) => setStateName(e.target.value)}
                  placeholder="e.g. Maharashtra"
                  className="w-full px-3 py-2 border rounded-lg text-xs outline-none focus:ring-2 focus:ring-brand-primary font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">State Code *</label>
                <input
                  type="text"
                  required
                  value={stateCode}
                  onChange={(e) => setStateCode(e.target.value)}
                  placeholder="e.g. MH"
                  className="w-full px-3 py-2 border rounded-lg text-xs outline-none focus:ring-2 focus:ring-brand-primary uppercase"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowStateModal(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingState}
                  className="px-5 py-2 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-bold transition flex items-center space-x-1"
                >
                  {submittingState ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Create State</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add City Modal */}
      {showCityModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 max-w-md w-full space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Add New City</h2>
            <form onSubmit={handleCreateCity} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">State *</label>
                <select
                  value={cityStateId}
                  onChange={(e) => setCityStateId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-xs outline-none focus:ring-2 focus:ring-brand-primary font-semibold"
                >
                  {states.map((st: any) => (
                    <option key={st.id} value={st.id}>
                      {st.name} ({st.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">City Name *</label>
                <input
                  type="text"
                  required
                  value={cityName}
                  onChange={(e) => setCityName(e.target.value)}
                  placeholder="e.g. Mumbai"
                  className="w-full px-3 py-2 border rounded-lg text-xs outline-none focus:ring-2 focus:ring-brand-primary font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Slug</label>
                <input
                  type="text"
                  value={citySlug}
                  onChange={(e) => setCitySlug(e.target.value)}
                  placeholder="e.g. mumbai"
                  className="w-full px-3 py-2 border rounded-lg text-xs outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCityModal(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingCity}
                  className="px-5 py-2 bg-brand-primary hover:bg-brand-hover text-white rounded-xl text-xs font-bold transition flex items-center space-x-1"
                >
                  {submittingCity ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Create City</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Locality Modal */}
      {showLocalityModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 max-w-md w-full space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Add New Locality</h2>
            <form onSubmit={handleCreateLocality} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Locality Name *</label>
                <input
                  type="text"
                  required
                  value={localityName}
                  onChange={(e) => setLocalityName(e.target.value)}
                  placeholder="e.g. Juhu"
                  className="w-full px-3 py-2 border rounded-lg text-xs outline-none focus:ring-2 focus:ring-brand-primary font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Slug</label>
                <input
                  type="text"
                  value={localitySlug}
                  onChange={(e) => setLocalitySlug(e.target.value)}
                  placeholder="e.g. juhu"
                  className="w-full px-3 py-2 border rounded-lg text-xs outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Pincode</label>
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="e.g. 400049"
                  className="w-full px-3 py-2 border rounded-lg text-xs outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowLocalityModal(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingLocality}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1"
                >
                  {submittingLocality ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Create Locality</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add SubLocality Modal */}
      {showSubLocalityModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 max-w-md w-full space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Add New Sub-Locality</h2>
            <form onSubmit={handleCreateSubLocality} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Sub-Locality Name *</label>
                <input
                  type="text"
                  required
                  value={subLocalityName}
                  onChange={(e) => setSubLocalityName(e.target.value)}
                  placeholder="e.g. JVPD Scheme"
                  className="w-full px-3 py-2 border rounded-lg text-xs outline-none focus:ring-2 focus:ring-brand-primary font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Slug</label>
                <input
                  type="text"
                  value={subLocalitySlug}
                  onChange={(e) => setSubLocalitySlug(e.target.value)}
                  placeholder="e.g. jvpd-scheme"
                  className="w-full px-3 py-2 border rounded-lg text-xs outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowSubLocalityModal(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingSubLocality}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1"
                >
                  {submittingSubLocality ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Create Sub-Locality</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
