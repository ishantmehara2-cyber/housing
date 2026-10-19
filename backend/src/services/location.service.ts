import { StateSummary, CitySummary, LocalitySummary, SubLocalitySummary } from '@housing-clone/shared';
import { db } from '../config/db';
import { AppError } from '../middlewares/errorHandler';
import { Prisma } from '@prisma/client';

export class LocationService {
  public static async getStates(): Promise<StateSummary[]> {
    const states = await db.state.findMany({
      orderBy: { name: 'asc' },
    });
    return states;
  }

  public static async getCities(stateId?: string): Promise<CitySummary[]> {
    const where: Prisma.CityWhereInput = { isActive: true };
    if (stateId) {
      where.stateId = stateId;
    }

    const cities = await db.city.findMany({
      where,
      include: { state: true },
      orderBy: [{ isPopular: 'desc' }, { name: 'asc' }],
    });

    return cities.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      state: { id: c.state.id, name: c.state.name, code: c.state.code },
      latitude: c.latitude,
      longitude: c.longitude,
      isPopular: c.isPopular,
      isActive: c.isActive,
    }));
  }

  public static async getLocalities(cityIdentifier?: string): Promise<LocalitySummary[]> {
    const where: Prisma.LocalityWhereInput = {};

    if (cityIdentifier) {
      const city = await db.city.findFirst({
        where: {
          OR: [{ id: cityIdentifier }, { slug: cityIdentifier }],
        },
      });

      if (!city) {
        throw new AppError(404, 'City not found', 'CITY_NOT_FOUND');
      }
      where.cityId = city.id;
    }

    const localities = await db.locality.findMany({
      where,
      orderBy: { name: 'asc' },
      take: 200,
    });

    return localities.map((l) => ({
      id: l.id,
      name: l.name,
      slug: l.slug,
      cityId: l.cityId,
      pincode: l.pincode,
      latitude: l.latitude,
      longitude: l.longitude,
    }));
  }

  public static async getLocalitiesByCitySlug(citySlug: string): Promise<LocalitySummary[]> {
    return LocationService.getLocalities(citySlug);
  }

  public static async getSubLocalities(localityIdentifier?: string): Promise<SubLocalitySummary[]> {
    const where: Prisma.SubLocalityWhereInput = {};

    if (localityIdentifier) {
      const locality = await db.locality.findFirst({
        where: {
          OR: [{ id: localityIdentifier }, { slug: localityIdentifier }],
        },
      });

      if (!locality) {
        throw new AppError(404, 'Locality not found', 'LOCALITY_NOT_FOUND');
      }
      where.localityId = locality.id;
    }

    const subLocalities = await db.subLocality.findMany({
      where,
      orderBy: { name: 'asc' },
      take: 200,
    });

    return subLocalities.map((sl) => ({
      id: sl.id,
      name: sl.name,
      slug: sl.slug,
      localityId: sl.localityId,
      latitude: sl.latitude,
      longitude: sl.longitude,
    }));
  }

  public static async getSubLocalitiesByLocalitySlug(localitySlug: string): Promise<SubLocalitySummary[]> {
    return LocationService.getSubLocalities(localitySlug);
  }
}
