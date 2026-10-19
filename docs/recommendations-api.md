# Smart Property Discovery & Recommendation Engine API Specs (`/api/v1`)

## Overview
Phase 16 delivers a deterministic, explainable weighted scoring recommendation engine (`recommendation-v1`) incorporating location match (25%), price budget (20%), property type (15%), BHK configuration (10%), amenities (10%), carpet area (5%), furnishing (5%), purpose (5%), freshness (3%), and verification trust (2%).

---

## 1. Personalized Recommendation Feed
`GET /api/v1/recommendations?limit=12`  
**Authentication:** Optional (`Bearer JWT` if authenticated; guest fallback if unauthenticated)

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "algorithmVersion": "recommendation-v1",
    "items": [
      {
        "property": {
          "id": "clx_prop_123",
          "title": "3 BHK Lakeview Apartment in Powai",
          "slug": "3-bhk-lakeview-powai",
          "price": 24500000,
          "city": { "name": "Mumbai" }
        },
        "score": 95,
        "reasons": [
          "Fits directly within your budget range",
          "Matches your preferred 3 BHK requirement",
          "In your preferred city (Mumbai)"
        ]
      }
    ],
    "generatedAt": "2026-02-18T12:00:00.000Z"
  }
}
```

---

## 2. Similar Properties
`GET /api/v1/recommendations/properties/:id/similar?limit=4`  
**Authentication:** Public

---

## 3. User Property Preferences
`GET /api/v1/recommendations/preferences` — Get explicit preferences.  
`PATCH /api/v1/recommendations/preferences` — Save/update explicit preferences.

---

## 4. Recommendation Feedback
`POST /api/v1/recommendations/feedback`

#### Request Body
```json
{
  "propertyId": "clx_prop_123",
  "feedback": "NOT_INTERESTED"
}
```
*Note: Excludes dismissed properties from future personalized feeds.*
