import axios from 'axios';
import { User } from '@/types/auth';
import { authService } from './auth';
import { API_CONFIG } from '@/config/api';

export const userService = {
  async searchUsers(query: string): Promise<User[]> {
    try {
      const token = await authService.getToken();
      if (!token) {
        throw new Error('Non authentifié');
      }

      const response = await axios.get<User[]>(`${API_CONFIG.BASE_URL}/users/search`, {
        params: { q: query },
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Search users error:', error);
      throw error;
    }
  },
};
