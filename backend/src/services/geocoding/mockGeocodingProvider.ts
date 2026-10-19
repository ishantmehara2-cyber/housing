import { IGeocodingProvider, GeocodingResult } from './geocoding.types';
import { db } from '../../config/db';

export class MockGeocodingProvider implements IGeocodingProvider {
  public async searchAddress(query: string): Promise<GeocodingResult[]> {
    const q = query.trim().toLowerCase();
    if (!q || q.length < 2) return [];

    const results: GeocodingResult[] = [];

    // 1. Search SubLocalities in MySQL
    const subLocalities = await db.subLocality.findMany({
      where: {
        OR: [
          { name: { contains: q } },
          { locality: { name: { contains: q } } },
        ],
      },
      include: {
        locality: {
          include: {
            city: {
              include: { state: true },
            },
          },
        },
      },
      take: 5,
    });

    for (const sub of subLocalities) {
      results.push({
        label: `${sub.name}, ${sub.locality.name}`,
        latitude: sub.latitude,
        longitude: sub.longitude,
        city: sub.locality.city.name,
        locality: sub.locality.name,
        formattedAddress: `${sub.name}, ${sub.locality.name}, ${sub.locality.city.name}, ${sub.locality.city.state.name}`,
      });
    }

    // 2. Search Localities in MySQL
    const localities = await db.locality.findMany({
      where: {
        OR: [
          { name: { contains: q } },
          { city: { name: { contains: q } } },
        ],
      },
      include: {
        city: {
          include: { state: true },
        },
      },
      take: 10 - results.length,
    });

    for (const l of localities) {
      if (!results.some((r) => r.locality === l.name && r.city === l.city.name)) {
        results.push({
          label: `${l.name}, ${l.city.name}`,
          latitude: l.latitude,
          longitude: l.longitude,
          city: l.city.name,
          locality: l.name,
          formattedAddress: `${l.name}, ${l.city.name}, ${l.city.state.name}`,
        });
      }
    }

    // 3. Search Cities in MySQL if results list is still small
    if (results.length < 5) {
      const cities = await db.city.findMany({
        where: {
          name: { contains: q },
          isActive: true,
        },
        include: { state: true },
        take: 5 - results.length,
      });

      for (const c of cities) {
        if (!results.some((r) => r.city === c.name)) {
          results.push({
            label: `${c.name}, ${c.state.name}`,
            latitude: c.latitude,
            longitude: c.longitude,
            city: c.name,
            locality: c.name,
            formattedAddress: `${c.name}, ${c.state.name}`,
          });
        }
      }
    }

    return results;
  }

  public async reverseGeocode(latitude: number, longitude: number): Promise<GeocodingResult> {
    const locality = await db.locality.findFirst({
      include: { city: { include: { state: true } } },
    });

    if (!locality) {
      return {
        label: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
        latitude,
        longitude,
        city: 'Unknown',
        locality: 'Unknown',
        formattedAddress: `Coordinates: ${latitude}, ${longitude}`,
      };
    }

    return {
      label: `${locality.name}, ${locality.city.name}`,
      latitude,
      longitude,
      city: locality.city.name,
      locality: locality.name,
      formattedAddress: `${locality.name}, ${locality.city.name}, ${locality.city.state.name}`,
    };
  }
}
