import { db } from '../config/db';

export class EntitlementService {
  public static async getUserEntitlements(userId: string) {
    const activeSub = await db.subscription.findFirst({
      where: {
        userId,
        status: 'ACTIVE',
        endDate: { gte: new Date() },
      },
      include: { package: true },
      orderBy: { endDate: 'desc' },
    });

    if (!activeSub) {
      return {
        canPostListing: true, // Default free allowance
        canCreateFeaturedListing: false,
        remainingListings: 1,
        remainingFeaturedListings: 0,
        activeSubscription: null,
      };
    }

    return {
      canPostListing: activeSub.remainingListings > 0,
      canCreateFeaturedListing: activeSub.package.featuredListingsCount > 0,
      remainingListings: activeSub.remainingListings,
      remainingFeaturedListings: activeSub.package.featuredListingsCount,
      activeSubscription: {
        id: activeSub.id,
        packageName: activeSub.package.name,
        remainingListings: activeSub.remainingListings,
        startDate: activeSub.startDate.toISOString(),
        endDate: activeSub.endDate.toISOString(),
        status: activeSub.status,
      },
    };
  }
}
