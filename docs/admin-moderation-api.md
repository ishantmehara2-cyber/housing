# Admin Moderation Portal, Verification & Audit API Specs (`/api/v1/admin`)

## Overview
The Admin Moderation Portal provides centralized management for property listing approvals, property verifications, user account suspensions, user report resolutions, and append-only system audit logging.

---

## Access Control & Authorization
All endpoints under `/api/v1/admin` require authentication and are restricted to users with `ADMIN`, `SUPER_ADMIN`, or `MODERATOR` roles. Attempts by `TENANT_BUYER`, `OWNER`, `AGENT`, or `DEVELOPER` accounts return HTTP 403 Forbidden.

---

## Endpoints

### 1. Admin Overview Metrics
`GET /api/v1/admin/overview`

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "userCounts": { "total": 120, "active": 115, "suspended": 5 },
    "propertyCounts": {
      "total": 65,
      "active": 50,
      "pendingApproval": 8,
      "pendingVerification": 4,
      "rejected": 3
    },
    "reportCounts": { "total": 10, "pending": 2, "resolved": 8 },
    "totalProjects": 12,
    "recentAuditLogs": [
      {
        "id": "log_1",
        "action": "PROPERTY_APPROVAL_APPROVED",
        "entity": "Property",
        "createdAt": "2026-02-18T12:00:00.000Z",
        "user": { "firstName": "Admin", "lastName": "User", "email": "admin@example.test" }
      }
    ]
  }
}
```

---

### 2. Property Moderation List
`GET /api/v1/admin/properties?page=1&limit=20&listingState=PENDING_APPROVAL`

---

### 3. Approve or Reject Property Listing
`PATCH /api/v1/admin/properties/:id/status`

#### Request Body
```json
{
  "status": "REJECTED",
  "rejectionReason": "Incomplete location address and missing mandatory photographs."
}
```

---

### 4. Property Verification Queue & Decision
`GET /api/v1/admin/verification`  
`PATCH /api/v1/admin/verification/:id`

#### Request Body
```json
{
  "verificationState": "VERIFIED",
  "notes": "Verified ownership documents against government land registry."
}
```

---

### 5. User Account Management & Suspension
`GET /api/v1/admin/users?page=1&limit=20&status=SUSPENDED`  
`PATCH /api/v1/admin/users/:id/status`

#### Request Body
```json
{
  "status": "SUSPENDED"
}
```

*Note: Non-superadmin accounts cannot suspend SUPER_ADMIN user accounts.*

---

### 6. User Reports Resolution
`GET /api/v1/admin/reports`  
`PATCH /api/v1/admin/reports/:id/status`

#### Request Body
```json
{
  "status": "RESOLVED",
  "resolution": "Property listing rejected and owner warned for duplicate spam."
}
```

---

### 7. System Audit Log Viewer
`GET /api/v1/admin/audit-logs` — Paginated list of append-only audit logs.
