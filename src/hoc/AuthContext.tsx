import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/auth.service';
import { User, LoginRequest, RegisterRequest, ApiResponse } from '../types/auth.types';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<ApiResponse<any>>;
  register: (userData: RegisterRequest) => Promise<ApiResponse<any>>;
  logout: () => Promise<void>;
  loginWithGoogle: (googleUser: { email: string; fullName?: string }) => Promise<ApiResponse<any>>;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      setIsLoading(true);
      const isAuth = authService.isAuthenticated();
      const userData = authService.getUser();
      
      setIsAuthenticated(isAuth);
      setUser(userData);
    } catch (error) {
      console.error('Error initializing auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginRequest): Promise<ApiResponse<any>> => {
    try {
      setIsLoading(true);
      const response = await authService.login(credentials);
      
      if (response.success) {
        setIsAuthenticated(true);
        const userData = authService.getUser();
        // Check if this is first login from backend response
        // Handle nested data structure: response.data.data
        const actualData = response.data?.data || response.data;
        if (actualData?.isFirstLogin !== undefined && userData) {
          setUser({
            ...userData,
            isFirstLogin: actualData.isFirstLogin
          });
        } else {
          setUser(userData);
        }
      }
      
      setIsLoading(false);
      return response;
    } catch (error) {
      setIsLoading(false);
      return {
        success: false,
        error: {
          message: 'Login failed',
          args: [error instanceof Error ? error.message : 'Unknown error'],
        },
      };
    }
  };

  const register = async (userData: RegisterRequest): Promise<ApiResponse<any>> => {
    try {
      setIsLoading(true);
      const response = await authService.register(userData);
      
      if (response.success) {
        setUser(authService.getUser());
      }
      
      setIsLoading(false);
      return response;
    } catch (error) {
      setIsLoading(false);
      return {
        success: false,
        error: {
          message: 'Registration failed',
          args: [error instanceof Error ? error.message : 'Unknown error'],
        },
      };
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await authService.logout();
      setIsAuthenticated(false);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (googleUser: { email: string; fullName?: string }): Promise<ApiResponse<any>> => {
    try {
      setIsLoading(true);
      const response = await authService.loginWithGoogle(googleUser);
      
      if (response.success) {
        setIsAuthenticated(true);
        setUser(authService.getUser());
      }
      
      setIsLoading(false);
      return response;
    } catch (error) {
      setIsLoading(false);
      return {
        success: false,
        error: {
          message: 'Google login failed',
          args: [error instanceof Error ? error.message : 'Unknown error'],
        },
      };
    }
  };

  const value = {
    isAuthenticated,
    user,
    isLoading,
    login,
    register,
    logout,
    loginWithGoogle,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};