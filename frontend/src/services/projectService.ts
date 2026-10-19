import { apiClient } from './apiClient';
import { ApiResponse, ProjectDetail } from '@housing-clone/shared';

export const projectService = {
  async getProjectBySlug(slug: string): Promise<ProjectDetail> {
    const res = await apiClient.get<ApiResponse<ProjectDetail>>(`/projects/${slug}`);
    return res.data.data!;
  },

  async getProjects(): Promise<ProjectDetail[]> {
    const res = await apiClient.get<ApiResponse<ProjectDetail[]>>('/projects');
    return res.data.data || [];
  },
};
