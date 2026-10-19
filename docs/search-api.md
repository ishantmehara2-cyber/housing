# Property Search API Specifications (`GET /api/v1/search/properties`)

## Overview
The property search endpoint provides multi-criteria property discovery and filtering backed by MySQL index-optimized queries via Prisma ORM.

---

## Endpoint
`GET /api/v1/search/properties`

---

## Query Parameters

| Parameter | Type | Description | Example |
| :--- | :--- | :--- | :--- |
| `q` | `string` | Free text search in title, description, address, landmark, locality, city, project | `Powai` |
| `city` | `string` | City slug | `mumbai` |
| `locality` | `string` | Locality slug | `powai` |
| `subLocality` | `string` | Sub-locality slug | `hiranandani-gardens` |
| `listingPurpose` | `enum` | Purpose (`BUY`, `RENT`, `COMMERCIAL`, `PG_COLIVING`, `PLOT`) | `BUY` |
| `propertyCategory` | `enum` | Category (`RESIDENTIAL`, `COMMERCIAL`, `AGRICULTURAL`, `INDUSTRIAL`) | `RESIDENTIAL` |
| `propertyType` | `string` | Property type slug or comma-separated list | `apartment` |
| `minPrice` | `number` | Minimum sale price in INR | `5000000` |
| `maxPrice` | `number` | Maximum sale price in INR | `15000000` |
| `bhk` | `number` | Number of BHK bedrooms | `2` |
| `minCarpetArea` | `number` | Minimum carpet area | `800` |
| `maxCarpetArea` | `number` | Maximum carpet area | `1500` |
| `furnishing` | `enum` | Furnishing status (`UNFURNISHED`, `SEMI_FURNISHED`, `FULLY_FURNISHED`) | `FULLY_FURNISHED` |
| `amenities` | `string` | Comma-separated amenity slugs | `lift,swimming-pool` |
| `amenityMode` | `enum` | Amenity matching mode (`all` or `any`, default `all`) | `all` |
| `verificationState`| `enum` | Verification state (`VERIFIED`, `PENDING`, `UNVERIFIED`) | `VERIFIED` |
| `minLat` / `maxLat` | `number` | Latitude range (-90 to 90) for bounding-box search | `18.5` to `19.2` |
| `minLng` / `maxLng` | `number` | Longitude range (-180 to 180) for bounding-box search | `72.8` to `73.1` |
| `sortBy` | `enum` | Sort order (`relevance`, `newest`, `price_asc`, `price_desc`, `area_asc`, `area_desc`) | `price_asc` |
| `page` | `number` | Page number (default: `1`) | `1` |
| `limit` | `number` | Results per page (default: `20`, max: `50`) | `20` |

---

## Response Contract

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "clx...",
        "title": "Luxurious 3 BHK Apartment with Lake View",
        "slug": "luxurious-3bhk-apartment-powai-mumbai",
        "listingPurpose": "BUY",
        "propertyCategory": "RESIDENTIAL",
        "propertyType": {
          "id": "pt_123",
          "name": "Apartment",
          "slug": "apartment",
          "category": "RESIDENTIAL",
          "icon": "building"
        },
        "price": 24500000,
        "carpetArea": 1250,
        "areaUnit": "SQFT",
        "bhk": 3,
        "bedrooms": 3,
        "bathrooms": 3,
        "furnishing": "SEMI_FURNISHED",
        "address": "Tower A, Apex Horizon Heights, Powai",
        "city": { "id": "c1", "name": "Mumbai", "slug": "mumbai" },
        "locality": { "id": "l1", "name": "Powai", "slug": "powai" },
        "primaryImage": {
          "id": "pm_1",
          "mediaType": "IMAGE",
          "url": "https://images.unsplash.com/...",
          "thumbnailUrl": "https://images.unsplash.com/..."
        },
        "verificationState": "VERIFIED",
        "listingState": "ACTIVE",
        "isFeatured": true,
        "createdAt": "2026-02-18T12:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "totalPages": 1,
      "hasNextPage": false,
      "hasPreviousPage": false
    },
    "appliedFilters": {
      "city": "mumbai",
      "listingPurpose": "BUY",
      "bhk": 3
    }
  }
}
```
