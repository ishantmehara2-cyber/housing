import { db } from '../config/db';
import { AppError } from '../middlewares/errorHandler';
import { Role } from '@housing-clone/shared';

export class PackageService {
  public static async getActivePackages() {
    return db.package.findMany({
      where: { isActive: true },
      orderBy: { price: 'asc' },
    });
  }

  public static async getAllPackagesForAdmin() {
    return db.package.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  public static async createPackage(input: {
    name: string;
    targetRole?: Role;
    price: number;
    validityDays: number;
    maxListings: number;
    featuredListingsCount?: number;
  }) {
    return db.package.create({
      data: {
        name: input.name,
        targetRole: (input.targetRole as unknown as import('@prisma/client').Role) || 'OWNER',
        price: input.price,
        validityDays: input.validityDays,
        maxListings: input.maxListings,
        featuredListingsCount: input.featuredListingsCount || 0,
        isActive: true,
      },
    });
  }

  public static async updatePackageStatus(id: string, isActive: boolean) {
    const pkg = await db.package.findUnique({ where: { id } });
    if (!pkg) throw new AppError(404, 'Package not found', 'NOT_FOUND');

    return db.package.update({
      where: { id },
      data: { isActive },
    });
  }
}
