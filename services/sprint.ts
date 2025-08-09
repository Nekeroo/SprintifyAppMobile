import { Sprint, SprintOverview } from "../types/sprint";

interface CreateSprintData {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
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
  }
};
