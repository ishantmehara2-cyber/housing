import React, { useState, useEffect, useRef } from 'react';
import { geocodingService, GeocodingResult } from '../../services/geocodingService';
import { MapPin, Navigation, Loader2, Search } from 'lucide-react';

interface LocationAutocompleteProps {
  placeholder?: string;
  value?: string;
  onSelect: (result: GeocodingResult) => void;
  className?: string;
}

export const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({
  placeholder = 'Search city, locality, or address...',
  value = '',
  onSelect,
  className = '',
}) => {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<GeocodingResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [locatingUser, setLocatingUser] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Debounced geocoding search
  useEffect(() => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      setDropdownOpen(false);
      return;
    }

    const timer = setTimeout(() => {
      setLoading(true);
      geocodingService
        .searchAddress(query)
        .then((results) => {
          setSuggestions(results);
          setDropdownOpen(results.length > 0);
        })
        .catch(() => setSuggestions([]))
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Outside click handler
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setLocatingUser(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const result = await geocodingService.reverseGeocode(pos.coords.latitude, pos.coords.longitude);
          setQuery(result.label);
          setDropdownOpen(false);
          onSelect(result);
        } catch {
          alert('Failed to determine location address');
        } finally {
          setLocatingUser(false);
        }
      },
      () => {
        alert('Location permission denied or unavailable');
        setLocatingUser(false);
      },
      { timeout: 10000 }
    );
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative flex items-center">
        <Search className="w-4 h-4 text-gray-400 absolute left-3 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && suggestions.length > 0 && setDropdownOpen(true)}
          placeholder={placeholder}
          className="w-full pl-9 pr-10 py-2.5 bg-white border border-gray-300 rounded-xl text-xs font-semibold text-gray-800 outline-none focus:ring-2 focus:ring-brand-primary"
        />
        {loading ? (
          <Loader2 className="w-4 h-4 text-brand-primary animate-spin absolute right-3" />
        ) : (
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={locatingUser}
            className="absolute right-2.5 p-1 text-gray-400 hover:text-brand-primary transition"
            title="Use my current location"
          >
            {locatingUser ? (
              <Loader2 className="w-4 h-4 text-brand-primary animate-spin" />
            ) : (
              <Navigation className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      {/* Dropdown Suggestions */}
      {dropdownOpen && (
        <div className="absolute left-0 right-0 mt-1 bg-white rounded-xl shadow-2xl border border-gray-200 py-1 z-50 text-xs overflow-hidden">
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            className="w-full px-4 py-2.5 text-left text-brand-primary font-bold hover:bg-brand-50 flex items-center space-x-2 border-b border-gray-100"
          >
            <Navigation className="w-4 h-4 shrink-0" />
            <span>Use my current location</span>
          </button>

          {suggestions.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setQuery(item.label);
                setDropdownOpen(false);
                onSelect(item);
              }}
              className="w-full px-4 py-2.5 text-left text-gray-800 hover:bg-gray-50 flex items-center space-x-2 transition border-b border-gray-50 last:border-none"
            >
              <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
              <div className="min-w-0">
                <p className="font-bold truncate">{item.label}</p>
                <p className="text-[11px] text-gray-400 truncate">{item.formattedAddress}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
