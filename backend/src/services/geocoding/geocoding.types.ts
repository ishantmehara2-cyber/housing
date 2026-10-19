export interface GeocodingResult {
  label: string;
  latitude: number;
  longitude: number;
  city?: string;
  locality?: string;
  subLocality?: string;
  formattedAddress: string;
}

export interface IGeocodingProvider {
  searchAddress(query: string): Promise<GeocodingResult[]>;
  reverseGeocode(latitude: number, longitude: number): Promise<GeocodingResult>;
}
