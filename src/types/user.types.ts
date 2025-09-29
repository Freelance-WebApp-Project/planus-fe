export interface UpdateProfileRequest {
    fullName: string;
    email: string;
    gender: string;
    dob?: any;
    income?: any;
    avatar?: any;
    favorites: string[];
  }
  
  export interface UpdateProfileResponse {
    success: boolean;
    message: string;
    user?: any;
  }