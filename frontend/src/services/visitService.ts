import { apiClient } from './apiClient';
import { ApiResponse, CreateVisitInput, VisitStatus } from '@housing-clone/shared';

export interface PropertyVisitRecord {
  id: string;
  propertyId: string;
  requesterId: string;
  assignedUserId: string;
  scheduledDate: string;
  timeSlot: string;
  status: VisitStatus;
  notes?: string;
  property: { id: string; title: string; slug: string; address: string };
  requester?: { id: string; firstName: string; lastName: string; phone: string };
}

export const visitService = {
  async createVisit(input: CreateVisitInput): Promise<PropertyVisitRecord> {
    const res = await apiClient.post<ApiResponse<PropertyVisitRecord>>('/property-visits', input);
    return res.data.data!;
  },

  async getUserVisits(): Promise<PropertyVisitRecord[]> {
    const res = await apiClient.get<ApiResponse<{ items: PropertyVisitRecord[] }>>('/property-visits');
    return res.data.data?.items || [];
  },

  async updateVisitStatus(visitId: string, status: VisitStatus, notes?: string): Promise<void> {
    await apiClient.patch<ApiResponse>(`/property-visits/${visitId}/status`, { status, notes });
  },
};
