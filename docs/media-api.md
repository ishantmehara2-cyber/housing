# Media Management & Direct-to-S3 Upload API Specs (`/api/v1/media`)

## Overview
The media management system enables secure, direct browser-to-S3 object storage uploads using 15-minute presigned PUT URLs, preventing backend bandwidth bottlenecks and ensuring zero binary blob storage in MySQL.

---

## Endpoints

### 1. Request Presigned Upload URL
`POST /api/v1/media/presign`  
**Authentication:** Required (`Bearer JWT` / Owner, Agent, Developer, Admin)

#### Request Body
```json
{
  "resourceType": "PROPERTY",
  "resourceId": "clx_prop_123",
  "mediaType": "IMAGE",
  "fileName": "living_room.jpg",
  "contentType": "image/jpeg",
  "fileSize": 2048000,
  "caption": "Spacious Living Room"
}
```

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "uploadId": "upload_uuid_123",
    "objectKey": "properties/clx_prop_123/image/uuid-123.jpg",
    "uploadUrl": "http://127.0.0.1:9000/housing-media/properties/clx_prop_123/image/uuid-123.jpg?X-Amz-Algorithm=...",
    "expiresIn": 900
  }
}
```

---

### 2. Complete Upload & Persist Metadata
`POST /api/v1/media/complete`  
**Authentication:** Required

#### Request Body
```json
{
  "resourceType": "PROPERTY",
  "resourceId": "clx_prop_123",
  "mediaType": "IMAGE",
  "objectKey": "properties/clx_prop_123/image/uuid-123.jpg",
  "url": "http://127.0.0.1:9000/housing-media/properties/clx_prop_123/image/uuid-123.jpg",
  "caption": "Spacious Living Room",
  "fileSize": 2048000,
  "mimeType": "image/jpeg"
}
```

#### Response (201 Created)
```json
{
  "success": true,
  "data": {
    "id": "cm_123",
    "mediaType": "IMAGE",
    "url": "http://127.0.0.1:9000/housing-media/properties/clx_prop_123/image/uuid-123.jpg",
    "thumbnailUrl": "http://127.0.0.1:9000/housing-media/properties/clx_prop_123/image/uuid-123.jpg",
    "caption": "Spacious Living Room",
    "displayOrder": 1,
    "fileSizeBytes": 2048000,
    "mimeType": "image/jpeg"
  }
}
```

---

### 3. Generate Presigned Download URL for Private Document
`GET /api/v1/media/:id/download`  
**Authentication:** Required

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "downloadUrl": "http://127.0.0.1:9000/housing-media/properties/clx_prop_123/document_pdf/uuid-123.pdf?X-Amz-Algorithm=...",
    "expiresIn": 300
  }
}
```

---

### 4. Delete Media Item
`DELETE /api/v1/media/:id`  
**Authentication:** Required

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Media deleted successfully"
}
```

---

### 5. Reorder Media Items
`PATCH /api/v1/media/reorder`  
**Authentication:** Required

#### Request Body
```json
{
  "resourceType": "PROPERTY",
  "resourceId": "clx_prop_123",
  "mediaItems": [
    { "id": "cm_1", "displayOrder": 1 },
    { "id": "cm_2", "displayOrder": 2 }
  ]
}
```

---

## File Validation & Limits

| Media Type | Allowed MIME Types | Maximum File Size |
| :--- | :--- | :--- |
| **IMAGE** | `image/jpeg`, `image/png`, `image/webp` | **10 MB** |
| **VIDEO** | `video/mp4`, `video/webm` | **100 MB** |
| **FLOOR_PLAN** | `image/jpeg`, `image/png`, `image/webp`, `application/pdf` | **20 MB** |
| **DOCUMENT_PDF** | `application/pdf` | **20 MB** |
| **VIRTUAL_TOUR** | `image/jpeg`, `image/png`, `image/webp` | **10 MB** |

---

## Security Model
1. **Server-Side Ownership Validation:** The backend checks the user's role and database ownership records before issuing upload or download presigned URLs.
2. **Deterministic Object Keys:** File names are sanitized and generated as server-controlled UUID paths (`properties/{id}/{mediaType}/{uuid}.ext`), blocking path traversal (`../`) and filename tampering.
3. **No Secret Leaks:** AWS / MinIO access keys and secret keys are kept strictly on the backend and are never exposed to the frontend browser or API client.
