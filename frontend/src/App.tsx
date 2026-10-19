import React, { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Role } from '@housing-clone/shared';
import { MainLayout } from './components/layout/MainLayout';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { DashboardLayout } from './components/dashboard/DashboardLayout';
import { AdminLayout } from './components/admin/AdminLayout';
import { BrokerLayout } from './components/broker/BrokerLayout';
import { useAuthStore } from './store/useAuthStore';
import { authService } from './services/authService';
import { Loader2 } from 'lucide-react';

// Route-Level Code Splitting
const HomePage = lazy(() => import('./pages/HomePage').then((m) => ({ default: m.HomePage })));
const SearchPage = lazy(() => import('./pages/SearchPage').then((m) => ({ default: m.SearchPage })));
const PropertyDetailPage = lazy(() => import('./pages/PropertyDetailPage').then((m) => ({ default: m.PropertyDetailPage })));
const PostPropertyPage = lazy(() => import('./pages/PostPropertyPage').then((m) => ({ default: m.PostPropertyPage })));
const LoginPage = lazy(() => import('./pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const BrokerLoginPage = lazy(() => import('./pages/BrokerLoginPage').then((m) => ({ default: m.BrokerLoginPage })));
const AdminLoginPage = lazy(() => import('./pages/AdminLoginPage').then((m) => ({ default: m.AdminLoginPage })));
const RegisterPage = lazy(() => import('./pages/RegisterPage').then((m) => ({ default: m.RegisterPage })));

// Dashboards
const TenantDashboardPage = lazy(() => import('./pages/TenantDashboardPage').then((m) => ({ default: m.TenantDashboardPage })));
const OwnerDashboardPage = lazy(() => import('./pages/OwnerDashboardPage').then((m) => ({ default: m.OwnerDashboardPage })));
const AgentDashboardPage = lazy(() => import('./pages/AgentDashboardPage').then((m) => ({ default: m.AgentDashboardPage })));
const VisitsDashboardPage = lazy(() => import('./pages/VisitsDashboardPage').then((m) => ({ default: m.VisitsDashboardPage })));
const ProjectsDashboardPage = lazy(() => import('./pages/ProjectsDashboardPage').then((m) => ({ default: m.ProjectsDashboardPage })));
const ProfileDashboardPage = lazy(() => import('./pages/ProfileDashboardPage').then((m) => ({ default: m.ProfileDashboardPage })));
const BillingDashboardPage = lazy(() => import('./pages/BillingDashboardPage').then((m) => ({ default: m.BillingDashboardPage })));
const RecommendationsDashboardPage = lazy(() => import('./pages/RecommendationsDashboardPage').then((m) => ({ default: m.RecommendationsDashboardPage })));

// Broker Portal
const BrokerDashboardPage = lazy(() => import('./pages/BrokerDashboardPage').then((m) => ({ default: m.BrokerDashboardPage })));
const BrokerPropertiesPage = lazy(() => import('./pages/BrokerPropertiesPage').then((m) => ({ default: m.BrokerPropertiesPage })));
const BrokerLeadsPage = lazy(() => import('./pages/BrokerLeadsPage').then((m) => ({ default: m.BrokerLeadsPage })));
const BrokerAnalyticsPage = lazy(() => import('./pages/BrokerAnalyticsPage').then((m) => ({ default: m.BrokerAnalyticsPage })));
const BrokerTeamPage = lazy(() => import('./pages/BrokerTeamPage').then((m) => ({ default: m.BrokerTeamPage })));
const BrokerEnquiriesPage = lazy(() => import('./pages/BrokerEnquiriesPage').then((m) => ({ default: m.BrokerEnquiriesPage })));
const BrokerVisitsPage = lazy(() => import('./pages/BrokerVisitsPage').then((m) => ({ default: m.BrokerVisitsPage })));
const BrokerProfileSettingsPage = lazy(() => import('./pages/BrokerProfileSettingsPage').then((m) => ({ default: m.BrokerProfileSettingsPage })));

// Public Directory & Legal Pages
const PackagesPage = lazy(() => import('./pages/PackagesPage').then((m) => ({ default: m.PackagesPage })));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage').then((m) => ({ default: m.PrivacyPage })));
const TermsPage = lazy(() => import('./pages/TermsPage').then((m) => ({ default: m.TermsPage })));
const SafetyPage = lazy(() => import('./pages/SafetyPage').then((m) => ({ default: m.SafetyPage })));
const AboutPage = lazy(() => import('./pages/AboutPage').then((m) => ({ default: m.AboutPage })));
const ContactPage = lazy(() => import('./pages/ContactPage').then((m) => ({ default: m.ContactPage })));
const BrokersDirectoryPage = lazy(() => import('./pages/BrokersDirectoryPage').then((m) => ({ default: m.BrokersDirectoryPage })));
const BrokerProfilePage = lazy(() => import('./pages/BrokerProfilePage').then((m) => ({ default: m.BrokerProfilePage })));
const FavoritesPage = lazy(() => import('./pages/FavoritesPage').then((m) => ({ default: m.FavoritesPage })));
const SavedSearchesPage = lazy(() => import('./pages/SavedSearchesPage').then((m) => ({ default: m.SavedSearchesPage })));
const RecentlyViewedPage = lazy(() => import('./pages/RecentlyViewedPage').then((m) => ({ default: m.RecentlyViewedPage })));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage').then((m) => ({ default: m.NotificationsPage })));

// Admin Pages
const AdminPage = lazy(() => import('./pages/AdminPage').then((m) => ({ default: m.AdminPage })));
const AdminPropertiesPage = lazy(() => import('./pages/AdminPropertiesPage').then((m) => ({ default: m.AdminPropertiesPage })));
const AdminVerificationPage = lazy(() => import('./pages/AdminVerificationPage').then((m) => ({ default: m.AdminVerificationPage })));
const AdminUsersPage = lazy(() => import('./pages/AdminUsersPage').then((m) => ({ default: m.AdminUsersPage })));
const AdminReportsPage = lazy(() => import('./pages/AdminReportsPage').then((m) => ({ default: m.AdminReportsPage })));
const AdminAuditLogsPage = lazy(() => import('./pages/AdminAuditLogsPage').then((m) => ({ default: m.AdminAuditLogsPage })));
const AdminPackagesPage = lazy(() => import('./pages/AdminPackagesPage').then((m) => ({ default: m.AdminPackagesPage })));
const AdminTransactionsPage = lazy(() => import('./pages/AdminTransactionsPage').then((m) => ({ default: m.AdminTransactionsPage })));
const AdminAnalyticsPage = lazy(() => import('./pages/AdminAnalyticsPage').then((m) => ({ default: m.AdminAnalyticsPage })));
const AdminBrokersPage = lazy(() => import('./pages/AdminBrokersPage').then((m) => ({ default: m.AdminBrokersPage })));
const AdminProjectsPage = lazy(() => import('./pages/AdminProjectsPage').then((m) => ({ default: m.AdminProjectsPage })));
const AdminLocationsPage = lazy(() => import('./pages/AdminLocationsPage').then((m) => ({ default: m.AdminLocationsPage })));
const AdminPropertyTypesPage = lazy(() => import('./pages/AdminPropertyTypesPage').then((m) => ({ default: m.AdminPropertyTypesPage })));
const AdminLeadsPage = lazy(() => import('./pages/AdminLeadsPage').then((m) => ({ default: m.AdminLeadsPage })));
const AdminCMSPage = lazy(() => import('./pages/AdminCMSPage').then((m) => ({ default: m.AdminCMSPage })));
const AdminFeatureFlagsPage = lazy(() => import('./pages/AdminFeatureFlagsPage').then((m) => ({ default: m.AdminFeatureFlagsPage })));
const AdminSettingsPage = lazy(() => import('./pages/AdminSettingsPage').then((m) => ({ default: m.AdminSettingsPage })));
const AdminSystemPage = lazy(() => import('./pages/AdminSystemPage').then((m) => ({ default: m.AdminSystemPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));

const PageFallback: React.FC = () => (
  <div className="min-h-[60vh] flex items-center justify-center p-8">
    <div className="flex items-center space-x-2 text-brand-primary font-bold text-xs">
      <Loader2 className="w-5 h-5 animate-spin" />
      <span>Loading Page...</span>
    </div>
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

export const App: React.FC = () => {
  const { setAuth, clearAuth, setInitializing } = useAuthStore();

  useEffect(() => {
    authService
      .refreshSession()
      .then((data) => {
        setAuth(data.user, data.accessToken);
      })
      .catch(() => {
        clearAuth();
      })
      .finally(() => {
        setInitializing(false);
      });
  }, [setAuth, clearAuth, setInitializing]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route element={<MainLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/property/:slug" element={<PropertyDetailPage />} />
              <Route path="/packages" element={<PackagesPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/safety" element={<SafetyPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/brokers" element={<BrokersDirectoryPage />} />
              <Route path="/brokers/:id" element={<BrokerProfilePage />} />

              {/* Separate Login Portals */}
              <Route path="/auth/login" element={<LoginPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/broker/login" element={<BrokerLoginPage />} />
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route path="/auth/register" element={<RegisterPage />} />

              {/* Protected User & Seller Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/post-property" element={<PostPropertyPage />} />
                <Route path="/post-property/:id/edit" element={<PostPropertyPage />} />
                <Route path="/favorites" element={<FavoritesPage />} />
                <Route path="/saved-searches" element={<SavedSearchesPage />} />
                <Route path="/recently-viewed" element={<RecentlyViewedPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />

                {/* Dashboard Section */}
                <Route element={<DashboardLayout />}>
                  <Route path="/dashboard" element={<TenantDashboardPage />} />
                  <Route path="/dashboard/properties" element={<OwnerDashboardPage />} />
                  <Route path="/dashboard/leads" element={<AgentDashboardPage />} />
                  <Route path="/dashboard/visits" element={<VisitsDashboardPage />} />
                  <Route path="/dashboard/projects" element={<ProjectsDashboardPage />} />
                  <Route path="/dashboard/billing" element={<BillingDashboardPage />} />
                  <Route path="/dashboard/recommendations" element={<RecommendationsDashboardPage />} />
                  <Route path="/dashboard/profile" element={<ProfileDashboardPage />} />
                </Route>

                {/* Broker Portal Section */}
                <Route element={<ProtectedRoute allowedRoles={[Role.AGENT, Role.DEVELOPER, Role.OWNER, Role.ADMIN, Role.SUPER_ADMIN]} />}>
                  <Route element={<BrokerLayout />}>
                    <Route path="/broker/dashboard" element={<BrokerDashboardPage />} />
                    <Route path="/broker/properties" element={<BrokerPropertiesPage />} />
                    <Route path="/broker/leads" element={<BrokerLeadsPage />} />
                    <Route path="/broker/analytics" element={<BrokerAnalyticsPage />} />
                    <Route path="/broker/team" element={<BrokerTeamPage />} />
                    <Route path="/broker/enquiries" element={<BrokerEnquiriesPage />} />
                    <Route path="/broker/visits" element={<BrokerVisitsPage />} />
                    <Route path="/broker/profile" element={<BrokerProfileSettingsPage />} />
                  </Route>
                </Route>
              </Route>

              {/* Admin Portal Protected Routes */}
              <Route element={<ProtectedRoute allowedRoles={[Role.ADMIN, Role.SUPER_ADMIN, Role.MODERATOR]} />}>
                <Route element={<AdminLayout />}>
                  <Route path="/admin" element={<AdminPage />} />
                  <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
                  <Route path="/admin/system" element={<AdminSystemPage />} />
                  <Route path="/admin/users" element={<AdminUsersPage />} />
                  <Route path="/admin/brokers" element={<AdminBrokersPage />} />
                  <Route path="/admin/projects" element={<AdminProjectsPage />} />
                  <Route path="/admin/developers" element={<AdminProjectsPage />} />
                  <Route path="/admin/properties" element={<AdminPropertiesPage />} />
                  <Route path="/admin/verification" element={<AdminVerificationPage />} />
                  <Route path="/admin/locations" element={<AdminLocationsPage />} />
                  <Route path="/admin/property-types" element={<AdminPropertyTypesPage />} />
                  <Route path="/admin/amenities" element={<AdminPropertyTypesPage />} />
                  <Route path="/admin/leads" element={<AdminLeadsPage />} />
                  <Route path="/admin/enquiries" element={<AdminLeadsPage />} />
                  <Route path="/admin/visits" element={<AdminLeadsPage />} />
                  <Route path="/admin/reports" element={<AdminReportsPage />} />
                  <Route path="/admin/packages" element={<AdminPackagesPage />} />
                  <Route path="/admin/transactions" element={<AdminTransactionsPage />} />
                  <Route path="/admin/invoices" element={<AdminTransactionsPage />} />
                  <Route path="/admin/refunds" element={<AdminTransactionsPage />} />
                  <Route path="/admin/cms" element={<AdminCMSPage />} />
                  <Route path="/admin/feature-flags" element={<AdminFeatureFlagsPage />} />
                  <Route path="/admin/settings" element={<AdminSettingsPage />} />
                  <Route path="/admin/audit-logs" element={<AdminAuditLogsPage />} />
                  <Route path="/admin/profile" element={<ProfileDashboardPage />} />
                </Route>
              </Route>

              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
