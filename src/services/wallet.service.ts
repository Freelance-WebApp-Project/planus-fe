import { apiService } from './api.service';
import { API_CONFIG } from '../constants/api.constants';
import {
  WalletBalanceResponse,
  PayDto,
  PayResponse,
  WalletHistoryResponse,
  CheckoutDto,
  CheckoutResponse,
  PayOSSuccessDto,
  PayOSSuccessResponse,
  BuyVipDto,
  BuyVipResponse,
} from '../types/wallet.types';

class WalletService {
  /**
   * Get wallet balance
   * @returns Promise<WalletBalanceResponse>
   */
  async getBalance(): Promise<WalletBalanceResponse> {
    try {
      const response = await apiService.get<any>(API_CONFIG.ENDPOINTS.WALLET.BALANCE);
      
      if (response.success && response.data) {
        // Handle the nested data structure: response.data.data
        const apiData = response.data.data || response.data;
        console.log("🔵 Wallet Service - Get balance response:", apiData); 
        return {
          success: true,
          data: apiData
        };
      }
      
      return response;
    } catch (error) {
      return {
        success: false,
        error: {
          message: 'Failed to fetch wallet balance',
          statusCode: 500,
          timestamp: new Date().toISOString(),
          path: API_CONFIG.ENDPOINTS.WALLET.BALANCE,
        },
      };
    }
  }

  /**
   * Make payment using wallet
   * @param payData - Payment data (amount and description)
   * @returns Promise<PayResponse>
   */
  async pay(payData: PayDto): Promise<PayResponse> {
    try {
      if (!payData.amount || payData.amount <= 0) {
        return {
          success: false,
          error: {
            message: 'Amount must be greater than 0',
            statusCode: 400,
            timestamp: new Date().toISOString(),
            path: API_CONFIG.ENDPOINTS.WALLET.PAY,
          },
        };
      }

      const response = await apiService.post<any>(
        API_CONFIG.ENDPOINTS.WALLET.PAY,
        payData
      );
      
      if (response.success && response.data) {
        return {
          success: true,
          data: response.data
        };
      }
      
      return response;
    } catch (error) {
      return {
        success: false,
        error: {
          message: 'Failed to process payment',
          statusCode: 500,
          timestamp: new Date().toISOString(),
          path: API_CONFIG.ENDPOINTS.WALLET.PAY,
        },
      };
    }
  }

  /**
   * Get wallet transaction history
   * @returns Promise<WalletHistoryResponse>
   */
  async getHistory(): Promise<WalletHistoryResponse> {
    try {
      const response = await apiService.get<any>(API_CONFIG.ENDPOINTS.WALLET.HISTORY);
      
      if (response.success && response.data) {
        // Handle the nested data structure: response.data.data
        const apiData = response.data.data || response.data;
        return {
          success: true,
          data: apiData
        };
      }
      
      return response;
    } catch (error) {
      return {
        success: false,
        error: {
          message: 'Failed to fetch wallet history',
          statusCode: 500,
          timestamp: new Date().toISOString(),
          path: API_CONFIG.ENDPOINTS.WALLET.HISTORY,
        },
      };
    }
  }

  /**
   * Create payment checkout
   * @param checkoutData - Checkout data
   * @returns Promise<CheckoutResponse>
   */
  async createCheckout(checkoutData: CheckoutDto): Promise<CheckoutResponse> {
    try {
      if (!checkoutData.amount || checkoutData.amount <= 0) {
        return {
          success: false,
          error: {
            message: 'Amount must be greater than 0',
            statusCode: 400,
            timestamp: new Date().toISOString(),
            path: API_CONFIG.ENDPOINTS.WALLET.CHECKOUT,
          },
        };
      }

      const response = await apiService.post<any>(
        API_CONFIG.ENDPOINTS.WALLET.CHECKOUT,
        checkoutData
      );
      
      if (response.success && response.data) {
        return response.data;
      }
      
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: {
          message: 'Failed to create checkout',
          statusCode: 500,
          timestamp: new Date().toISOString(),
          path: API_CONFIG.ENDPOINTS.WALLET.CHECKOUT,
        },
      };
    }
  }

  /**
   * Handle PayOS success callback
   * @param successData - PayOS success data
   * @returns Promise<PayOSSuccessResponse>
   */
  async handlePayOSSuccess(successData: PayOSSuccessDto): Promise<PayOSSuccessResponse> {
    try {
      if (!successData.token) {
        return {
          success: false,
          error: {
            message: 'Token is required',
            statusCode: 400,
            timestamp: new Date().toISOString(),
            path: API_CONFIG.ENDPOINTS.WALLET.PAYOS_SUCCESS,
          },
        };
      }

      const response = await apiService.post<any>(
        API_CONFIG.ENDPOINTS.WALLET.PAYOS_SUCCESS,
        successData
      );
      
      if (response.success && response.data) {
        return {
          success: true,
          data: response.data
        };
      }
      
      return response;
    } catch (error) {
      return {
        success: false,
        error: {
          message: 'Failed to handle PayOS success',
          statusCode: 500,
          timestamp: new Date().toISOString(),
          path: API_CONFIG.ENDPOINTS.WALLET.PAYOS_SUCCESS,
        },
      };
    }
  }

  /**
   * Buy VIP using wallet
   * @param vipData - VIP purchase data
   * @returns Promise<BuyVipResponse>
   */
  async buyVip(vipData: BuyVipDto): Promise<BuyVipResponse> {
    try {
      if (!vipData.months || vipData.months <= 0) {
        return {
          success: false,
          error: {
            message: 'Months must be greater than 0',
            statusCode: 400,
            timestamp: new Date().toISOString(),
            path: API_CONFIG.ENDPOINTS.WALLET.BUY_VIP,
          },
        };
      }

      if (!vipData.amount || vipData.amount <= 0) {
        return {
          success: false,
          error: {
            message: 'Amount must be greater than 0',
            statusCode: 400,
            timestamp: new Date().toISOString(),
            path: API_CONFIG.ENDPOINTS.WALLET.BUY_VIP,
          },
        };
      }

      const response = await apiService.post<any>(
        API_CONFIG.ENDPOINTS.WALLET.BUY_VIP,
        vipData
      );
      
      if (response.success && response.data) {
        return {
          success: true,
          data: response.data
        };
      }
      
      return response;
    } catch (error) {
      return {
        success: false,
        error: {
          message: 'Failed to buy VIP',
          statusCode: 500,
          timestamp: new Date().toISOString(),
          path: API_CONFIG.ENDPOINTS.WALLET.BUY_VIP,
        },
      };
    }
  }
}

export const walletService = new WalletService();
