import { Router } from 'express';
import { SeoController } from '../controllers/seo.controller';

export const seoRouter = Router();

seoRouter.get('/sitemap.xml', SeoController.getSitemapIndex);
seoRouter.get('/sitemaps/properties.xml', SeoController.getPropertiesSitemap);
seoRouter.get('/sitemaps/projects.xml', SeoController.getProjectsSitemap);
seoRouter.get('/sitemaps/locations.xml', SeoController.getLocationsSitemap);
seoRouter.get('/robots.txt', SeoController.getRobotsTxt);
