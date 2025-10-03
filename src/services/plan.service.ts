import { apiService } from "./api.service";
import { API_CONFIG } from "../constants/api.constants";
import {
  GeneratePlanRequest,
  GeneratePlanResponse,
  GetAllPlansResponse,
  QueryPlanDto,
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

  /**
   * Get all plans with optional filtering and pagination
   * @param query - Query parameters for filtering and pagination
   * @returns Promise<GetAllPlansResponse>
   */
  async getAll(query: QueryPlanDto = {}): Promise<GetAllPlansResponse> {
    try {
      console.log("Getting all plans with query:", query);
      
      const response = await apiService.get<GetAllPlansResponse["data"]>(
        API_CONFIG.ENDPOINTS.PLAN.GET_ME,
        query as Record<string, string>
      );

      console.log("Get all plans response:", response);

      if (response.success && response.data) {
        const apiData = response.data as any;

        return {
          success: true,
          code: apiData.code || 200,
          message: apiData.message || "Success",
          data: {
            records: apiData.data.records || [],
            total: apiData.data.total || 0,
            lastPage: apiData.data.lastPage || 1,
            page: apiData.data.page || 1,
            size: apiData.data.size || 25,
          },
        };
      }

      return {
        success: response.success,
        code: 200,
        message: "Success",
        data: response.data || {
          records: [],
          total: 0,
          lastPage: 1,
          page: 1,
          size: 25,
        },
      };
    } catch (error) {
      return {
        success: false,
        code: 500,
        message: "Failed to get plans",
        data: {
          records: [],
          total: 0,
          lastPage: 1,
          page: 1,
          size: 25,
        },
        error: {
          message: "Failed to get plans",
          statusCode: 500,
          timestamp: new Date().toISOString(),
          path: API_CONFIG.ENDPOINTS.PLAN.GET_ALL,
        },
      };
    }
  }
}

export const planService = new PlanService();
