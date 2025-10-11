export interface CreateFeedbackRequest {
  placeId: string;
  rating: number;
  comment: string;
  images?: string[];
}

export interface CreateFeedbackResponse {
  code: number;
  success: boolean;
  message: string;
  data: {
    placeId: string; 
    userId: string;  
    rating: number;
    comment: string;
    images: string[];
  };
  error?: {
    message: string;
    statusCode?: number;
    timestamp?: string;
    path?: string;
  };
}

export interface ReviewImage {
  _id: string;
  imageUrl: string;
}

export interface ReviewUser {
  _id: string;
  username: string;
  email: string;
  avatar: string | null;
}

export interface ReviewPlace {
  _id: string;
  name: string;
}

export interface Review {
  _id: string;
  placeId: ReviewPlace;
  userId: ReviewUser;
  rating: number;
  comment: string;
  images: ReviewImage[];
  createdAt: string;
  updatedAt: string;
}

export interface ReviewListResponse {
  code: number;
  success: boolean;
  message: string;
  data: {
    records: Review[];
    total: number;
    lastPage: number;
    page: number;
    size: number;
  };
}


