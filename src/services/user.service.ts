import { apiService } from './api.service';
import { ApiResponse, User } from '../types/auth.types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UpdateProfileRequest, UpdateProfileResponse } from '../types/user.types';

class UserService {
  /**
   * Get current user information
   * @returns Promise<ApiResponse<User>>
   */
  async getMe(): Promise<ApiResponse<User>> {
    try {
      const response = await apiService.get<any>('/users/get-me');
      
      if (response.success && response.data) {
        // Handle the nested data structure: response.data.data
        const apiData = response.data.data || response.data;
        return {
          success: true,
          data: apiData
        };
      }
      
      return response;
    } catch (error) {
      return {
        success: false,
        error: {
          message: 'Failed to get user information',
          args: [error instanceof Error ? error.message : 'Unknown error'],
        },
      };
    }
  }

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
