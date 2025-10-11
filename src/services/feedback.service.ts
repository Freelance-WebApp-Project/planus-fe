import { API_CONFIG } from "../constants/api.constants";
import {
  CreateFeedbackRequest,
  CreateFeedbackResponse,
} from "../types/feedback.types";
import { apiService } from "./api.service";

class FeedbackService {
  /**
   * Gửi đánh giá (feedback) cho địa điểm
   * @param request - Dữ liệu feedback
   * @returns Promise<CreateFeedbackResponse>
   */
  async createFeedback(
    request: CreateFeedbackRequest
  ): Promise<CreateFeedbackResponse> {
    try {
      const response = await apiService.post<CreateFeedbackResponse>(
        API_CONFIG.ENDPOINTS.FEEDBACK.CREATE,
        request
      );

      const apiData = response.data as any; // ✅ Dùng kiểu linh hoạt cho dữ liệu trả về

      if (response.success && apiData) {
        return {
          code: apiData.code ?? 200,
          success: true,
          message: apiData.message ?? "Gửi feedback thành công",
          data: {
            placeId: apiData.data?.placeId || "",
            userId: apiData.data?.userId || "",
            rating: apiData.data?.rating || 0,
            comment: apiData.data?.comment || "",
            images: apiData.data?.images || [],
          },
        };
      }

      return {
        code: apiData?.code ?? 400,
        success: false,
        message: apiData?.message ?? "Gửi feedback thất bại",
        data: {
          placeId: "",
          userId: "",
          rating: 0,
          comment: "",
          images: [],
        },
      };
    } catch (error: any) {
      return {
        code: 500,
        success: false,
        message: "Lỗi khi gửi feedback",
        data: {
          placeId: "",
          userId: "",
          rating: 0,
          comment: "",
          images: [],
        },
        error: {
          message: error?.message || "Internal Server Error",
          statusCode: 500,
          timestamp: new Date().toISOString(),
          path: API_CONFIG.ENDPOINTS.FEEDBACK.CREATE,
        },
      };
    }
  }

  async getReviewsByPlaceId(placeId: string): Promise<any> {
    try {
      const response = await apiService.get<any>(
        `${API_CONFIG.ENDPOINTS.FEEDBACK.GETPLACEID}/${placeId}`
      );
      return response;
    } catch (error) {
      console.error("Error fetching reviews:", error);
      throw error;
    }
  }
}

export const feedbackService = new FeedbackService();
