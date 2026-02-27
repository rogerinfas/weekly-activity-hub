import { apiClient } from './client.config';
import { ApiProject } from '@/lib/types';

export const projectsApi = {
  getAll: async (): Promise<ApiProject[]> => {
    const { data } = await apiClient.get<ApiProject[]>('/projects');
    return data;
  },

  create: async (draft: Omit<ApiProject, 'id'>): Promise<ApiProject> => {
    const { data } = await apiClient.post<ApiProject>('/projects', draft);
    return data;
  },

  update: async (id: string, payload: Partial<ApiProject>): Promise<ApiProject> => {
    const { id: _id, ...updateData } = payload as Record<string, unknown>;
    const { data } = await apiClient.patch<ApiProject>(`/projects/${id}`, updateData);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/projects/${id}`);
  },
};
