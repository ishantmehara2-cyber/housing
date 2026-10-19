import { db } from '../config/db';

export class SeoService {
  private static baseUrl = process.env.CLIENT_URL || 'https://housing-clone.test';

  public static async getSitemapIndex(): Promise<string> {
    return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${SeoService.baseUrl}/sitemaps/properties.xml</loc>
  </sitemap>
  <sitemap>
    <loc>${SeoService.baseUrl}/sitemaps/projects.xml</loc>
  </sitemap>
  <sitemap>
    <loc>${SeoService.baseUrl}/sitemaps/locations.xml</loc>
  </sitemap>
</sitemapindex>`;
  }

  public static async getPropertiesSitemap(): Promise<string> {
    const properties = await db.property.findMany({
      where: { listingState: 'ACTIVE', verificationState: 'VERIFIED' },
      select: { slug: true, updatedAt: true },
      take: 1000,
      orderBy: { updatedAt: 'desc' },
    });

    const urls = properties
      .map(
        (p) => `  <url>
    <loc>${SeoService.baseUrl}/property/${p.slug}</loc>
    <lastmod>${p.updatedAt.toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`
      )
      .join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
  }

  public static async getProjectsSitemap(): Promise<string> {
    const projects = await db.project.findMany({
      where: { status: 'ACTIVE' },
      select: { slug: true, updatedAt: true },
      take: 500,
    });

    const urls = projects
      .map(
        (p) => `  <url>
    <loc>${SeoService.baseUrl}/projects/${p.slug}</loc>
    <lastmod>${p.updatedAt.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`
      )
      .join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
  }

  public static async getLocationsSitemap(): Promise<string> {
    const cities = await db.city.findMany({
      where: { isActive: true },
      select: { slug: true },
    });

    const urls = cities
      .map(
        (c) => `  <url>
    <loc>${SeoService.baseUrl}/search?city=${c.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`
      )
      .join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
  }

  public static getRobotsTxt(): string {
    return `User-agent: *
Disallow: /dashboard/
Disallow: /admin/
Disallow: /auth/
Disallow: /api/

Sitemap: ${SeoService.baseUrl}/sitemap.xml`;
  }
}
