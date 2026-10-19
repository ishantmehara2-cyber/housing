import React, { useEffect, useState } from 'react';
import { StateSummary, CitySummary, LocalitySummary, SubLocalitySummary } from '@housing-clone/shared';
import { locationService } from '../../services/locationService';
import { LocationAutocomplete } from '../maps/LocationAutocomplete';
import { PropertyMap } from '../maps/PropertyMap';

interface Step3LocationProps {
  cityId: string;
  localityId: string;
  subLocalityId: string | null;
  address: string;
  landmark: string | null;
  pincode: string | null;
  latitude: number;
  longitude: number;
  onChange: (data: Partial<Step3LocationProps>) => void;
}

export const Step3Location: React.FC<Step3LocationProps> = ({
  cityId,
  localityId,
  subLocalityId,
  address,
  landmark,
  pincode,
  latitude,
  longitude,
  onChange,
}) => {
  const [states, setStates] = useState<StateSummary[]>([]);
  const [selectedStateId, setSelectedStateId] = useState<string>('');
  const [cities, setCities] = useState<CitySummary[]>([]);
  const [localities, setLocalities] = useState<LocalitySummary[]>([]);
  const [subLocalities, setSubLocalities] = useState<SubLocalitySummary[]>([]);

  const [loadingStates, setLoadingStates] = useState(true);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingLocalities, setLoadingLocalities] = useState(false);

  // 1. Load states on mount
  useEffect(() => {
    locationService
      .getStates()
      .then((stateData) => {
        setStates(stateData);
        if (stateData.length > 0) {
          setSelectedStateId(stateData[0].id);
        }
      })
      .catch(() => setStates([]))
      .finally(() => setLoadingStates(false));
  }, []);

  // 2. Load cities when selectedStateId changes
  useEffect(() => {
    setLoadingCities(true);
    locationService
      .getCities(selectedStateId || undefined)
      .then((cityData) => {
        setCities(cityData);
        if (cityData.length > 0) {
          const currentValid = cityData.find((c) => c.id === cityId);
          if (!currentValid) {
            onChange({
              cityId: cityData[0].id,
              latitude: cityData[0].latitude,
              longitude: cityData[0].longitude,
            });
          }
        } else {
          setCities([]);
        }
      })
      .catch(() => setCities([]))
      .finally(() => setLoadingCities(false));
  }, [selectedStateId]);

  // 3. Load localities when cityId changes
  useEffect(() => {
    if (!cityId) {
      setLocalities([]);
      return;
    }
    setLoadingLocalities(true);
    locationService
      .getLocalities(cityId)
      .then((locData) => {
        setLocalities(locData);
        if (locData.length > 0) {
          const currentValidLoc = locData.find((l) => l.id === localityId);
          if (!currentValidLoc) {
            onChange({
              localityId: locData[0].id,
              latitude: locData[0].latitude,
              longitude: locData[0].longitude,
            });
          }
        } else {
          setLocalities([]);
        }
      })
      .catch(() => setLocalities([]))
      .finally(() => setLoadingLocalities(false));
  }, [cityId]);

  // 4. Load sublocalities when localityId changes
  useEffect(() => {
    if (!localityId) {
      setSubLocalities([]);
      return;
    }
    locationService
      .getSubLocalities(localityId)
      .then((subData) => {
        setSubLocalities(subData);
      })
      .catch(() => setSubLocalities([]));
  }, [localityId]);

  const selectedCity = cities.find((c) => c.id === cityId);
  const selectedLocality = localities.find((l) => l.id === localityId);

  const activeLat = latitude || selectedLocality?.latitude || selectedCity?.latitude || 19.076;
  const activeLng = longitude || selectedLocality?.longitude || selectedCity?.longitude || 72.8777;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">Property Location</h2>
        <p className="text-sm text-gray-500">
          Select state, city, locality, search address, and confirm position pin on the map
        </p>
      </div>

      {/* Autocomplete Location Search */}
      <div>
        <label className="block text-xs font-bold text-gray-700 mb-1">Search Address / Locality</label>
        <LocationAutocomplete
          onSelect={(res) => {
            onChange({
              address: res.formattedAddress,
              latitude: res.latitude,
              longitude: res.longitude,
            });
          }}
        />
      </div>

      {/* Cascading Selectors: State -> City -> Locality -> SubLocality */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {/* State Select */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">State *</label>
          {loadingStates ? (
            <div className="p-2.5 bg-gray-100 rounded-lg text-xs text-gray-400">Loading states...</div>
          ) : (
            <select
              value={selectedStateId}
              onChange={(e) => setSelectedStateId(e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-brand-primary outline-none"
            >
              {states.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* City Select */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">City *</label>
          {loadingCities ? (
            <div className="p-2.5 bg-gray-100 rounded-lg text-xs text-gray-400">Loading cities...</div>
          ) : (
            <select
              value={cityId}
              onChange={(e) => {
                const c = cities.find((city) => city.id === e.target.value);
                onChange({
                  cityId: e.target.value,
                  latitude: c?.latitude || activeLat,
                  longitude: c?.longitude || activeLng,
                });
              }}
              className="w-full p-2.5 border border-gray-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-brand-primary outline-none"
            >
              {cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Locality Select */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Locality *</label>
          {loadingLocalities ? (
            <div className="p-2.5 bg-gray-100 rounded-lg text-xs text-gray-400">Loading localities...</div>
          ) : (
            <select
              value={localityId}
              onChange={(e) => {
                const selectedLoc = localities.find((l) => l.id === e.target.value);
                onChange({
                  localityId: e.target.value,
                  latitude: selectedLoc?.latitude || activeLat,
                  longitude: selectedLoc?.longitude || activeLng,
                });
              }}
              className="w-full p-2.5 border border-gray-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-brand-primary outline-none"
            >
              {localities.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* SubLocality Select */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Sub-Locality (Optional)</label>
          <select
            value={subLocalityId || ''}
            onChange={(e) => onChange({ subLocalityId: e.target.value || null })}
            className="w-full p-2.5 border border-gray-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-brand-primary outline-none"
          >
            <option value="">None</option>
            {subLocalities.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Address & Landmark */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Street Address *</label>
          <input
            type="text"
            value={address}
            onChange={(e) => onChange({ address: e.target.value })}
            placeholder="e.g. Flat 402, Building 3, Green Park Society"
            className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-primary outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Landmark</label>
            <input
              type="text"
              value={landmark || ''}
              onChange={(e) => onChange({ landmark: e.target.value || null })}
              placeholder="e.g. Near Metro Station"
              className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-primary outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Pincode</label>
            <input
              type="text"
              value={pincode || ''}
              onChange={(e) => onChange({ pincode: e.target.value || null })}
              placeholder="e.g. Pincode"
              className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-primary outline-none"
            />
          </div>
        </div>

        {/* Interactive Map Pin Picker */}
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">Confirm Property Location Pin</label>
          <PropertyMap properties={[]} centerLat={activeLat} centerLng={activeLng} className="h-48 w-full" />
        </div>
      </div>
    </div>
  );
};
