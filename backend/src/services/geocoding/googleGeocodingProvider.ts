import { IGeocodingProvider, GeocodingResult } from './geocoding.types';
import { db } from '../../config/db';

export class GoogleGeocodingProvider implements IGeocodingProvider {
  public async searchAddress(query: string): Promise<GeocodingResult[]> {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const locality = await db.locality.findFirst({
      where: { name: { contains: q } },
      include: { city: { include: { state: true } } },
    });

    if (locality) {
      return [
        {
          label: `${locality.name}, ${locality.city.name}`,
          latitude: locality.latitude,
          longitude: locality.longitude,
          city: locality.city.name,
          locality: locality.name,
          formattedAddress: `${locality.name}, ${locality.city.name}, ${locality.city.state.name}`,
        },
      ];
    }

    return [];
  }

  public async reverseGeocode(latitude: number, longitude: number): Promise<GeocodingResult> {
    const locality = await db.locality.findFirst({
      include: { city: { include: { state: true } } },
    });

    return {
      label: locality ? `${locality.name}, ${locality.city.name}` : `${latitude}, ${longitude}`,
      latitude,
      longitude,
      city: locality?.city.name || 'Location',
      locality: locality?.name || 'Area',
      formattedAddress: locality ? `${locality.name}, ${locality.city.name}, ${locality.city.state.name}` : `${latitude}, ${longitude}`,
    };
  }
}
