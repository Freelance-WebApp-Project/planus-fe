import { API_CONFIG } from "../constants/api.constants";
import { GalleryItem, GalleryUploadResponse } from "../types/gallery.types";
import { apiService } from "./api.service";

class GalleryService {
  /**
   * Upload nhiều hình ảnh lên server và trả về danh sách Gallery (_id, imageUrl)
   * @param imageUris - Mảng URI ảnh từ ImagePicker
   * @returns Promise<GalleryItem[]>
   */
  async uploadImages(imageUris: string[]): Promise<GalleryItem[]> {
    if (!imageUris || imageUris.length === 0) return [];

    const formData = new FormData();

    imageUris.forEach((uri, index) => {
      formData.append("images", {
        uri,
        type: "image/jpeg",
        name: `photo-${Date.now()}-${index}.jpg`,
      } as any);
    });

    try {
      const response = await apiService.post<GalleryUploadResponse>(
        API_CONFIG.ENDPOINTS.GALLERY.UPLOAD,
        formData
      );

      const apiData = response.data as any;

      console.log("🔵 Gallery Service - Upload response:", {
        success: response.success,
        data: apiData,
        error: response.error,
      });

      if (response.success && apiData?.data) {
        // ✅ Nếu BE trả về mảng Gallery
        const galleryItems = apiData.data.map((item: any) => ({
          _id: item._id,
          imageUrl: item.imageUrl,
        }));

        console.log(
          "✅ Gallery Service - Uploaded successfully:",
          galleryItems
        );
        return galleryItems;
      }

      console.log("❌ Gallery Service - Upload failed:", apiData);
      return [];
    } catch (error) {
      console.error("❌ Lỗi khi upload ảnh:", error);
      return [];
    }
  }
}

export const galleryService = new GalleryService();
