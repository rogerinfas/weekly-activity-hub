import { apiClient } from './client.config';
import { Task } from '@/lib/types';

export const tasksApi = {
  // GET /tasks
  getAll: async (): Promise<Task[]> => {
    const { data } = await apiClient.get<Task[]>('/tasks');
    return data;
  },

  // POST /tasks
  create: async (taskDraft: Omit<Task, 'id' | 'createdAt' | 'completedAt'>): Promise<Task> => {
    // Ensuring date strings instead of Date objects depending on backend needs, but we map simple types
    const { data } = await apiClient.post<Task>('/tasks', taskDraft);
    return data;
  },

  // PATCH /tasks/:id
  update: async (id: string, payload: Partial<Task>): Promise<Task> => {
    // Destructure not updatable fields just in case
    const { id: _id, createdAt: _createdAt, ...updateData } = payload as any;
    
    const { data } = await apiClient.patch<Task>(`/tasks/${id}`, updateData);
    return data;
  },

  // DELETE /tasks/:id
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/tasks/${id}`);
  }
};
