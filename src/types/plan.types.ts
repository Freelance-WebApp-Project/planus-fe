export interface TravelPlan {
  planTitle: string;
  totalDuration: string;
  estimatedCost: number;
  itinerary: ItineraryItem[];
}

export interface SavedPlan {
  _id: string;
  createdBy: string;
  updatedBy: string;
  userId: {
    _id: string;
    username: string;
    email: string;
    avatar: string | null;
  };
  planTitle: string;
  totalDuration: string;
  estimatedCost: number;
  itinerary: SavedItineraryItem[];
  isPaid: boolean;
  isShared: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SavedItineraryItem {
  placeId: {
    _id: string;
    name: string;
    type: string;
    images: Array<{
      _id: string;
      imageUrl: string;
    }>;
    location: {
      coordinates: {
        type: 'Point';
        coordinates: [number, number];
      };
      address: string;
      city: string;
    };
    priceRange: number;
    rating: number;
  };
  order: number;
  distance: string;
  travelTime: string;
}

export interface ItineraryItem {
  _id: string;
  order: number;
  distance: string;
  travelTime: string;
  placeInfo: PlaceInfo;
}

export interface PlaceInfo {
  _id: string;
  name: string;
  type: string;
  description: string;
  location: {
    address: string;
    city: string;
    coordinates: {
      type: 'Point';
      coordinates: [number, number];
    };
  };
  priceRange: number;
  rating: number;
  contact?: {
    phone?: string;
    website?: string;
  };
  tags: string[];
  images: string[];
  distance?: number;
}

export interface GeneratePlanRequest {
  lat: number;
  lng: number;
  city: string;
  purpose: string;
  duration: string;
  radius: number;
  destination?: string;
}

export interface GeneratePlanResponse {
  code: number;
  message: string;
  success: boolean;
  data: {
    plans: TravelPlan[];
  };
  error?: {
    message: string;
    statusCode?: number;
    timestamp?: string;
    path?: string;
  };
}

export interface GetAllPlansResponse {
  code: number;
  message: string;
  success: boolean;
  data: {
    records: SavedPlan[];
    total: number;
    lastPage: number;
    page: number;
    size: number;
  };
  error?: {
    message: string;
    statusCode?: number;
    timestamp?: string;
    path?: string;
  };
}

export interface QueryPlanDto {
  userId?: string;
  isPaid?: boolean;
  isShared?: boolean;
  isFavorite?: boolean;
  minCost?: number;
  maxCost?: number;
  page?: number;
  size?: number;
  search?: string;
}

export interface ItineraryDto {
  placeId: string;
  order: number;
  distance: string;
  travelTime: string;
}

export interface CreatePlanDto {
  planTitle: string;
  totalDuration: string;
  estimatedCost: number;
  itinerary: ItineraryDto[];
  isPaid?: boolean;
  isShared?: boolean;
  isFavorite?: boolean;
}

export interface PlanFilters {
  purpose: string;
  duration: string;
  radius: number;
  destination?: string;
}

export const PLAN_PURPOSES = [
  'Hẹn hò',
  'Thư giãn',
  'Cà phê',
  'Du lịch',
  'Công việc',
  'Gia đình',
  'Bạn bè',
  'Một mình',
  'Học tập',
  'Thể thao',
] as const;

export const PLAN_DURATIONS = [
  'Nửa ngày (4-6 giờ)',
  'Cả ngày (8-10 giờ)',
  '2 ngày 1 đêm',
  '3 ngày 2 đêm',
  '1 tuần',
] as const;

export const PLAN_RADIUS_OPTIONS = [
  { label: 'Gần (5km)', value: 5 },
  { label: 'Trung bình (10km)', value: 10 },
  { label: 'Xa (20km)', value: 20 },
  { label: 'Rất xa (50km)', value: 50 },
] as const;
