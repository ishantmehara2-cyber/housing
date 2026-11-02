# 📖 Housing Clone — Complete MySQL Data Dictionary

This document details all **39 database tables** and columns in the Housing Clone MySQL database.

---

## Table 1: `users`
**Purpose**: Stores user profiles, authentication credentials, RBAC roles, contact verification statuses, and account state.

| Column Name | Data Type | Nullable | Key | Default Value | Description |
|---|---|---|---|---|---|
| `id` | VARCHAR(191) | NO | PRI | CUID | Primary Key. Unique identifier for the user. |
| `email` | VARCHAR(191) | YES | UNI | NULL | Unique user email address. |
| `phone` | VARCHAR(191) | YES | UNI | NULL | Unique user mobile phone number. |
| `passwordHash` | VARCHAR(191) | YES | — | NULL | Bcrypt hashed password string. |
| `firstName` | VARCHAR(191) | NO | — | — | First name of the user. |
| `lastName` | VARCHAR(191) | NO | — | — | Last name of the user. |
| `avatarUrl` | VARCHAR(191) | YES | — | NULL | S3 URL or path to user profile image. |
| `role` | ENUM | NO | — | TENANT_BUYER | User RBAC Role (`TENANT_BUYER`, `OWNER`, `AGENT`, `DEVELOPER`, `MODERATOR`, `ADMIN`, `SUPER_ADMIN`). |
| `status` | ENUM | NO | — | ACTIVE | User account status (`PENDING`, `ACTIVE`, `SUSPENDED`, `DELETED`). |
| `emailVerified` | BOOLEAN | NO | — | false | True if user email address is verified. |
| `phoneVerified` | BOOLEAN | NO | — | false | True if user mobile phone is verified. |
| `createdAt` | DATETIME | NO | — | CURRENT_TIMESTAMP | Account creation timestamp. |
| `updatedAt` | DATETIME | NO | — | — | Account last modification timestamp. |

---

## Table 2: `states`
**Purpose**: Top-level state administrative records for the location hierarchy.

| Column Name | Data Type | Nullable | Key | Default Value | Description |
|---|---|---|---|---|---|
| `id` | VARCHAR(191) | NO | PRI | CUID | Primary Key. Unique state identifier. |
| `name` | VARCHAR(191) | NO | UNI | — | Name of the state (e.g., Maharashtra, Karnataka). |
| `code` | VARCHAR(191) | NO | UNI | — | ISO / Postal state code (e.g., MH, KA, DL). |

---

## Table 3: `cities`
**Purpose**: Cities associated with a state, containing lat/lng center coordinates, popular flags, and active toggle flags.

| Column Name | Data Type | Nullable | Key | Default Value | Description |
|---|---|---|---|---|---|
| `id` | VARCHAR(191) | NO | PRI | CUID | Primary Key. Unique city identifier. |
| `name` | VARCHAR(191) | NO | — | — | Display name of the city (e.g., Mumbai, Pune, Bengaluru). |
| `slug` | VARCHAR(191) | NO | UNI | — | URL-friendly unique slug (e.g., `mumbai`, `pune`). |
| `stateId` | VARCHAR(191) | NO | MUL | — | Foreign Key referencing `states.id`. |
| `latitude` | DOUBLE | NO | — | — | Latitude coordinate of city center. |
| `longitude` | DOUBLE | NO | — | — | Longitude coordinate of city center. |
| `isPopular` | BOOLEAN | NO | — | false | True if city is featured on homepage and popular lists. |
| `isActive` | BOOLEAN | NO | — | true | True if city is active for property listings and searches. |

---

## Table 4: `localities`
**Purpose**: City localities/neighborhoods with pincodes and geographic coordinates.

| Column Name | Data Type | Nullable | Key | Default Value | Description |
|---|---|---|---|---|---|
| `id` | VARCHAR(191) | NO | PRI | CUID | Primary Key. Unique locality identifier. |
| `cityId` | VARCHAR(191) | NO | MUL | — | Foreign Key referencing `cities.id`. |
| `name` | VARCHAR(191) | NO | — | — | Display name of locality (e.g., Andheri, Powai, Bandra). |
| `slug` | VARCHAR(191) | NO | — | — | URL-friendly locality slug. |
| `pincode` | VARCHAR(191) | YES | — | NULL | Postal pincode string (e.g., `400076`). |
| `latitude` | DOUBLE | NO | — | — | Latitude coordinate of locality center. |
| `longitude` | DOUBLE | NO | — | — | Longitude coordinate of locality center. |

---

## Table 5: `sub_localities`
**Purpose**: Sub-sectors, landmarks, or complexes within a locality.

| Column Name | Data Type | Nullable | Key | Default Value | Description |
|---|---|---|---|---|---|
| `id` | VARCHAR(191) | NO | PRI | CUID | Primary Key. Unique sub-locality identifier. |
| `localityId` | VARCHAR(191) | NO | MUL | — | Foreign Key referencing `localities.id`. |
| `name` | VARCHAR(191) | NO | — | — | Display name (e.g., Hiranandani Gardens, Lokhandwala). |
| `slug` | VARCHAR(191) | NO | — | — | URL-friendly sub-locality slug. |
| `latitude` | DOUBLE | NO | — | — | Latitude coordinate of sub-locality center. |
| `longitude` | DOUBLE | NO | — | — | Longitude coordinate of sub-locality center. |

---

## Table 6: `property_types`
**Purpose**: Property classification catalog.

| Column Name | Data Type | Nullable | Key | Default Value | Description |
|---|---|---|---|---|---|
| `id` | VARCHAR(191) | NO | PRI | CUID | Primary Key. Unique property type identifier. |
| `name` | VARCHAR(191) | NO | — | — | Name of property type (e.g., Apartment, Villa, Plot). |
| `slug` | VARCHAR(191) | NO | UNI | — | URL-friendly unique slug. |
| `category` | ENUM | NO | — | — | High-level category (`RESIDENTIAL`, `COMMERCIAL`, `AGRICULTURAL`, `INDUSTRIAL`). |
| `icon` | VARCHAR(191) | YES | — | NULL | Icon identifier string for UI rendering. |

---

## Table 7: `properties`
**Purpose**: Core real estate property listing entity containing all property specifications, pricing, location references, owner links, and lifecycle states.

| Column Name | Data Type | Nullable | Key | Default Value | Description |
|---|---|---|---|---|---|
| `id` | VARCHAR(191) | NO | PRI | CUID | Primary Key. Unique property identifier. |
| `title` | VARCHAR(191) | NO | — | — | Title of property listing. |
| `slug` | VARCHAR(191) | NO | UNI | — | SEO-optimized unique URL slug. |
| `description` | TEXT | NO | — | — | Full property text description. |
| `listingPurpose` | ENUM | NO | — | — | Transaction purpose (`BUY`, `RENT`, `COMMERCIAL`, `PG_COLIVING`, `PLOT`). |
| `propertyCategory` | ENUM | NO | — | — | High-level category. |
| `propertyTypeId` | VARCHAR(191) | NO | MUL | — | Foreign Key referencing `property_types.id`. |
| `ownerId` | VARCHAR(191) | NO | MUL | — | Foreign Key referencing `users.id` (Property Owner). |
| `postedByUserId` | VARCHAR(191) | NO | MUL | — | Foreign Key referencing `users.id` (Listing Poster). |
| `postedByRole` | ENUM | NO | — | — | Role of poster (`OWNER`, `AGENT`, `DEVELOPER`). |
| `assignedAgentId` | VARCHAR(191) | YES | MUL | NULL | Foreign Key referencing `users.id` (Assigned Agent). |
| `price` | DECIMAL(14,2) | YES | — | NULL | Total sale price in INR. |
| `rent` | DECIMAL(12,2) | YES | — | NULL | Monthly rent in INR. |
| `securityDeposit` | DECIMAL(12,2) | YES | — | NULL | Security deposit amount in INR. |
| `maintenanceFee` | DECIMAL(10,2) | YES | — | NULL | Monthly maintenance fee in INR. |
| `bhk` | INT | YES | — | NULL | BHK bedroom configuration (1, 2, 3, 4, 5+). |
| `bedrooms` | INT | YES | — | NULL | Total bedrooms count. |
| `bathrooms` | INT | YES | — | NULL | Total bathrooms count. |
| `balconies` | INT | YES | — | NULL | Total balconies count. |
| `carpetArea` | DECIMAL(10,2) | NO | — | — | Carpet area value. |
| `builtUpArea` | DECIMAL(10,2) | YES | — | NULL | Built-up area value. |
| `areaUnit` | ENUM | NO | — | SQFT | Unit of area (`SQFT`, `SQYD`, `ACRE`, `HECTARE`). |
| `furnishing` | ENUM | NO | — | UNFURNISHED | Furnishing state (`UNFURNISHED`, `SEMI_FURNISHED`, `FULLY_FURNISHED`). |
| `floorNumber` | INT | YES | — | NULL | Floor number of unit. |
| `totalFloors` | INT | YES | — | NULL | Total building floors count. |
| `facing` | ENUM | YES | — | NULL | Orientation direction (`EAST`, `WEST`, `NORTH`, etc.). |
| `propertyAge` | ENUM | YES | — | NULL | Construction age classification. |
| `possessionStatus` | ENUM | YES | — | NULL | Move-in state (`READY_TO_MOVE`, `UNDER_CONSTRUCTION`). |
| `possessionDate` | DATETIME | YES | — | NULL | Possession or availability date. |
| `address` | VARCHAR(191) | NO | — | — | Full street address line. |
| `landmark` | VARCHAR(191) | YES | — | NULL | Nearby landmark text. |
| `pincode` | VARCHAR(191) | YES | — | NULL | Postal pincode string. |
| `cityId` | VARCHAR(191) | NO | MUL | — | Foreign Key referencing `cities.id`. |
| `localityId` | VARCHAR(191) | NO | MUL | — | Foreign Key referencing `localities.id`. |
| `subLocalityId` | VARCHAR(191) | YES | MUL | NULL | Foreign Key referencing `sub_localities.id`. |
| `latitude` | DOUBLE | NO | — | — | Exact map pin latitude coordinate. |
| `longitude` | DOUBLE | NO | — | — | Exact map pin longitude coordinate. |
| `verificationState` | ENUM | NO | — | UNVERIFIED | Moderation state (`UNVERIFIED`, `PENDING`, `VERIFIED`, `REJECTED`). |
| `listingState` | ENUM | NO | — | DRAFT | Publication state (`DRAFT`, `PENDING_APPROVAL`, `ACTIVE`, `REJECTED`, etc.). |
| `completedStep` | INT | NO | — | 1 | Wizard draft step completion indicator (1 to 7). |
| `viewsCount` | INT | NO | — | 0 | Total page view count. |
| `rejectionReason` | TEXT | YES | — | NULL | Moderation rejection reason if rejected. |
| `createdAt` | DATETIME | NO | — | CURRENT_TIMESTAMP | Property creation timestamp. |
| `updatedAt` | DATETIME | NO | — | — | Property last update timestamp. |

---

## Table 8: `amenities`
**Purpose**: Standardized amenity catalog.

| Column Name | Data Type | Nullable | Key | Default Value | Description |
|---|---|---|---|---|---|
| `id` | VARCHAR(191) | NO | PRI | CUID | Primary Key. Unique amenity identifier. |
| `name` | VARCHAR(191) | NO | — | — | Amenity display name. |
| `slug` | VARCHAR(191) | NO | UNI | — | URL-friendly unique slug. |
| `category` | VARCHAR(191) | NO | — | GENERAL | Amenity category group (e.g., SECURITY, RECREATION). |
| `icon` | VARCHAR(191) | YES | — | NULL | Icon string identifier. |

---

## Table 9: `property_amenities`
**Purpose**: Many-to-many junction table mapping properties to amenities.

| Column Name | Data Type | Nullable | Key | Default Value | Description |
|---|---|---|---|---|---|
| `id` | VARCHAR(191) | NO | PRI | CUID | Primary Key. |
| `propertyId` | VARCHAR(191) | NO | MUL | — | Foreign Key referencing `properties.id`. |
| `amenityId` | VARCHAR(191) | NO | MUL | — | Foreign Key referencing `amenities.id`. |

---

## Table 10: `property_media`
**Purpose**: Property photos, floor plans, videos, and virtual tours stored on AWS S3.

| Column Name | Data Type | Nullable | Key | Default Value | Description |
|---|---|---|---|---|---|
| `id` | VARCHAR(191) | NO | PRI | CUID | Primary Key. |
| `propertyId` | VARCHAR(191) | NO | MUL | — | Foreign Key referencing `properties.id`. |
| `url` | VARCHAR(191) | NO | — | — | S3 file URL or storage path. |
| `mediaType` | ENUM | NO | — | IMAGE | Media category (`IMAGE`, `VIDEO`, `FLOOR_PLAN`, `VIRTUAL_TOUR`). |
| `caption` | VARCHAR(191) | YES | — | NULL | Optional media caption or label. |
| `displayOrder` | INT | NO | — | 0 | Display sorting index. |

---

## Additional Core Tables Summary

- **`packages`**: Stores monetization packages (`name`, `price`, `validityDays`, `maxListings`, `featuredListingsCount`, `isActive`).
- **`subscriptions`**: Active package subscriptions linked to `users.id` and `packages.id`.
- **`transactions`**: Payment transactions storing `razorpayOrderId`, `razorpayPaymentId`, `amount`, `status`.
- **`invoices`**: Billing invoices with formatted invoice numbers linked to transactions.
- **`audit_logs`**: Immutable admin audit logs storing `userId`, `action`, `entity`, `entityId`, `payload`, `ipAddress`.
- **`cms_contents`**: CMS articles and managed page copy (`slug`, `title`, `content`, `metaTitle`, `metaDesc`).
- **`feature_flags`**: System feature toggles (`key`, `description`, `isEnabled`).
- **`system_settings`**: Platform key-value settings (`key`, `value`).
