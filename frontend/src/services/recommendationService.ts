import { apiClient } from './apiClient';
import { ApiResponse, PropertySearchSummary, UpdatePreferencesInput } from '@housing-clone/shared';

export interface ScoredProperty {
  property: PropertySearchSummary;
  score: number;
  reasons: string[];
}

export interface RecommendationFeedResult {
  algorithmVersion: string;
  items: ScoredProperty[];
  generatedAt: string;
}

export const recommendationService = {
  async getPersonalizedFeed(limit = 12): Promise<RecommendationFeedResult> {
    const res = await apiClient.get<ApiResponse<RecommendationFeedResult>>(`/recommendations?limit=${limit}`);
    return res.data.data!;
  },

  async getSimilarProperties(propertyId: string, limit = 4): Promise<ScoredProperty[]> {
    const res = await apiClient.get<ApiResponse<ScoredProperty[]>>(`/recommendations/properties/${propertyId}/similar?limit=${limit}`);
    return res.data.data || [];
  },

  async getUserPreferences() {
    const res = await apiClient.get<ApiResponse<unknown>>('/recommendations/preferences');
    return res.data.data;
  },

  async updateUserPreferences(input: UpdatePreferencesInput) {
    const res = await apiClient.patch<ApiResponse>('/recommendations/preferences', input);
    return res.data;
  },

  async recordFeedback(propertyId: string, feedback: 'NOT_INTERESTED' | 'MORE_LIKE_THIS') {
    const res = await apiClient.post<ApiResponse>('/recommendations/feedback', { propertyId, feedback });
    return res.data;
  },
};
