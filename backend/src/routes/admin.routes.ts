import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { PackageController } from '../controllers/package.controller';
import { PaymentController } from '../controllers/payment.controller';
import { AnalyticsController } from '../controllers/analytics.controller';
import { BrokerController } from '../controllers/broker.controller';
import { requireAuth, requireAnyRole } from '../middlewares/auth.middleware';
import { Role } from '@housing-clone/shared';

export const adminRouter = Router();

const adminGuard = [requireAuth, requireAnyRole([Role.ADMIN, Role.SUPER_ADMIN, Role.MODERATOR])];

// Overview & Properties
adminRouter.get('/overview', ...adminGuard, AdminController.getOverviewMetrics);
adminRouter.get('/properties', ...adminGuard, AdminController.getProperties);
adminRouter.patch('/properties/:id/status', ...adminGuard, AdminController.updatePropertyStatus);
adminRouter.get('/verification', ...adminGuard, AdminController.getVerificationQueue);
adminRouter.patch('/verification/:id', ...adminGuard, AdminController.updateVerificationState);

// User & Broker Management
adminRouter.get('/users', ...adminGuard, AdminController.getUsers);
adminRouter.patch('/users/:id/status', ...adminGuard, AdminController.updateUserStatus);
adminRouter.patch('/users/:id/role', ...adminGuard, AdminController.updateUserRole);
adminRouter.get('/brokers', ...adminGuard, BrokerController.getBrokersForAdmin);
adminRouter.post('/brokers', ...adminGuard, BrokerController.createBrokerByAdmin);
adminRouter.patch('/brokers/:id/status', ...adminGuard, BrokerController.updateBrokerStatusByAdmin);
adminRouter.post('/brokers/:id/reset-password', ...adminGuard, BrokerController.resetBrokerPasswordByAdmin);

// Projects & Developers & Locations
adminRouter.get('/projects', ...adminGuard, AdminController.getProjects);
adminRouter.get('/developers', ...adminGuard, AdminController.getDevelopers);

adminRouter.get('/locations/states', ...adminGuard, AdminController.getStates);
adminRouter.post('/locations/states', ...adminGuard, AdminController.createState);
adminRouter.patch('/locations/states/:id', ...adminGuard, AdminController.updateState);

adminRouter.get('/locations/cities', ...adminGuard, AdminController.getCities);
adminRouter.post('/locations/cities', ...adminGuard, AdminController.createCity);
adminRouter.patch('/locations/cities/:id', ...adminGuard, AdminController.updateCity);

adminRouter.get('/locations/localities', ...adminGuard, AdminController.getLocalities);
adminRouter.post('/locations/localities', ...adminGuard, AdminController.createLocality);
adminRouter.patch('/locations/localities/:id', ...adminGuard, AdminController.updateLocality);

adminRouter.get('/locations/sub-localities', ...adminGuard, AdminController.getSubLocalities);
adminRouter.post('/locations/sub-localities', ...adminGuard, AdminController.createSubLocality);
adminRouter.patch('/locations/sub-localities/:id', ...adminGuard, AdminController.updateSubLocality);

// Property Types & Amenities
adminRouter.get('/property-types', ...adminGuard, AdminController.getPropertyTypes);
adminRouter.post('/property-types', ...adminGuard, AdminController.createPropertyType);
adminRouter.get('/amenities', ...adminGuard, AdminController.getAmenities);
adminRouter.post('/amenities', ...adminGuard, AdminController.createAmenity);

// Leads & Enquiries & Visits
adminRouter.get('/leads', ...adminGuard, AdminController.getLeads);
adminRouter.get('/enquiries', ...adminGuard, AdminController.getEnquiries);
adminRouter.get('/visits', ...adminGuard, AdminController.getVisits);

// Reports & Audit Logs
adminRouter.get('/reports', ...adminGuard, AdminController.getReports);
adminRouter.patch('/reports/:id/status', ...adminGuard, AdminController.updateReportStatus);
adminRouter.get('/audit-logs', ...adminGuard, AdminController.getAuditLogs);

// Feature Flags, Settings & CMS
adminRouter.get('/feature-flags', ...adminGuard, AdminController.getFeatureFlags);
adminRouter.patch('/feature-flags/:id', ...adminGuard, AdminController.toggleFeatureFlag);
adminRouter.get('/settings', ...adminGuard, AdminController.getSystemSettings);
adminRouter.patch('/settings', ...adminGuard, AdminController.updateSystemSetting);
adminRouter.get('/cms', ...adminGuard, AdminController.getCMSContents);
adminRouter.post('/cms', ...adminGuard, AdminController.upsertCMSContent);
adminRouter.get('/system/health', ...adminGuard, AdminController.getSystemHealth);

// Admin Monetization & Analytics Routes
adminRouter.get('/packages', ...adminGuard, PackageController.getAllPackagesForAdmin);
adminRouter.post('/packages', ...adminGuard, PackageController.createPackage);
adminRouter.patch('/packages/:id', ...adminGuard, PackageController.updatePackageStatus);
adminRouter.get('/transactions', ...adminGuard, PaymentController.getAllTransactionsForAdmin);
adminRouter.post('/refunds/:id', ...adminGuard, PaymentController.processRefund);
adminRouter.get('/analytics/summary', ...adminGuard, AnalyticsController.getAdminAnalyticsSummary);
