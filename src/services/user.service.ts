import { apiService } from './api.service';
import { ApiResponse } from '../types/auth.types';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UpdateProfileRequest {
  fullName: string;
  email: string;
  gender: string;
  dob?: any;
  income?: any;
  avatar?: any;
  favorites: string[];
}

export interface UpdateProfileResponse {
  success: boolean;
  message: string;
  user?: any;
}

class UserService {
  async updateProfile(profileData: UpdateProfileRequest): Promise<ApiResponse<UpdateProfileResponse>> {
    try {
      // Check if token exists
      const accessToken = await AsyncStorage.getItem('access_token');
      console.log('Access Token exists:', !!accessToken);
      
      if (!accessToken) {
        return {
          success: false,
          error: {
            message: 'No access token found',
            args: ['Please login again'],
          },
        };
      }

      // Try different possible endpoints
      const response = await apiService.put<UpdateProfileResponse>('/users/update-profile', profileData);
      return response;
    } catch (error) {
      return {
        success: false,
        error: {
          message: 'Update profile failed',
          args: [error instanceof Error ? error.message : 'Unknown error'],
        },
      };
    }
  }
}

export const userService = new UserService();
