import { Task } from '@/types/task';

const API_URL = 'http://sprintify.mathieugr.fr:3000/api';

export const taskService = {
  async getTasks(sprintName: string): Promise<Task[]> {
    const response = await fetch(`${API_URL}/tasks/${encodeURIComponent(sprintName)}`);
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des tâches');
    }
    return response.json();
  },

  async createTask(sprintName: string, task: Omit<Task, 'id'>): Promise<void> {
    const response = await fetch(`${API_URL}/tasks/create/${encodeURIComponent(sprintName)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task),
    });
    if (!response.ok) {
      throw new Error('Erreur lors de la création de la tâche');
    }
  },

  async updateTask(taskTitle: string, task: Partial<Task>): Promise<void> {
    const response = await fetch(`${API_URL}/tasks/update/${encodeURIComponent(taskTitle)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task),
    });
    if (!response.ok) {
      throw new Error('Erreur lors de la mise à jour de la tâche');
    }
  },

  async deleteTask(taskTitle: string): Promise<void> {
    const response = await fetch(`${API_URL}/tasks/delete/${encodeURIComponent(taskTitle)}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Erreur lors de la suppression de la tâche');
    }
  },
};
