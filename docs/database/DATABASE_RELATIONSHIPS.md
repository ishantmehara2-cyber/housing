# 🔗 Housing Clone — Relational Architecture & Foreign Key Flow Guide

This document explains the relational connections, foreign keys, and business cardinalities across all database domains in the Housing Clone platform.

---

## 1. Geographic Location Cascade (`State → City → Locality → SubLocality`)

```
State (1)
  └─► City (N) [Foreign Key: cities.stateId → states.id]
        └─► Locality (N) [Foreign Key: localities.cityId → cities.id]
              └─► SubLocality (N) [Foreign Key: sub_localities.localityId → localities.id]
```

### Business Rules:
- Deleting or deactivating a `State` restricts or soft-deactivates all child `City` records.
- Properties store explicit foreign keys to `cityId`, `localityId`, and optional `subLocalityId` for fast indexing and spatial search performance.

---

## 2. Property Listing & Media Architecture (`User → Property → Media/Amenities`)

```
User (Owner/Agent) [1]
  └─► Property [N] [Foreign Key: properties.ownerId → users.id]
        ├──► PropertyMedia [N] [Foreign Key: property_media.propertyId → properties.id]
        ├──► PropertyAmenity [N] [Foreign Key: property_amenities.propertyId → properties.id]
        │       └─► Amenity [1] [Foreign Key: property_amenities.amenityId → amenities.id]
        └──► PropertyType [1] [Foreign Key: properties.propertyTypeId → property_types.id]
```

### Business Rules:
- Deleting a `Property` cascades deletion to its associated `property_media` records and `property_amenities` junction entries.
- `Property` records enforce foreign key RESTRICT constraints on `PropertyType`, `City`, and `Locality` to prevent orphan properties if a category or location is deleted.

---

## 3. CRM Lead & Visit Lifecycle (`Property → Enquiry → Lead → Visit`)

```
Property (1)
  ├──► Enquiry (N) [Foreign Key: enquiries.propertyId → properties.id]
  ├──► Lead (N) [Foreign Key: leads.propertyId → properties.id]
  └──► PropertyVisit (N) [Foreign Key: property_visits.propertyId → properties.id]
```

### Business Rules:
- When a buyer submits an inquiry, an `Enquiry` record is created and automatically converted into a CRM `Lead` for the owner/agent.
- Site visits (`PropertyVisit`) link to both the visitor (`visitorUserId`) and the target `propertyId`.

---

## 4. Monetization & Billing Flow (`Package → Subscription → Transaction → Invoice`)

```
Package (1)
  └─► Subscription (N) [Foreign Key: subscriptions.packageId → packages.id]
        └─► Transaction [Foreign Key: transactions.userId & packageId]
              └─► Invoice (1:1) [Foreign Key: invoices.transactionId → transactions.id]
```

### Business Rules:
- A `Transaction` is created when a user initiates a package purchase via Razorpay.
- Upon successful signature verification, an `Invoice` is generated with a unique invoice number, and an active `Subscription` record is granted to the user.
