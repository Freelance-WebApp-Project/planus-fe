import { ApiResponse } from "../types/auth.types";
import { API_CONFIG } from "../constants/api.constants";
import AsyncStorage from "@react-native-async-storage/async-storage";

class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const accessToken = await AsyncStorage.getItem("access_token");

      // ⚙️ Nếu body là FormData thì KHÔNG set Content-Type
      const isFormData = options.body instanceof FormData;

      const defaultHeaders: Record<string, string> = {};

      // ✅ Chỉ set Content-Type khi KHÔNG phải FormData
      if (!isFormData) {
        defaultHeaders["Content-Type"] = "application/json";
      }

      if (accessToken) {
        defaultHeaders["Authorization"] = `Bearer ${accessToken}`;
      }

      const config: RequestInit = {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
      };

      console.log("API Request:", {
        url,
        method: options.method || "GET",
        headers: config.headers,
        body: options.body,
      });

      const response = await fetch(url, config);
      const data = await response.json();

      console.log("API Response:", {
        status: response.status,
        statusText: response.statusText,
        data,
      });

      if (!response.ok) {
        const errorMessage =
          data.errors ||
          data.message ||
          data.error?.message ||
          "An error occurred";
        return {
          success: false,
          error: {
            message: errorMessage,
            statusCode: data.statusCode,
            timestamp: data.timestamp,
            path: data.path,
          },
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: "Network error",
          args: [error instanceof Error ? error.message : "Unknown error"],
        },
      };
    }
  }

  async get<T>(
    endpoint: string,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "GET",
      headers,
    });
  }

  async post<T>(
    endpoint: string,
    data?: any,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    const isFormData = data instanceof FormData;

    return this.request<T>(endpoint, {
      method: "POST",
      body: isFormData ? data : data ? JSON.stringify(data) : undefined,
      headers: headers || {},
    });
  }

  async put<T>(
    endpoint: string,
    data?: any,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
      headers,
    });
  }

  async delete<T>(
    endpoint: string,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "DELETE",
      headers,
    });
  }
}

export const apiService = new ApiService();
