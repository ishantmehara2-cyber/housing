# Production Deployment Guide

## Overview
This document outlines production deployment architecture, environment configurations, and security practices for `housing-clone`.

---

## 1. System Requirements
* **Node.js Runtime:** v20.x LTS or higher
* **Database:** MySQL 8.0 or AWS Aurora MySQL
* **Object Storage:** AWS S3 or Cloudflare R2 for property media
* **Reverse Proxy:** NGINX or AWS ALB with TLS 1.3 SSL Termination

---

## 2. Environment Variables Checklist (`.env`)

```env
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://housing-clone.com
DATABASE_URL=mysql://db_user:db_password@db_host:3306/housing_clone
JWT_SECRET=production_custom_cryptographically_secure_jwt_secret_key_32chars
JWT_REFRESH_SECRET=production_custom_cryptographically_secure_refresh_secret_key_32chars

# Monetization & Payments
PAYMENT_PROVIDER=razorpay
RAZORPAY_KEY_ID=rzp_live_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_live_secret
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret

# Object Storage
S3_BUCKET=housing-clone-production-media
S3_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key

# Maps & Geocoding
MAP_PROVIDER=google
GOOGLE_MAPS_SERVER_KEY=your_google_maps_server_key
VITE_GOOGLE_MAPS_PUBLIC_KEY=your_google_maps_public_key
```

---

## 3. Build & Deployment Steps

```bash
# 1. Install Production Dependencies
npm ci --only=production

# 2. Run Database Migrations
npx prisma migrate deploy

# 3. Build Monorepo Workspaces
npm run build

# 4. Start Production Server (via PM2 or Docker)
cd backend
NODE_ENV=production node dist/app.js
```

---

## 4. Health & Readiness Monitoring
* **Liveness Probe:** `GET /api/v1/health`
* **Readiness Probe:** `GET /api/v1/health/ready` (verifies MySQL connection)
