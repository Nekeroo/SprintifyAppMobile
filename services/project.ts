import axios from 'axios';
import { Project } from '@/types/project';
import { authService } from './auth';
import { User } from '@/types/user';

const API_URL = 'http://sprintify.mathieugr.fr:3000/api';

interface CreateProjectData {
  name: string;
  description: string;
  owner: User;
}

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

  async createProject(data: CreateProjectData): Promise<Project> {
    try {
      const token = await authService.getToken();
      if (!token) {
        throw new Error('Non authentifié');
      }

      const response = await axios.post<Project>(`${API_URL}/projects/`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Create project error:', error);
      throw error;
    }
  },

  async getProjectDetails(projectName: string): Promise<Project> {
    try {
      const token = await authService.getToken();
      if (!token) {
        throw new Error('Non authentifié');
      }

      const response = await axios.get<Project>(`${API_URL}/projects/${encodeURIComponent(projectName)}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.data) {
        throw new Error('Erreur lors de la récupération du projet');
      }
      return response.data;
    } catch (error) {
      console.error('Get project details error:', error);
      throw error;
    }
  },
};
