import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LoginCredentials, RegisterCredentials, AuthResponse, User } from '../types/auth';
import { API_CONFIG } from '@/config/api';
const TOKEN_KEY = '@auth_token';

axios.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem(TOKEN_KEY);
    }
    return Promise.reject(error);
  }
);

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await axios.post<AuthResponse>(`${API_CONFIG.BASE_URL}/auth/login`, credentials);
      await AsyncStorage.setItem(TOKEN_KEY, response.data.token);
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    try {
      const response = await axios.post<AuthResponse>(`${API_CONFIG.BASE_URL}/auth/register`, credentials, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      await AsyncStorage.setItem(TOKEN_KEY, response.data.token);
      return response.data;
    } catch (error) { 
      console.error('Register error:', error);
      throw error;
    }
  },

  async logout(): Promise<void> {
    try {
      await AsyncStorage.removeItem(TOKEN_KEY);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },

  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(TOKEN_KEY);
    } catch (error) {
      console.error('Get token error:', error);
      return null;
    }
  },

  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await this.getToken();
      return !!token;
    } catch (error) {
      console.error('Check auth error:', error);
      return false;
    }
  },

  async getMe(): Promise<User> {
    try {
      const response = await axios.get(`${API_CONFIG.BASE_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${await this.getToken()}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Get me error:', error);
    }
  }
};
