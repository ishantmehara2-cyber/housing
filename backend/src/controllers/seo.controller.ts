import { Request, Response, NextFunction } from 'express';
import { SeoService } from '../services/seo.service';

export class SeoController {
  public static async getSitemapIndex(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const xml = await SeoService.getSitemapIndex();
      res.header('Content-Type', 'application/xml').send(xml);
    } catch (err) {
      next(err);
    }
  }

  public static async getPropertiesSitemap(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const xml = await SeoService.getPropertiesSitemap();
      res.header('Content-Type', 'application/xml').send(xml);
    } catch (err) {
      next(err);
    }
  }

  public static async getProjectsSitemap(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const xml = await SeoService.getProjectsSitemap();
      res.header('Content-Type', 'application/xml').send(xml);
    } catch (err) {
      next(err);
    }
  }

  public static async getLocationsSitemap(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const xml = await SeoService.getLocationsSitemap();
      res.header('Content-Type', 'application/xml').send(xml);
    } catch (err) {
      next(err);
    }
  }

  public static getRobotsTxt(_req: Request, res: Response): void {
    const txt = SeoService.getRobotsTxt();
    res.header('Content-Type', 'text/plain').send(txt);
  }
}
