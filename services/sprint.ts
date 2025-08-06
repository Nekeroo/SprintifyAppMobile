interface CreateSprintData {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
}

const API_URL = 'http://sprintify.mathieugr.fr:3000/api';

export const sprintService = {
  createSprint: async (projectName: string, data: CreateSprintData): Promise<Response> => {
    const response = await fetch(`${API_URL}/sprints/${encodeURIComponent(projectName)}/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la création du sprint');
    }

    return response;
  }
};
