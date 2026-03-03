import { apiClient } from './client.config';
import { Task, Status } from '@/lib/types';

export const tasksApi = {
  // GET /tasks
  getAll: async (): Promise<Task[]> => {
    const { data } = await apiClient.get<Task[]>('/tasks');
    return data;
  },

  // POST /tasks
  create: async (taskDraft: Omit<Task, 'id' | 'createdAt' | 'completedAt'>): Promise<Task> => {
    const { data } = await apiClient.post<Task>('/tasks', taskDraft);
    return data;
  },

  // PATCH /tasks/:id
  update: async (id: string, payload: Partial<Task>): Promise<Task> => {
    const { id: _id, createdAt: _createdAt, ...updateData } = payload as any;
    const { data } = await apiClient.patch<Task>(`/tasks/${id}`, updateData);
    return data;
  },

  // PATCH /tasks/reorder/batch
  reorderBatch: async (
    changes: { id: string; status: Status; order: number }[],
  ): Promise<Task[]> => {
    const { data } = await apiClient.patch<Task[]>('/tasks/reorder/batch', {
      updates: changes,
    });
    return data;
  },

  // POST /tasks/:id/timer/start
  startTimer: async (id: string): Promise<Task> => {
    const { data } = await apiClient.post<Task>(`/tasks/${id}/timer/start`, {});
    return data;
  },

  // POST /tasks/:id/timer/stop
  stopTimer: async (id: string): Promise<Task> => {
    const { data } = await apiClient.post<Task>(`/tasks/${id}/timer/stop`, {});
    return data;
  },

  // GET /tasks/metrics
  getMetrics: async (params: {
    startDate?: string;
    endDate?: string;
  }): Promise<{
    tasks: Task[];
    summary: {
      total: number;
      completed: number;
      inProgress: number;
      topProject: { project: string; count: number } | null;
      totalTrackedSecondsGlobal: number;
      timeByProject: { project: string; totalSeconds: number }[];
      topTasksByTime: {
        id: string;
        title: string;
        project: string;
        totalSeconds: number;
      }[];
    };
  }> => {
    const { data } = await apiClient.get('/tasks/metrics', { params });
    return data;
  },

  // DELETE /tasks/:id
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/tasks/${id}`);
  }
};
