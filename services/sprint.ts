import { Sprint, SprintOverview } from "../types/sprint";
import { Task, TasksByStatus } from "../types/task";

interface CreateSprintData {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
}

interface UpdateTaskData {
  title: string;
  description: string;
  status: string;
  dueDate: string;
  usernameAssignee: string;
  storyPoints: number;
}

interface CreateTaskData {
  name: string;
  description: string;
  dueDate: string;
  storyPoints: number;
  assignee: string;
}

const API_URL = 'http://sprintify.mathieugr.fr:3000/api';

const formatDateForApi = (date: string): string => {
  const [year, month, day] = date.split('T')[0].split('-');
  return `${year}-${month}-${day}`;
};

export const sprintService = {
  getSprints: async (projectName: string): Promise<SprintOverview[]> => {
    const response = await fetch(`${API_URL}/sprints/${encodeURIComponent(projectName)}`);
    
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des sprints');
    }

    return response.json();
  },

  createSprint: async (projectName: string, data: CreateSprintData): Promise<Response> => {
    const response = await fetch(`${API_URL}/sprints/${encodeURIComponent(projectName)}/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...data,
        startDate: formatDateForApi(data.startDate),
        endDate: formatDateForApi(data.endDate),
      }),
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la création du sprint');
    }

    return response;
  },
  
  getTasks: async (sprintName: string): Promise<Task[]> => {
    const response = await fetch(`${API_URL}/tasks/${encodeURIComponent(sprintName)}`);
    
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des tâches');
    }

    return response.json();
  },
  
  // Fonction utilitaire pour organiser les tâches par statut (colonnes)
  organizeTasksByStatus: (tasks: Task[]): TasksByStatus => {
    return tasks.reduce((acc: TasksByStatus, task: Task) => {
      if (!acc[task.status]) {
        acc[task.status] = [];
      }
      acc[task.status].push(task);
      return acc;
    }, {});
  },
  
  // Crée une nouvelle tâche dans un sprint
  createTask: async (sprintName: string, data: CreateTaskData): Promise<Response> => {
    const response = await fetch(`${API_URL}/tasks/${encodeURIComponent(sprintName)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la création de la tâche');
    }

    return response;
  },
  
  // Met à jour une tâche existante
  updateTask: async (taskName: string, updatedTask: UpdateTaskData): Promise<Response> => {
      const response = await fetch(`${API_URL}/tasks/update/${encodeURIComponent(taskName)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedTask),
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la mise à jour de la tâche');
    }

    return response;
  },

  deleteSprint: async (sprintName: string): Promise<Response> => {
    const response = await fetch(`${API_URL}/sprints/delete/${encodeURIComponent(sprintName)}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la suppression du sprint');
    }

    return response;
  },

  deleteTask: async (taskName: string): Promise<Response> => {
    const response = await fetch(`${API_URL}/tasks/delete/${encodeURIComponent(taskName)}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la suppression de la tâche');
    }

    return response;
  },
};
