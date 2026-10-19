# Full-Scale Real-Estate Marketplace (`housing-clone`)

Production-ready, full-scale real-estate marketplace inspired by the information architecture and user experience of Housing.com. Built with an original implementation, red primary brand design (`#DC2626`), modular REST API, relational MySQL schema via Prisma ORM, and scalable domain architecture.

---

## Technical Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS (`#DC2626` / `#E11D48` primary theme), React Router v6, TanStack Query v5, Zustand, Lucide React, Leaflet/Mapbox provider interface.
- **Backend:** Node.js, TypeScript, Express, Zod, Pino Logger, Helmet, CORS, Rate Limiter, AsyncLocalStorage request ID tracing.
- **Database:** MySQL Server 8.0+ (`127.0.0.1:3306`), Prisma ORM (35 relational entities, 16 domain enums).
- **Media:** S3-compatible Object Storage (AWS S3 / Cloudflare R2 / MinIO).
- **Search:** SearchService abstraction layer (MySQL Spatial & Indexing initially, Elasticsearch/OpenSearch ready).
- **Shared:** Shared TypeScript interfaces, domain enums, and Zod validation schemas.

---

## Repository Structure

```
housing-clone/
├── frontend/             # React + Vite SPA frontend
├── backend/              # Node.js + Express REST API
├── shared/               # Shared types, enums, validation schemas
├── prisma/
│   ├── schema.prisma     # Production MySQL schema (35 entities, 16 enums)
│   ├── seed.ts           # Development seed script (States, Cities, Amenities, Users, Properties)
│   └── migrations/       # Database migration history
├── docs/                 # Documentation and specs
├── docker-compose.yml    # Optional local services (MinIO)
├── .env.example          # Environment variable template
└── package.json          # Monorepo workspaces configuration
```

---

## Database Configuration & Prerequisites

1. **MySQL Server:** Must be running locally on `127.0.0.1:3306`.
2. **Environment File (`.env`):**
   In the root `.env` file, configure `DATABASE_URL` with your local MySQL user credentials:
   ```env
   DATABASE_URL="mysql://root:YOUR_ACTUAL_PASSWORD@127.0.0.1:3306/housing_clone"
   ```
3. **Execute Migration & Database Seeding:**
   ```bash
   npx prisma migrate dev --name init_housing_clone
   npx prisma db seed
   ```

---

## Development Commands

| Command | Action |
| :--- | :--- |
| `npm run dev` | Run both frontend and backend concurrently |
| `npm run build` | Build shared, backend, and frontend packages |
| `npm run typecheck` | Run TypeScript compiler checks across monorepo |
| `npm run lint` | Run ESLint checks |
| `npm run format` | Format code with Prettier |
| `npm run test` | Run frontend and backend test suites |
| `npm run prisma:validate` | Validate Prisma schema syntax and relations |
| `npm run prisma:generate` | Generate Prisma Client |
| `npm run prisma:migrate` | Run Prisma database migrations |
| `npm run prisma:seed` | Seed development database with baseline data |

---

## Phase Status

- [x] **Phase 1:** Repository Foundation, Monorepo Workspace & Development Tooling
- [x] **Phase 2:** Local MySQL Setup, Prisma Schema (35 Models, 16 Enums), Migrations & Seed Script Ready
- [ ] **Phase 3:** Authentication Engine, JWT, OTP & RBAC Middlewares
- [ ] **Phase 4:** Locations, Property Types, Amenities & Core Domain Models
- [ ] **Phase 5:** Property Search Engine, Multi-Criteria Filtering & Pagination
- [ ] **Phase 6:** Media Direct-to-S3 Upload Service & Presigned URLs
- [ ] **Phase 7:** 7-Step Post Property Wizard Flow
- [ ] **Phase 8:** Red Brand Housing.com Homepage UI & Search Results Page
- [ ] **Phase 9:** Property Detail Page & Interactive Location Map
- [ ] **Phase 10:** Favorites, Saved Searches & Browsing History
- [ ] **Phase 11:** Buyer Enquiries, Seller Lead CRM & Visit Scheduler
- [ ] **Phase 12:** Owner, Agent & Developer Dashboards
- [ ] **Phase 13:** Admin Moderation Portal & Audit Logging
- [ ] **Phase 14:** Payments, Listing Packages & Subscriptions
- [ ] **Phase 15:** SEO Optimization & Structured Data
- [ ] **Phase 16:** Security Hardening & Integration Tests
- [ ] **Phase 17:** Production Deployment Readiness
