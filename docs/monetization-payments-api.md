# Monetization, Payments, Subscriptions & Invoicing API Specs (`/api/v1`)

## Overview
Phase 14 delivers an enterprise monetization engine for `housing-clone` with database-driven seller plans, HMAC SHA-256 payment signature verification, subscription entitlements, invoice generation, and admin refunds.

---

## 1. Public Package Catalog
`GET /api/v1/packages`  
Returns active monetization packages from the `Package` database table.

---

## 2. Order Creation & Payment Verification
`POST /api/v1/payments/orders`  
**Authentication:** Required (`Bearer JWT`)  
Validates package price server-side from MySQL database and creates a pending `Transaction` record.

#### Request Body
```json
{
  "packageId": "clx_pkg_pro_seller"
}
```

`POST /api/v1/payments/verify`  
**Authentication:** Required (`Bearer JWT`)  
Verifies HMAC SHA-256 signature, transitions transaction to `SUCCESS`, creates `Subscription`, and generates an `Invoice`.

#### Request Body
```json
{
  "transactionId": "clx_txn_123",
  "providerOrderId": "order_rzp_456",
  "providerPaymentId": "pay_rzp_789",
  "providerSignature": "c03f9...hmac_sha256_signature"
}
```

---

## 3. Subscriptions & Billing
`GET /api/v1/billing/subscription` — Active subscription & remaining listing entitlements.  
`GET /api/v1/billing/transactions` — Transaction history with linked invoices.  
`GET /api/v1/billing/invoices` — List generated invoices.

---

## 4. Admin Monetization & Refund Management
`GET /api/v1/admin/packages` — Manage package catalog.  
`POST /api/v1/admin/packages` — Create new monetization package.  
`PATCH /api/v1/admin/packages/:id` — Toggle active status.  
`GET /api/v1/admin/transactions` — Systemwide transactions list.  
`POST /api/v1/admin/refunds/:id` — Process refund for transaction.
