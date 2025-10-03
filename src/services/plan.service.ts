import { apiService } from './api.service';
import { API_CONFIG } from '../constants/api.constants';
import {
  GeneratePlanRequest,
  GeneratePlanResponse,
  TravelPlan,
} from '../types/plan.types';

class PlanService {
  /**
   * Generate travel plans based on user preferences and location
   * @param request - Travel plan generation request
   * @returns Promise<GeneratePlanResponse>
   */
  async generatePlan(request: GeneratePlanRequest): Promise<GeneratePlanResponse> {
    try {
      console.log('Generating plan with request:', request);
      const response = await apiService.post<GeneratePlanResponse['data']>(
        API_CONFIG.ENDPOINTS.PLAN.GENERATE,
        request
      );
 console.log('Generating plan with request:', request);
      // Handle the actual API response structure
      if (response.success && response.data) {
        // The API returns { code: 200, data: { plans: [] }, message: "Success", success: true }
        const apiData = response.data as any;

        console.log('API response data:', response);

        return {
          success: true,
          data: {
            plans: apiData.data.plans || [],
          }
        };
      }

      return response;
    } catch (error) {
      return {
        success: false,
        error: {
          message: 'Failed to generate travel plan',
          statusCode: 500,
          timestamp: new Date().toISOString(),
          path: API_CONFIG.ENDPOINTS.PLAN.GENERATE,
        },
      };
    }
  }

}

export const planService = new PlanService();
