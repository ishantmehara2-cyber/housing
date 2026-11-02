# 📐 Housing Clone — Complete Entity Relationship Diagram (ERD)

This document presents the complete **Mermaid ER Diagram** representing all primary entities, foreign key constraints, and relational cardinalities in the Housing Clone MySQL database.

---

```mermaid
erDiagram

    %% 1. USER & AUTH DOMAIN
    users ||--o{ user_sessions : "has"
    users ||--o{ otp_verifications : "requests"
    users ||--o{ properties : "owns / posts"
    users ||--o{ favorites : "saves"
    users ||--o{ saved_searches : "creates"
    users ||--o{ recently_viewed : "views"
    users ||--o{ enquiries : "submits"
    users ||--o{ leads : "generates"
    users ||--o{ property_visits : "schedules"
    users ||--o{ subscriptions : "purchases"
    users ||--o{ transactions : "executes"
    users ||--o{ audit_logs : "records"

    users {
        string id PK
        string email UK
        string phone UK
        string passwordHash
        string firstName
        string lastName
        enum role
        enum status
        boolean emailVerified
        boolean phoneVerified
        datetime createdAt
    }

    user_sessions {
        string id PK
        string userId FK
        string sessionToken UK
        string refreshToken UK
        string ipAddress
        datetime expiresAt
    }

    %% 2. LOCATION HIERARCHY DOMAIN
    states ||--o{ cities : "contains"
    cities ||--o{ localities : "contains"
    localities ||--o{ sub_localities : "contains"
    cities ||--o{ properties : "hosts"
    localities ||--o{ properties : "hosts"
    sub_localities ||--o{ properties : "hosts"

    states {
        string id PK
        string name UK
        string code UK
    }

    cities {
        string id PK
        string stateId FK
        string name
        string slug UK
        double latitude
        double longitude
        boolean isPopular
        boolean isActive
    }

    localities {
        string id PK
        string cityId FK
        string name
        string slug
        string pincode
        double latitude
        double longitude
    }

    sub_localities {
        string id PK
        string localityId FK
        string name
        string slug
        double latitude
        double longitude
    }

    %% 3. PROPERTY CATALOGS & LISTINGS DOMAIN
    property_types ||--o{ properties : "classifies"
    properties ||--o{ property_media : "contains"
    properties ||--o{ property_amenities : "features"
    amenities ||--o{ property_amenities : "linked_to"
    properties ||--o{ enquiries : "receives"
    properties ||--o{ leads : "generates"
    properties ||--o{ property_visits : "schedules"

    property_types {
        string id PK
        string name
        string slug UK
        enum category
        string icon
    }

    properties {
        string id PK
        string slug UK
        string title
        enum listingPurpose
        enum propertyCategory
        string propertyTypeId FK
        string ownerId FK
        string postedByUserId FK
        string cityId FK
        string localityId FK
        string subLocalityId FK
        decimal price
        decimal rent
        decimal carpetArea
        enum furnishing
        enum verificationState
        enum listingState
        datetime createdAt
    }

    amenities {
        string id PK
        string name
        string slug UK
        string category
    }

    property_amenities {
        string id PK
        string propertyId FK
        string amenityId FK
    }

    property_media {
        string id PK
        string propertyId FK
        string url
        enum mediaType
        int displayOrder
    }

    %% 4. DEVELOPER & PROJECTS DOMAIN
    developer_organizations ||--o{ developer_members : "employs"
    developer_organizations ||--o{ projects : "develops"
    projects ||--o{ project_media : "has"
    projects ||--o{ project_amenities : "has"

    developer_organizations {
        string id PK
        string companyName
        string slug UK
        enum verificationStatus
    }

    projects {
        string id PK
        string developerId FK
        string name
        string slug UK
        string cityId FK
        string localityId FK
        string reraId
    }

    %% 5. LEADS & VISITS DOMAIN
    enquiries {
        string id PK
        string propertyId FK
        string senderUserId FK
        string message
        datetime createdAt
    }

    leads {
        string id PK
        string propertyId FK
        string leadUserId FK
        string ownerUserId FK
        enum status
        datetime createdAt
    }

    property_visits {
        string id PK
        string propertyId FK
        string visitorUserId FK
        datetime visitDate
        enum status
    }

    %% 6. MONETIZATION & BILLING DOMAIN
    packages ||--o{ subscriptions : "offers"
    users ||--o{ subscriptions : "subscribes"
    transactions ||--o| invoices : "generates"
    transactions ||--o{ refunds : "has"

    packages {
        string id PK
        string name
        decimal price
        int validityDays
        int maxListings
        boolean isActive
    }

    subscriptions {
        string id PK
        string userId FK
        string packageId FK
        datetime startDate
        datetime endDate
        boolean isActive
    }

    transactions {
        string id PK
        string userId FK
        string packageId FK
        string razorpayOrderId UK
        string razorpayPaymentId UK
        decimal amount
        enum status
    }

    invoices {
        string id PK
        string transactionId FK
        string invoiceNumber UK
        decimal totalAmount
    }

    %% 7. SYSTEM, CMS & AUDIT LOGS
    users ||--o{ audit_logs : "records"

    audit_logs {
        string id PK
        string userId FK
        string action
        string entity
        string entityId
        json payload
        string ipAddress
        datetime createdAt
    }

    cms_contents {
        string id PK
        string slug UK
        string title
        text content
    }

    feature_flags {
        string id PK
        string key UK
        string description
        boolean isEnabled
    }

    system_settings {
        string id PK
        string key UK
        string value
    }
```
