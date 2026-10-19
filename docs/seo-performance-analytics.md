# SEO, Performance, Analytics & Observability Specs

## Overview
Phase 17 delivers dynamic XML sitemaps, robots.txt directives, Schema.org JSON-LD structured data, first-party event tracking, request correlation, database readiness probes, and route-level code splitting for `housing-clone`.

---

## 1. SEO & Dynamic Sitemaps
* **Sitemap Index:** `GET /sitemap.xml`
* **Properties Sitemap:** `GET /sitemaps/properties.xml`
* **Projects Sitemap:** `GET /sitemaps/projects.xml`
* **Locations Sitemap:** `GET /sitemaps/locations.xml`
* **Robots Directives:** `GET /robots.txt` disallows `/dashboard/`, `/admin/`, `/auth/`, and `/api/`.

---

## 2. First-Party Analytics System
`POST /api/v1/analytics/events`  
**Authentication:** Optional  
Records product events (`property_view`, `property_favorite`, `search_performed`, `enquiry_created`, `visit_scheduled`, `recommendation_click`, `map_search`).

`GET /api/v1/admin/analytics/summary`  
**Authentication:** Admin / Moderator  
Aggregates event counts and top viewed properties.

---

## 3. Observability & Health Probes
* **Request Correlation:** Middleware attaches `X-Request-ID` UUID header to all HTTP requests and structured Pino logs.
* **Process Health Probe:** `GET /api/v1/health` (`200 OK`)
* **Database Readiness Probe:** `GET /api/v1/health/ready` (`200 OK` or `503 Service Unavailable`).

---

## 4. Frontend Performance
* Route-level code splitting via `React.lazy()` and `<Suspense>` reduces initial JS bundle size from 566 kB to 353 kB.
