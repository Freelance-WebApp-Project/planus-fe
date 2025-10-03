export enum PlaceType {
  CAFE = 'cafe',
  NHA_HANG = 'nha_hang',
  HOMESTAY = 'homestay',
  BAO_TANG = 'bao_tang',
  KHU_VUI_CHOI = 'khu_vui_choi',
  CUA_HANG = 'cua_hang',
  BENH_VIEN = 'benh_vien',
  TRUONG_HOC = 'truong_hoc',
  CONG_VIEN = 'cong_vien',
  NHA_THO = 'nha_tho',
  CHUA = 'chua',
  KHACH_SAN = 'khach_san',
  CAN_HO = 'can_ho',
  VILLA = 'villa',
  NHA_NGHI = 'nha_nghi',
  KY_TUC = 'ky_tuc',
  RESORT = 'resort',
  SPA = 'spa',
  GYM = 'gym',
  RAP_CHIEU_PHIM = 'rap_chieu_phim',
  THU_VIEN = 'thu_vien',
  BANH_XE = 'banh_xe',
  BEN_XE = 'ben_xe',
  SAN_BAY = 'san_bay',
}

export interface CategoryItem {
  id: string;
  title: string;
  icon: string;
  type?: PlaceType;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Location {
  address: string;
  city: string;
  coordinates: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
}

export interface PriceRange {
  min: number;
  max: number;
}

export interface Contact {
  phone?: string;
  website?: string;
}

export interface PlaceImage {
  _id: string;
  userId: string;
  imageUrl: string;
  __v: number;
  createdAt: string;
  updatedAt: string;
}

export interface Place {
  _id: string;
  createdBy: string | null;
  updatedBy: string | null;
  name: string;
  type: PlaceType;
  description: string;
  images: PlaceImage[];
  location: Location;
  priceRange: number;
  rating: number;
  contact?: Contact;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface QueryPlaceDto {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  type?: PlaceType;
  city?: string;
  minRating?: number;
  priceRange?: number;
  tags?: string[];
}

export interface PlaceListResponse {
  records: Place[];
  total: number;
  page: number;
  size: number;
  lastPage: number;
}

export interface PlaceResponse {
  success: boolean;
  data?: Place;
  error?: {
    message: string;
    statusCode?: number;
    timestamp?: string;
    path?: string;
  };
}

export interface PlaceListApiResponse {
  success: boolean;
  data?: PlaceListResponse;
  error?: {
    message: string;
    statusCode?: number;
    timestamp?: string;
    path?: string;
  };
}

// Response type for random places API
export interface RandomPlacesApiResponse {
  code: number;
  success: boolean;
  message: string;
  data: Place[];
}

// Navigation parameter types for SearchScreen
export interface SearchScreenParams {
  searchQuery?: string;
  filterType?: PlaceType;
  categoryTitle?: string;
  showAllCategories?: boolean;
  showPopularPlaces?: boolean;
  city?: string;
  minRating?: number;
  tags?: string[];
}
