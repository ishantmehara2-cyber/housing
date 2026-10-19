# Production Deployment Checklist

## Security & Secrets
- [x] `JWT_SECRET` and `JWT_REFRESH_SECRET` set to 32+ char secure keys.
- [x] `MockPaymentProvider` disabled in production mode (`NODE_ENV=production`).
- [x] CORS origin restricted to `FRONTEND_URL`.
- [x] Express error handler sanitizes stack traces for client responses.
- [x] `X-Request-ID` correlation headers enabled on all responses and logs.

## Database & Storage
- [x] Prisma migrations deployed via `prisma migrate deploy`.
- [x] Database indexes verified on property location, status, and price fields.
- [x] Automated MySQL backups configured (daily snapshots + 30-day retention).

## CI/CD & Testing
- [x] GitHub Actions CI pipeline configured (`.github/workflows/ci.yml`).
- [x] 100% test pass rate across backend and frontend workspaces.
- [x] Typechecking (`npm run typecheck`) and ESLint (`npm run lint`) clean.
