import { Stat } from "@/types/stat";
import { SprintOverview } from "../types/sprint";
import { Task, TasksByStatus } from "../types/task";
import { API_CONFIG } from '@/config/api';
import { authService } from "./auth";

interface CreateSprintData {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
}

const formatDateForApi = (date: string): string => {
  const [year, month, day] = date.split('T')[0].split('-');
  return `${year}-${month}-${day}`;
};

export const sprintService = {

  createSprint: async (projectName: string, data: CreateSprintData): Promise<Response> => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/sprints/${encodeURIComponent(projectName)}/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await authService.getToken()}`,
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
   

  deleteSprint: async (sprintName: string): Promise<Response> => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/sprints/delete/${encodeURIComponent(sprintName)}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${await authService.getToken()}`,
      }
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la suppression du sprint');
    }

    return response;
  },

  statSprint: async (sprintName: string) : Promise<Stat> => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/sprints/${encodeURIComponent(sprintName)}/stats`, {
      headers: {
        'Authorization': `Bearer ${await authService.getToken()}`,
      }
    });
    
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des stats');
    }

    return response.json();
  },


};
