import { IGeocodingProvider, GeocodingResult } from './geocoding.types';
import { MockGeocodingProvider } from './mockGeocodingProvider';
import { GoogleGeocodingProvider } from './googleGeocodingProvider';

export class GeocodingService {
  private static getProvider(): IGeocodingProvider {
    const provider = process.env.MAP_PROVIDER || 'mock';
    if (provider === 'google') {
      return new GoogleGeocodingProvider();
    }
    return new MockGeocodingProvider();
  }

  public static async searchAddress(query: string): Promise<GeocodingResult[]> {
    const provider = GeocodingService.getProvider();
    return provider.searchAddress(query);
  }

  public static async reverseGeocode(latitude: number, longitude: number): Promise<GeocodingResult> {
    const provider = GeocodingService.getProvider();
    return provider.reverseGeocode(latitude, longitude);
  }
}
