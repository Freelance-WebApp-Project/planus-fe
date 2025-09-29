export interface User {
  _id: string;
  email: string;
  fullName: string;
  role: string;
  phone?: string;
  twofa?: boolean;
  isSetupComplete?: boolean;
  isFirstLogin?: boolean;
  gender?: string;
  dob?: any;
  income?: any;
  avatar?: any;
  favorites?: string[];
  isPremium?: boolean;
}

export interface LoginRequest {
  username: string;
  password: string;
  code?: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  username: string;
}

export interface LoginResponse {
  user: Omit<User, 'password' | 'twofa'>;
  accessToken: string;
  isFirstLogin?: boolean;
  data?: {
    user: Omit<User, 'password' | 'twofa'>;
    accessToken: string;
    isFirstLogin?: boolean;
  };
}

export interface RegisterResponse {
  user: Omit<User, 'password' | 'twofa'>;
  data?: {
    user: Omit<User, 'password' | 'twofa'>;
  };
}

export interface AuthError {
  message: string;
  args?: string[];
  statusCode?: number;
  timestamp?: string;
  path?: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: AuthError;
  success: boolean;
}
