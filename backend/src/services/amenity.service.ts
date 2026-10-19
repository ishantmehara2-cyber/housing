import { AmenitySummary } from '@housing-clone/shared';
import { db } from '../config/db';

export class AmenityService {
  public static async getAmenities(): Promise<AmenitySummary[]> {
    const amenities = await db.amenity.findMany({
      orderBy: { name: 'asc' },
    });

    return amenities.map((a) => ({
      id: a.id,
      name: a.name,
      slug: a.slug,
      category: a.category,
      icon: a.icon,
    }));
  }
}
