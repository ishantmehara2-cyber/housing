import { PropertyTypeSummary, PropertyCategory } from '@housing-clone/shared';
import { db } from '../config/db';

export class PropertyTypeService {
  public static async getPropertyTypes(): Promise<PropertyTypeSummary[]> {
    const propertyTypes = await db.propertyType.findMany({
      orderBy: { name: 'asc' },
    });

    return propertyTypes.map((pt) => ({
      id: pt.id,
      name: pt.name,
      slug: pt.slug,
      category: pt.category as unknown as PropertyCategory,
      icon: pt.icon,
    }));
  }
}
