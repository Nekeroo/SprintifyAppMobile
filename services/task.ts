import { Task, TaskCreationPayload } from '@/types/task';
import { API_CONFIG } from '@/config/api';
import { authService } from './auth';

export const taskService = {
  async getTasks(sprintName: string): Promise<Task[]> {
    const response = await fetch(`${API_CONFIG.BASE_URL}/tasks/${encodeURIComponent(sprintName)}`, {
      headers: {
        'Authorization': `Bearer ${await authService.getToken()}`,
      }
    });
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Erreur d\'authentification. Veuillez vous reconnecter.');
      }
      throw new Error('Erreur lors de la récupération des tâches');
    }
    return response.json();
  },

  async createTask(sprintName: string, task: TaskCreationPayload): Promise<void> {
    const response = await fetch(`${API_CONFIG.BASE_URL}/tasks/${encodeURIComponent(sprintName)}`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json', 
        'Authorization': `Bearer ${await authService.getToken()}` 
      },
      body: JSON.stringify(task),
    });
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Erreur d\'authentification. Veuillez vous reconnecter.');
      }
      throw new Error('Erreur lors de la création de la tâche');
    }
  },

  async updateTask(taskTitle: string, task: Partial<Task>): Promise<void> {
    const response = await fetch(`${API_CONFIG.BASE_URL}/tasks/update/${encodeURIComponent(taskTitle)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${await authService.getToken()}` },
      body: JSON.stringify(task),
    });
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Erreur d\'authentification. Veuillez vous reconnecter.');
      }
      throw new Error('Erreur lors de la mise à jour de la tâche');
    }
  },

  async deleteTask(taskTitle: string): Promise<void> {
    const response = await fetch(`${API_CONFIG.BASE_URL}/tasks/delete/${encodeURIComponent(taskTitle)}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${await authService.getToken()}` },
    });
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Erreur d\'authentification. Veuillez vous reconnecter.');
      }
      throw new Error('Erreur lors de la suppression de la tâche');
    }
  },
};
