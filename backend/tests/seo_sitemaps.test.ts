import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';

describe('Phase 17 SEO, Sitemaps & Robots.txt Engine', () => {
  it('1. GET /sitemap.xml should return valid XML sitemap index', async () => {
    const res = await request(app).get('/sitemap.xml');

    expect(res.status).toBe(200);
    expect(res.header['content-type']).toContain('application/xml');
    expect(res.text).toContain('<sitemapindex');
    expect(res.text).toContain('sitemaps/properties.xml');
  });

  it('2. GET /sitemaps/properties.xml should return valid XML properties sitemap', async () => {
    const res = await request(app).get('/sitemaps/properties.xml');

    expect(res.status).toBe(200);
    expect(res.header['content-type']).toContain('application/xml');
    expect(res.text).toContain('<urlset');
  });

  it('3. GET /robots.txt should return robots directives disallowing private routes', async () => {
    const res = await request(app).get('/robots.txt');

    expect(res.status).toBe(200);
    expect(res.header['content-type']).toContain('text/plain');
    expect(res.text).toContain('Disallow: /dashboard/');
    expect(res.text).toContain('Disallow: /admin/');
  });
});
