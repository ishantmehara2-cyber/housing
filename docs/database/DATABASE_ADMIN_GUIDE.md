# 🛠️ Housing Clone — Admin Database Management Guide

This guide explains how administrators manage changeable platform data through the **Admin Portal** (`/admin`).

---

## 1. Administrative Security & Authorization

Access to database management features is restricted to authenticated users with privileged roles:
- **`ADMIN` / `SUPER_ADMIN`**: Full read, write, update, and deactivation permissions across all database domains.
- **`MODERATOR`**: Verification review, report resolution, and property moderation permissions.

All administrative mutations generate immutable records in the `audit_logs` table containing:
- Admin `userId`
- Specific action string (e.g., `CITY_CREATED`, `PACKAGE_UPDATED`)
- Target entity and entity ID
- Payload metadata
- IP address

---

## 2. Managing Platform Catalogs

### A. Location Hierarchy (`/admin/locations`)
1. **Adding a State**: Click **Add State**, enter name & 2-letter code (e.g., `Maharashtra`, `MH`).
2. **Adding a City**: Click **Add City**, select parent State, enter name & URL slug.
3. **Adding a Locality**: Select target City, click **Add Locality**, enter name, pincode, and coordinates.
4. **Adding a SubLocality**: Select target Locality, click **Add Sub-Locality**, enter sub-sector name.
5. **Activating/Deactivating**: Toggle the status icon to activate/deactivate cities without deleting existing properties.

### B. Property Types & Categories (`/admin/property-types`)
- Create new property classifications (`Studio Apartment`, `Penthouse`, `Commercial Shop`).
- Select category (`RESIDENTIAL`, `COMMERCIAL`, `AGRICULTURAL`, `INDUSTRIAL`).

### C. Amenities Catalog (`/admin/amenities`)
- Add or edit amenities (`EV Charging Station`, `Infinity Pool`, `24/7 Security`).
- Categorize amenities for organized property listing forms.

### D. Monetization Packages (`/admin/packages`)
- Configure seller subscription plans (`name`, `price`, `validityDays`, `maxListings`, `featuredListingsCount`).
- Adjust pricing or listing limits in real-time. The updated pricing instantly reflects on the public `/packages` pricing page without code changes.

---

## 3. Managing Content & System Configuration

### A. CMS & Managed Pages (`/admin/cms`)
- Edit copy and SEO metadata for static pages (`terms`, `privacy`, `about`, `safety`).
- Content changes take effect immediately across public frontend pages.

### B. Feature Flags (`/admin/feature-flags`)
- Enable or disable marketplace features dynamically (`recommendations_feed`, `instant_whatsapp_leads`).

### C. System Settings (`/admin/settings`)
- Update global platform configuration (`platform_name`, `support_email`, `currency_symbol`, `maintenance_mode`).
