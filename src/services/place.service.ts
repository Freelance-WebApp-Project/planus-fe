import { apiService } from './api.service';
import { API_CONFIG } from '../constants/api.constants';
import {
  Place,
  QueryPlaceDto,
  PlaceListApiResponse,
  PlaceResponse,
  RandomPlacesApiResponse,
} from '../types/place.types';

class PlaceService {
  /**
   * Get all places with pagination and filtering
   * @param query - Query parameters for filtering and pagination
   * @returns Promise<PlaceListApiResponse>
   */
  async getAll(query: QueryPlaceDto = {}): Promise<PlaceListApiResponse> {
    try {
      // Build query string from parameters
      const queryParams = new URLSearchParams();
      
      if (query.page) queryParams.append('page', query.page.toString());
      if (query.limit) queryParams.append('limit', query.limit.toString());
      if (query.search) queryParams.append('search', query.search);
      if (query.sortBy) queryParams.append('sortBy', query.sortBy);
      if (query.sortOrder) queryParams.append('sortOrder', query.sortOrder);
      if (query.type) queryParams.append('type', query.type);
      if (query.city) queryParams.append('city', query.city);
      if (query.minRating) queryParams.append('minRating', query.minRating.toString());
      if (query.priceRange) queryParams.append('priceRange', query.priceRange.toString());
      if (query.tags && query.tags.length > 0) {
        query.tags.forEach(tag => queryParams.append('tags', tag));
      }

      const queryString = queryParams.toString();
      const endpoint = queryString 
        ? `${API_CONFIG.ENDPOINTS.PLACE.GET_ALL}?${queryString}`
        : API_CONFIG.ENDPOINTS.PLACE.GET_ALL;

      const response = await apiService.get<any>(endpoint);
      
      // Handle the actual API response structure
      if (response.success && response.data) {
        // The API returns { code: 200, data: { records: [], total: 0 }, message: "Success", success: true }
        const apiData = response.data.data || response.data;
        return {
          success: true,
          data: {
            records: apiData.records || [],
            total: apiData.total || 0,
            page: apiData.page || 1,
            size: apiData.size || 10,
            lastPage: apiData.lastPage || 1,
          }
        };
      }
      
      return response;
    } catch (error) {
      return {
        success: false,
        error: {
          message: 'Failed to fetch places',
          statusCode: 500,
          timestamp: new Date().toISOString(),
          path: API_CONFIG.ENDPOINTS.PLACE.GET_ALL,
        },
      };
    }
  }

  /**
   * Get a single place by ID
   * @param id - Place ID
   * @returns Promise<PlaceResponse>
   */
  async getOne(id: string): Promise<PlaceResponse> {
    try {
      if (!id) {
        return {
          success: false,
          error: {
            message: 'Place ID is required',
            statusCode: 400,
            timestamp: new Date().toISOString(),
            path: API_CONFIG.ENDPOINTS.PLACE.GET_ONE,
          },
        };
      }

      const endpoint = `${API_CONFIG.ENDPOINTS.PLACE.GET_ONE}/${id}`;
      const response = await apiService.get<any>(endpoint);
      
      // Handle the actual API response structure
      if (response.success && response.data) {
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
          message: 'Failed to fetch place',
          statusCode: 500,
          timestamp: new Date().toISOString(),
          path: API_CONFIG.ENDPOINTS.PLACE.GET_ONE,
        },
      };
    }
  }

  /**
   * Get random places
   * @returns Promise<Place[]>
   */
  async getRandom(): Promise<Place[]> {
    try {
      const response = await apiService.get<RandomPlacesApiResponse>(
        API_CONFIG.ENDPOINTS.PLACE.RANDOM
      );
      
      if (response.success && response.data && response.data.data) {
        return response.data.data;
      }
      
      return [];
    } catch (error) {
      console.error('Failed to fetch random places:', error);
      return [];
    }
  }
}

export const placeService = new PlaceService();
