import axios from 'axios';
import { Project } from '@/types/project';
import { authService } from './auth';

const API_URL = 'http://sprintify.mathieugr.fr:3000/api';

export const projectService = {
  async getAllProjects(): Promise<Project[]> {
    try {
      const token = await authService.getToken();
      if (!token) {
        throw new Error('Non authentifié');
      }

      const response = await axios.get<Project[]>(`${API_URL}/projects/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Get projects error:', error);
      throw error;
    }
  },
};
