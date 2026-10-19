# Maps, Geocoding & Spatial Search API Specs (`/api/v1`)

## Overview
Phase 15 implements provider-agnostic geocoding, autocomplete, map bounding box filtering, and radius distance search for `housing-clone`.

---

## 1. Forward Geocoding & Autocomplete
`GET /api/v1/geocoding/search?q=Powai`  
**Authentication:** Public

#### Response (200 OK)
```json
{
  "success": true,
  "data": [
    {
      "label": "Powai, Mumbai",
      "latitude": 19.1176,
      "longitude": 72.906,
      "city": "Mumbai",
      "locality": "Powai",
      "formattedAddress": "Powai, Mumbai, Maharashtra, India"
    }
  ]
}
```

---

## 2. Reverse Geocoding
`GET /api/v1/geocoding/reverse?lat=19.1176&lng=72.906`  
**Authentication:** Public

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "label": "Powai, Mumbai",
    "latitude": 19.1176,
    "longitude": 72.906,
    "city": "Mumbai",
    "locality": "Powai",
    "formattedAddress": "Powai Lake Road, Powai, Mumbai, Maharashtra, India"
  }
}
```

---

## 3. Map Bounds & Radius Search
`GET /api/v1/search/properties?minLat=18.0&maxLat=20.0&minLng=71.0&maxLng=74.0`  
`GET /api/v1/search/properties?lat=19.1176&lng=72.906&radiusKm=10&sortBy=distance_asc`  
**Authentication:** Public

#### Response (200 OK)
Returns property search summaries filtered within map boundaries or radius with distance calculation.
