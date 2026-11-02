import { apiClient } from './apiClient';
import {
  ApiResponse,
  BrokerListResponse,
  BrokerDetail,
  BrokerQueryInput,
  ContactBrokerInput,
  CreateBrokerInput,
  UpdateBrokerProfileInput,
  PropertySearchSummary,
} from '@housing-clone/shared';

export const brokerService = {
  // Public
  async getBrokers(params?: Partial<BrokerQueryInput>): Promise<BrokerListResponse> {
    const res = await apiClient.get<ApiResponse<BrokerListResponse>>('/brokers/directory', { params });
    return res.data.data!;
  },

  async getBrokerById(id: string): Promise<BrokerDetail> {
    const res = await apiClient.get<ApiResponse<BrokerDetail>>(`/brokers/directory/${id}`);
    return res.data.data!;
  },

  async contactBroker(brokerId: string, input: ContactBrokerInput): Promise<void> {
    await apiClient.post<ApiResponse>(`/brokers/directory/${brokerId}/contact`, input);
  },

  // Self Broker Portal
  async getBrokerDashboardMetrics() {
    const res = await apiClient.get<ApiResponse>('/brokers/dashboard');
    return res.data.data;
  },

  async getMyBrokerProperties() {
    const res = await apiClient.get<ApiResponse<PropertySearchSummary[]>>('/brokers/properties');
    return res.data.data || [];
  },

  async getMyBrokerLeads() {
    const res = await apiClient.get<ApiResponse>('/brokers/leads');
    return res.data.data || [];
  },

  async assignLeadToSubAgent(leadId: string, targetAgentId: string) {
    const res = await apiClient.patch<ApiResponse>(`/brokers/leads/${leadId}/assign`, { targetAgentId });
    return res.data;
  },

  async updateLeadStatusByBroker(leadId: string, status: string, notes?: string) {
    const res = await apiClient.patch<ApiResponse>(`/brokers/leads/${leadId}/status`, { status, notes });
    return res.data;
  },

  async getBrokerTeam() {
    const res = await apiClient.get<ApiResponse>('/brokers/team');
    return res.data.data || [];
  },

  async addSubAgent(input: { firstName: string; lastName: string; email: string; phone: string; password: string }) {
    const res = await apiClient.post<ApiResponse>('/brokers/team', input);
    return res.data;
  },

  async getMyBrokerEnquiries() {
    const res = await apiClient.get<ApiResponse>('/brokers/enquiries');
    return res.data.data || [];
  },

  async getMyBrokerVisits() {
    const res = await apiClient.get<ApiResponse>('/brokers/visits');
    return res.data.data || [];
  },

  async updateBrokerVisitStatus(visitId: string, status: string) {
    const res = await apiClient.patch<ApiResponse>(`/brokers/visits/${visitId}`, { status });
    return res.data;
  },

  async getMyBrokerProfile() {
    const res = await apiClient.get<ApiResponse>('/brokers/profile');
    return res.data.data;
  },

  async updateMyBrokerProfile(input: UpdateBrokerProfileInput) {
    const res = await apiClient.patch<ApiResponse>('/brokers/profile', input);
    return res.data;
  },

  // Admin Broker Management
  async getBrokersForAdmin(page = 1, limit = 20) {
    const res = await apiClient.get<ApiResponse>(`/admin/brokers?page=${page}&limit=${limit}`);
    return res.data.data;
  },

  async createBrokerByAdmin(input: CreateBrokerInput) {
    const res = await apiClient.post<ApiResponse>('/admin/brokers', input);
    return res.data;
  },

  async updateBrokerStatusByAdmin(brokerId: string, status: string) {
    const res = await apiClient.patch<ApiResponse>(`/admin/brokers/${brokerId}/status`, { status });
    return res.data;
  },

  async resetBrokerPasswordByAdmin(brokerId: string, newPassword: string) {
    const res = await apiClient.post<ApiResponse>(`/admin/brokers/${brokerId}/reset-password`, { newPassword });
    return res.data;
  },
};
