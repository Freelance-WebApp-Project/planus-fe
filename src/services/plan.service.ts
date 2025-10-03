import { apiService } from "./api.service";
import { API_CONFIG } from "../constants/api.constants";
import {
  GeneratePlanRequest,
  GeneratePlanResponse,
  TravelPlan,
} from "../types/plan.types";

class PlanService {
  /**
   * Generate travel plans based on user preferences and location
   * @param request - Travel plan generation request
   * @returns Promise<GeneratePlanResponse>
   */
  async generatePlan(
    request: GeneratePlanRequest
  ): Promise<GeneratePlanResponse | undefined> {
    try {
      const response = await apiService.post<GeneratePlanResponse>(
        API_CONFIG.ENDPOINTS.PLAN.GENERATE,
        request
      );

      console.log("Response:", response);
      
      // Handle the actual API response structure
      if (response.success && response.data) {
        // The API returns { code: 200, data: { plans: [] }, message: "Success", success: true }
        const apiData = response.data as any;

        return {
          success: true,
          code: apiData.code,
          message: apiData.message,
          data: {
            plans: apiData.data.plans || [],
          },
        };
      }
    } catch (error) {
      return {
        success: false,
        code: 500,
        message: "Failed to generate travel plan",
        data: {
          plans: [],
        },
        error: {
          message: "Failed to generate travel plan",
          statusCode: 500,
          timestamp: new Date().toISOString(),
          path: API_CONFIG.ENDPOINTS.PLAN.GENERATE,
        },
      };
    }
  }
}

export const planService = new PlanService();
