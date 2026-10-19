import { apiClient } from './apiClient';
import { ApiResponse, SearchPaginationMetadata, Role, PropertyCategory } from '@housing-clone/shared';

export interface AdminOverviewMetrics {
  userCounts: { total: number; active: number; suspended: number };
  propertyCounts: {
    total: number;
    active: number;
    pendingApproval: number;
    pendingVerification: number;
    rejected: number;
    draft: number;
  };
  brokerCounts: { total: number; verified: number; developers: number };
  leadCounts: { leads: number; enquiries: number };
  visitCounts: { upcoming: number; completed: number };
  monetization: { transactions: number; activeSubscriptions: number };
  reportCounts: { total: number; pending: number };
  totalProjects: number;
  recentAuditLogs: Array<{
    id: string;
    action: string;
    entity: string;
    createdAt: string;
    user?: { firstName: string; lastName: string; email: string };
  }>;
}

export const adminService = {
  async getOverviewMetrics(): Promise<AdminOverviewMetrics> {
    const res = await apiClient.get<ApiResponse<AdminOverviewMetrics>>('/admin/overview');
    return res.data.data!;
  },

  async getProperties(page = 1, limit = 20, listingState?: string, verificationState?: string) {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (listingState) params.set('listingState', listingState);
    if (verificationState) params.set('verificationState', verificationState);

    const res = await apiClient.get<ApiResponse<{ items: unknown[]; pagination: SearchPaginationMetadata }>>(
      `/admin/properties?${params.toString()}`
    );
    return res.data.data!;
  },

  async updatePropertyStatus(propertyId: string, status: string, rejectionReason?: string) {
    const res = await apiClient.patch<ApiResponse>(`/admin/properties/${propertyId}/status`, {
      status,
      rejectionReason,
    });
    return res.data;
  },

  async getVerificationQueue(page = 1, limit = 20) {
    const res = await apiClient.get<ApiResponse<{ items: unknown[]; pagination: SearchPaginationMetadata }>>(
      `/admin/verification?page=${page}&limit=${limit}`
    );
    return res.data.data!;
  },

  async updateVerificationState(propertyId: string, verificationState: string, notes?: string) {
    const res = await apiClient.patch<ApiResponse>(`/admin/verification/${propertyId}`, {
      verificationState,
      notes,
    });
    return res.data;
  },

  async getUsers(page = 1, limit = 20, role?: string, status?: string) {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (role) params.set('role', role);
    if (status) params.set('status', status);

    const res = await apiClient.get<ApiResponse<{ items: unknown[]; pagination: SearchPaginationMetadata }>>(
      `/admin/users?${params.toString()}`
    );
    return res.data.data!;
  },

  async updateUserStatus(userId: string, status: string) {
    const res = await apiClient.patch<ApiResponse>(`/admin/users/${userId}/status`, { status });
    return res.data;
  },

  async updateUserRole(userId: string, role: Role) {
    const res = await apiClient.patch<ApiResponse>(`/admin/users/${userId}/role`, { role });
    return res.data;
  },

  async createBroker(data: { firstName: string; lastName: string; email: string; phone: string; password: string; role: Role; agencyName?: string }) {
    const res = await apiClient.post<ApiResponse>('/admin/brokers', data);
    return res.data;
  },

  async getProjects(page = 1, limit = 20) {
    const res = await apiClient.get<ApiResponse<{ items: unknown[]; pagination: SearchPaginationMetadata }>>(
      `/admin/projects?page=${page}&limit=${limit}`
    );
    return res.data.data!;
  },

  async getDevelopers() {
    const res = await apiClient.get<ApiResponse<unknown[]>>('/admin/developers');
    return res.data.data!;
  },

  async getStates() {
    const res = await apiClient.get<ApiResponse<unknown[]>>('/admin/locations/states');
    return res.data.data!;
  },

  async createState(data: { name: string; code: string }) {
    const res = await apiClient.post<ApiResponse>('/admin/locations/states', data);
    return res.data;
  },

  async updateState(stateId: string, data: { name?: string; code?: string }) {
    const res = await apiClient.patch<ApiResponse>(`/admin/locations/states/${stateId}`, data);
    return res.data;
  },

  async getCities(stateId?: string) {
    const url = stateId ? `/admin/locations/cities?stateId=${stateId}` : '/admin/locations/cities';
    const res = await apiClient.get<ApiResponse<unknown[]>>(url);
    return res.data.data!;
  },

  async createCity(data: { name: string; slug: string; stateId: string; latitude: number; longitude: number; isPopular?: boolean }) {
    const res = await apiClient.post<ApiResponse>('/admin/locations/cities', data);
    return res.data;
  },

  async updateCity(cityId: string, data: { name?: string; slug?: string; stateId?: string; isPopular?: boolean; isActive?: boolean }) {
    const res = await apiClient.patch<ApiResponse>(`/admin/locations/cities/${cityId}`, data);
    return res.data;
  },

  async getLocalities(cityId?: string) {
    const url = cityId ? `/admin/locations/localities?cityId=${cityId}` : '/admin/locations/localities';
    const res = await apiClient.get<ApiResponse<unknown[]>>(url);
    return res.data.data!;
  },

  async createLocality(data: { name: string; slug: string; cityId: string; pincode?: string; latitude: number; longitude: number }) {
    const res = await apiClient.post<ApiResponse>('/admin/locations/localities', data);
    return res.data;
  },

  async updateLocality(localityId: string, data: { name?: string; slug?: string; cityId?: string; pincode?: string }) {
    const res = await apiClient.patch<ApiResponse>(`/admin/locations/localities/${localityId}`, data);
    return res.data;
  },

  async getSubLocalities(localityId?: string) {
    const url = localityId ? `/admin/locations/sub-localities?localityId=${localityId}` : '/admin/locations/sub-localities';
    const res = await apiClient.get<ApiResponse<unknown[]>>(url);
    return res.data.data!;
  },

  async createSubLocality(data: { name: string; slug: string; localityId: string; latitude?: number; longitude?: number }) {
    const res = await apiClient.post<ApiResponse>('/admin/locations/sub-localities', data);
    return res.data;
  },

  async updateSubLocality(subLocalityId: string, data: { name?: string; slug?: string }) {
    const res = await apiClient.patch<ApiResponse>(`/admin/locations/sub-localities/${subLocalityId}`, data);
    return res.data;
  },

  async getPropertyTypes() {
    const res = await apiClient.get<ApiResponse<unknown[]>>('/admin/property-types');
    return res.data.data!;
  },

  async createPropertyType(data: { name: string; slug: string; category: PropertyCategory; icon?: string }) {
    const res = await apiClient.post<ApiResponse>('/admin/property-types', data);
    return res.data;
  },

  async getAmenities() {
    const res = await apiClient.get<ApiResponse<unknown[]>>('/admin/amenities');
    return res.data.data!;
  },

  async createAmenity(data: { name: string; slug: string; category?: string; icon?: string }) {
    const res = await apiClient.post<ApiResponse>('/admin/amenities', data);
    return res.data;
  },

  async getLeads(page = 1, limit = 20) {
    const res = await apiClient.get<ApiResponse<{ items: unknown[]; pagination: SearchPaginationMetadata }>>(
      `/admin/leads?page=${page}&limit=${limit}`
    );
    return res.data.data!;
  },

  async getEnquiries(page = 1, limit = 20) {
    const res = await apiClient.get<ApiResponse<{ items: unknown[]; pagination: SearchPaginationMetadata }>>(
      `/admin/enquiries?page=${page}&limit=${limit}`
    );
    return res.data.data!;
  },

  async getVisits(page = 1, limit = 20) {
    const res = await apiClient.get<ApiResponse<{ items: unknown[]; pagination: SearchPaginationMetadata }>>(
      `/admin/visits?page=${page}&limit=${limit}`
    );
    return res.data.data!;
  },

  async getReports(page = 1, limit = 20, status?: string) {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (status) params.set('status', status);

    const res = await apiClient.get<ApiResponse<{ items: unknown[]; pagination: SearchPaginationMetadata }>>(
      `/admin/reports?${params.toString()}`
    );
    return res.data.data!;
  },

  async updateReportStatus(reportId: string, status: string, resolution?: string) {
    const res = await apiClient.patch<ApiResponse>(`/admin/reports/${reportId}/status`, {
      status,
      resolution,
    });
    return res.data;
  },

  async getAuditLogs(page = 1, limit = 20) {
    const res = await apiClient.get<ApiResponse<{ items: unknown[]; pagination: SearchPaginationMetadata }>>(
      `/admin/audit-logs?page=${page}&limit=${limit}`
    );
    return res.data.data!;
  },

  async getFeatureFlags() {
    const res = await apiClient.get<ApiResponse<Array<{ id: string; key: string; description: string; isEnabled: boolean }>>>(
      '/admin/feature-flags'
    );
    return res.data.data!;
  },

  async toggleFeatureFlag(flagId: string, isEnabled: boolean) {
    const res = await apiClient.patch<ApiResponse>(`/admin/feature-flags/${flagId}`, { isEnabled });
    return res.data;
  },

  async getSystemSettings() {
    const res = await apiClient.get<ApiResponse<Array<{ id: string; key: string; value: string }>>>('/admin/settings');
    return res.data.data!;
  },

  async updateSystemSetting(key: string, value: string) {
    const res = await apiClient.patch<ApiResponse>('/admin/settings', { key, value });
    return res.data;
  },

  async getCMSContents() {
    const res = await apiClient.get<ApiResponse<Array<{ id: string; slug: string; title: string; content: string; metaTitle?: string; metaDesc?: string }>>>(
      '/admin/cms'
    );
    return res.data.data!;
  },

  async upsertCMSContent(data: { slug: string; title: string; content: string; metaTitle?: string; metaDesc?: string }) {
    const res = await apiClient.post<ApiResponse>('/admin/cms', data);
    return res.data;
  },

  async getSystemHealth() {
    const res = await apiClient.get<ApiResponse<{ status: string; database: string; nodeVersion: string; uptimeSeconds: number; environment: string; timestamp: string }>>(
      '/admin/system/health'
    );
    return res.data.data!;
  },
};
