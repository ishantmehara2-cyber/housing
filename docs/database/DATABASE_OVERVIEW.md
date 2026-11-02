# 🏛️ Housing Clone — MySQL Database System Overview

## 1. Executive Summary & Purpose
The **Housing Clone** real estate platform relies on **MySQL 8.0** as its single, unified source of truth for all business data, user accounts, property listings, pricing models, content management, location hierarchies, and system configuration. 

No changeable business logic or static option datasets are hardcoded in the frontend applications. Every selectable option (cities, localities, sub-localities, property types, categories, packages, amenities, feature flags, and site settings) is retrieved dynamically through type-safe REST APIs backed by MySQL via **Prisma ORM**.

---

## 2. Technical Architecture & Communication Flow

```
┌─────────────────────────────────────────────────────────┐
│                    REACT FRONTEND                       │
│    (TypeScript, Vite, Tailwind CSS, Zustand, React Query)│
└────────────────────────────┬────────────────────────────┘
                             │ REST API (JSON / Bearer JWT)
                             ▼
┌─────────────────────────────────────────────────────────┐
│                    EXPRESS BACKEND                      │
│    (TypeScript, Node.js, Express Router, Pino Logger)   │
└────────────────────────────┬────────────────────────────┘
                             │ Type-Safe Queries (Prisma ORM)
                             ▼
┌─────────────────────────────────────────────────────────┐
│                     MYSQL DATABASE                      │
│    (39 Normalized Tables: Users, Locations, Properties, │
│     Leads, Subscriptions, Audit Logs, Analytics)        │
└────────────────────────────┴────────────────────────────┘
```

### Communication Principles:
1. **Zero Client-Side Direct Database Access**: The React frontend communicates strictly through backend REST API endpoints (`/api/v1/...`).
2. **Type Safety Across Layers**: Shared TypeScript interfaces and Zod validation schemas (`@housing-clone/shared`) guarantee strict alignment between MySQL database types, Express controllers, and React UI components.
3. **Admin Panel Governance**: Any change made by an Admin (e.g., adding a city, updating a seller package price, or toggling a feature flag) is committed to MySQL and immediately reflected across all public user interfaces without rebuilding or redeploying code.

---

## 3. Database Summary Statistics
- **Database Engine**: MySQL 8.0 (InnoDB Storage Engine with ACID transactions)
- **ORM / Migration Tool**: Prisma ORM v5
- **Total Tables / Models**: **39 Normalized Tables**
- **Total Standardized Enums**: **16 Enums**
- **Primary Key Strategy**: CUID (Collision-resistant Unique Identifiers) for high security and distributed scalability
- **Database Excel Export**: `docs/database/mysql_database_schema.xlsx`

---

## 4. Key Business Domains & Table Groupings

| # | Business Domain | Tables Included | Primary Responsibility |
|---|---|---|---|
| **1** | **User & Auth** | `users`, `user_sessions`, `otp_verifications` | User registration, authentication, RBAC authorization, session management, and OTP verification. |
| **2** | **Location Hierarchy** | `states`, `cities`, `localities`, `sub_localities` | 4-tier database-backed geographic hierarchy with coordinates and pincodes. |
| **3** | **Property Catalogs** | `property_types`, `amenities` | Property classification and standardized amenity catalogs. |
| **4** | **Properties & Media** | `properties`, `property_media`, `property_amenities` | Property listing details, prices, step completion states, S3 media links, and amenities. |
| **5** | **Developers & Projects** | `developer_organizations`, `developer_members`, `projects`, `project_media`, `project_amenities` | Builder profiles, major township project listings, brochures, and amenities. |
| **6** | **User Engagement** | `favorites`, `saved_searches`, `recently_viewed` | Bookmarks, saved search filters with alerts, and browsing history. |
| **7** | **Leads & Communication**| `enquiries`, `leads`, `property_visits`, `notifications` | Direct messages, CRM sales pipeline leads, scheduled site visits, and alert queues. |
| **8** | **Monetization & Billing**| `packages`, `subscriptions`, `transactions`, `invoices`, `refunds`, `payment_webhook_events` | Seller plans, Razorpay payments, subscriptions, invoices, and webhook logs. |
| **9** | **Moderation & Safety**| `reports`, `property_verifications`, `audit_logs` | User report queue, moderator verification notes, and immutable admin audit logs. |
| **10**| **CMS & System Config** | `cms_contents`, `feature_flags`, `system_settings`, `analytics_events`, `user_property_preferences`, `recommendation_feedbacks` | Dynamic terms/privacy pages, platform feature flags, brand settings, analytics stream, and Smart Discovery feed vectors. |
