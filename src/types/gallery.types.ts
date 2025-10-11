export interface GalleryItem {
  _id: string;
  imageUrl: string;
}

export interface GalleryUploadResponse {
  code: number;
  success: boolean;
  message: string;
  data: GalleryItem[];
  error?: {
    message: string;
    statusCode?: number;
    timestamp?: string;
    path?: string;
  };
}