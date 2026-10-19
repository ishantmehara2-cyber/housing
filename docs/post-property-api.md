# Post Property Draft & 7-Step Listing Wizard API Specs (`/api/v1/properties/drafts`)

## Overview
The Post Property Draft & Submission Engine provides server-persisted draft management, debounced autosave, and atomic listing submission for the 7-step interactive wizard.

---

## Endpoints

### 1. Create Initial Draft
`POST /api/v1/properties/drafts`  
**Authentication:** Required (`Bearer JWT` / Owner, Agent, Developer, Admin)  
**Forbidden:** `TENANT_BUYER`, `VISITOR` (HTTP 403)

#### Request Body
```json
{
  "listingPurpose": "BUY",
  "propertyCategory": "RESIDENTIAL",
  "propertyTypeId": "apartment"
}
```

#### Response (201 Created)
```json
{
  "success": true,
  "data": {
    "id": "clx_draft_123",
    "title": "Draft BUY Apartment",
    "slug": "draft-usr_456-177123456",
    "listingPurpose": "BUY",
    "propertyCategory": "RESIDENTIAL",
    "listingState": "DRAFT",
    "completedStep": 1
  }
}
```

---

### 2. Debounced Autosave / Update Draft
`PATCH /api/v1/properties/drafts/:id`  
**Authentication:** Required (Owner/Author of draft or Admin)

#### Request Body
```json
{
  "title": "3 BHK Lakeview Apartment in Powai",
  "bhk": 3,
  "bedrooms": 3,
  "bathrooms": 3,
  "carpetArea": 1250,
  "areaUnit": "SQFT",
  "price": 24500000,
  "furnishing": "SEMI_FURNISHED",
  "address": "Tower A, Apex Horizon Heights",
  "cityId": "c1",
  "localityId": "l1",
  "amenityIds": ["amenity_lift", "amenity_pool"],
  "completedStep": 5
}
```

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "id": "clx_draft_123",
    "title": "3 BHK Lakeview Apartment in Powai",
    "price": 24500000,
    "completedStep": 5
  }
}
```

---

### 3. Get Active User Drafts
`GET /api/v1/properties/drafts`  
**Authentication:** Required

---

### 4. Submit Draft Listing for Approval
`POST /api/v1/properties/drafts/:id/submit`  
**Authentication:** Required (Owner/Author of draft or Admin)

#### Action Performed (Atomic DB Transaction):
1. Validates that draft title is filled, location is valid, and at least 1 image is uploaded.
2. Generates deterministic SEO-friendly slug e.g. `3-bhk-apartment-powai-mumbai-cuid`.
3. Sets `listingState = PENDING_APPROVAL` (Normal users CANNOT bypass moderation to `ACTIVE`).
4. Sets `verificationState = PENDING`.
5. Records `AuditLog` entry `PROPERTY_SUBMITTED_FOR_APPROVAL`.

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Property submitted successfully and is pending approval",
  "data": {
    "id": "clx_draft_123",
    "title": "3 BHK Lakeview Apartment in Powai",
    "slug": "3-bhk-apartment-in-powai-mumbai-cuid123",
    "listingState": "PENDING_APPROVAL",
    "verificationState": "PENDING"
  }
}
```
