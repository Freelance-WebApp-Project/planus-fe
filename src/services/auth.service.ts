import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from './api.service';
import { STORAGE_KEYS } from '../constants/api.constants';
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  User,
  ApiResponse,
} from '../types/auth.types';

class AuthService {
  private accessToken: string | null = null;
  private user: User | null = null;

  constructor() {
    this.initializeAuth();
  }

  private async initializeAuth() {
    try {
      const [token, userData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN),
        AsyncStorage.getItem(STORAGE_KEYS.USER_DATA),
      ]);

      if (token && userData) {
        this.accessToken = token;
        this.user = JSON.parse(userData);
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
    }
  }

  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    try {
      const response = await apiService.post<LoginResponse>('/auth/login', credentials);
      
      if (response.success && response.data) {
        // Handle nested data structure: response.data.data
        const actualData = response.data.data || response.data;
        
        this.accessToken = actualData.accessToken;
        this.user = actualData.user;
        
        // Store in AsyncStorage - only if values are not null/undefined
        const promises = [];
        
        if (actualData.accessToken) {
          promises.push(AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, actualData.accessToken));
        }
        
        if (actualData.user) {
          promises.push(AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(actualData.user)));
        }
        
        if (promises.length > 0) {
          await Promise.all(promises);
        }
      }

      return response;
    } catch (error) {
      return {
        success: false,
        error: {
          message: 'Login failed',
          args: [error instanceof Error ? error.message : 'Unknown error'],
        },
      };
    }
  }

  async register(userData: RegisterRequest): Promise<ApiResponse<RegisterResponse>> {
    try {
      const response = await apiService.post<RegisterResponse>('/auth/register', userData);
      
      if (response.success && response.data) {
        // Handle nested data structure: response.data.data
        const actualData = response.data.data || response.data;
        
        this.user = actualData.user;
        
        // Only save to AsyncStorage if user data exists
        if (actualData.user) {
          await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(actualData.user));
        }
      }

      return response;
    } catch (error) {
      return {
        success: false,
        error: {
          message: 'Registration failed',
          args: [error instanceof Error ? error.message : 'Unknown error'],
        },
      };
    }
  }

  async logout(): Promise<ApiResponse<boolean>> {
    try {
      if (this.accessToken) {
        await apiService.post('/auth/logout', {}, {
          Authorization: `Bearer ${this.accessToken}`,
        });
      }

      // Clear local storage
      this.accessToken = null;
      this.user = null;
      
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN),
        AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA),
      ]);

      return { success: true, data: true };
    } catch (error) {
      // Even if API call fails, clear local data
      this.accessToken = null;
      this.user = null;
      
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN),
        AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA),
      ]);

      return { success: true, data: true };
    }
  }

  async refreshToken(): Promise<ApiResponse<{ accessToken: string }>> {
    try {
      const response = await apiService.post<{ accessToken: string }>('/auth/refresh-token');
      
      if (response.success && response.data) {
        this.accessToken = response.data.accessToken;
        await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.data.accessToken);
      }

      return response;
    } catch (error) {
      return {
        success: false,
        error: {
          message: 'Token refresh failed',
          args: [error instanceof Error ? error.message : 'Unknown error'],
        },
      };
    }
  }

  async loginWithGoogle(googleUser: { email: string; fullName?: string }): Promise<ApiResponse<LoginResponse>> {
    try {
      const response = await apiService.post<LoginResponse>('/auth/google', googleUser);
      
      if (response.success && response.data) {
        // Handle nested data structure: response.data.data
        const actualData = response.data.data || response.data;
        
        this.accessToken = actualData.accessToken;
        this.user = actualData.user;
        
        // Store in AsyncStorage - only if values are not null/undefined
        const promises = [];
        
        if (actualData.accessToken) {
          promises.push(AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, actualData.accessToken));
        }
        
        if (actualData.user) {
          promises.push(AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(actualData.user)));
        }
        
        if (promises.length > 0) {
          await Promise.all(promises);
        }
      }

      return response;
    } catch (error) {
      return {
        success: false,
        error: {
          message: 'Google login failed',
          args: [error instanceof Error ? error.message : 'Unknown error'],
        },
      };
    }
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  getUser(): User | null {
    return this.user;
  }

  isAuthenticated(): boolean {
    return !!this.accessToken && !!this.user;
  }

  getAuthHeaders(): Record<string, string> {
    return this.accessToken ? { Authorization: `Bearer ${this.accessToken}` } : {};
  }
}

export const authService = new AuthService();
