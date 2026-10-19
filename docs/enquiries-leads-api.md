# Enquiries, Lead CRM, Visits & Notifications API Specs (`/api/v1`)

## Overview
Phase 11 implements real property enquiry handling, automated seller/agent lead management, property visit scheduling, and in-app/outbound notification provider abstractions.

---

## 1. Property Enquiries & Lead Generation
`POST /api/v1/enquiries`  
**Authentication:** Required (`Bearer JWT`)

#### Request Body
```json
{
  "propertyId": "clx_prop_123",
  "name": "John Buyer",
  "email": "john@buyer.test",
  "phone": "9876543210",
  "message": "Interested in viewing this 3 BHK property.",
  "source": "WEB"
}
```

#### Response (201 Created)
```json
{
  "success": true,
  "message": "Enquiry sent successfully",
  "data": {
    "id": "clx_enq_456",
    "propertyId": "clx_prop_123",
    "name": "John Buyer",
    "email": "john@buyer.test",
    "phone": "9876543210",
    "message": "Interested in viewing this 3 BHK property.",
    "createdAt": "2026-02-18T12:00:00.000Z"
  }
}
```

*Note: Automatically creates or updates corresponding `Lead` record in `Lead` table and triggers `Notification` for property owner/agent.*

---

## 2. Lead Management CRM
`GET /api/v1/leads` — Paginated list of seller/agent leads.  
`GET /api/v1/leads/:id` — Detailed lead record.  
`PATCH /api/v1/leads/:id/status` — Update status (`NEW`, `CONTACTED`, `MEETING_SCHEDULED`, `NEGOTIATING`, `CONVERTED`, `LOST`, `SPAM`).

---

## 3. Property Visit Scheduling
`POST /api/v1/property-visits` — Schedule property visit (`scheduledDate`, `timeSlot`, `notes`).  
`GET /api/v1/property-visits` — Retrieve requested or assigned visits.  
`PATCH /api/v1/property-visits/:id/status` — Update visit status (`SCHEDULED`, `COMPLETED`, `CANCELLED`, `RESCHEDULED`).

---

## 4. Notifications Engine
`GET /api/v1/notifications` — Retrieve paginated notifications list.  
`GET /api/v1/notifications/unread-count` — Unread count badge.  
`PATCH /api/v1/notifications/:id/read` — Mark notification read.  
`PATCH /api/v1/notifications/read-all` — Mark all notifications read.
