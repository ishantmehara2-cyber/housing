import { db } from '../config/db';
import { AppError } from '../middlewares/errorHandler';
import { propertySearchSchema, CreateSavedSearchInput, UpdateSavedSearchInput } from '@housing-clone/shared';
import { Prisma } from '@prisma/client';

export class SavedSearchService {
  public static async createSavedSearch(userId: string, input: CreateSavedSearchInput) {
    // Validate search criteria using shared search schema
    const validatedCriteria = propertySearchSchema.parse(input.searchCriteria);

    // Auto-generate name if not provided
    let name = input.name;
    if (!name) {
      const bhkText = validatedCriteria.bhk ? `${validatedCriteria.bhk} BHK ` : '';
      const purposeText = validatedCriteria.listingPurpose || 'Buy';
      const typeText = validatedCriteria.propertyType ? `${validatedCriteria.propertyType} ` : '';
      const cityText = validatedCriteria.city ? `in ${validatedCriteria.city}` : 'in India';
      name = `${bhkText}${purposeText} ${typeText}${cityText}`.trim();
    }

    const saved = await db.savedSearch.create({
      data: {
        userId,
        name,
        searchCriteria: validatedCriteria as unknown as Prisma.InputJsonValue,
        enableAlerts: input.enableAlerts ?? true,
      },
    });

    return saved;
  }

  public static async getUserSavedSearches(userId: string) {
    return db.savedSearch.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  public static async getSavedSearchById(userId: string, id: string) {
    const saved = await db.savedSearch.findUnique({ where: { id } });

    if (!saved || saved.userId !== userId) {
      throw new AppError(404, 'Saved search not found', 'NOT_FOUND');
    }

    return saved;
  }

  public static async updateSavedSearch(userId: string, id: string, input: UpdateSavedSearchInput) {
    const saved = await db.savedSearch.findUnique({ where: { id } });

    if (!saved || saved.userId !== userId) {
      throw new AppError(404, 'Saved search not found', 'NOT_FOUND');
    }

    return db.savedSearch.update({
      where: { id },
      data: {
        ...(input.name ? { name: input.name } : {}),
        ...(input.enableAlerts !== undefined ? { enableAlerts: input.enableAlerts } : {}),
      },
    });
  }

  public static async deleteSavedSearch(userId: string, id: string) {
    const saved = await db.savedSearch.findUnique({ where: { id } });

    if (!saved || saved.userId !== userId) {
      throw new AppError(404, 'Saved search not found', 'NOT_FOUND');
    }

    await db.savedSearch.delete({ where: { id } });
    return true;
  }
}
