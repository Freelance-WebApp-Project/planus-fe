export interface WalletBalance {
  balance: number;
  totalSpent: number;
  point: number;
}

export interface WalletBalanceResponse {
  success: boolean;
  data?: WalletBalance;
  error?: {
    message: string;
    statusCode?: number;
    timestamp?: string;
    path?: string;
  };
}

export interface PayDto {
  amount: number;
  description?: string;
}

export interface PayResponse {
  success: boolean;
  data?: {
    transactionId: string;
    remainingBalance: number;
    message: string;
  };
  error?: {
    message: string;
    statusCode?: number;
    timestamp?: string;
    path?: string;
  };
}

export interface WalletTransaction {
  _id: string;
  createdBy: string | null;
  updatedBy: string | null;
  deletedAt?: string | null;
  userId: string;
  walletId: string;
  amount: number;
  type: 'deposit' | 'withdraw' | 'payment' | 'vip_purchase' | 'bonus';
  description?: string;
  source?: 'balance' | 'point' | string;
  createdAt: string;
  updatedAt: string;
}

export interface WalletHistoryResponse {
  success: boolean;
  data?: {
    data: WalletTransaction[];
    total: number;
  };
  error?: {
    message: string;
    statusCode?: number;
    timestamp?: string;
    path?: string;
  };
}

export interface CheckoutDto {
  amount: number;
  description?: string;
  returnUrl?: string;
  cancelUrl?: string;
}

export interface CheckoutResponse {
  success: boolean;
  data?: {
    paymentLink: string;
    amount: number;
    qrCode: string;
  };
  error?: {
    message: string;
    statusCode?: number;
    timestamp?: string;
    path?: string;
  };
}

export interface PayOSSuccessDto {
  token: string;
}

export interface PayOSSuccessResponse {
  success: boolean;
  data?: {
    transactionId: string;
    amount: number;
    status: string;
  };
  error?: {
    message: string;
    statusCode?: number;
    timestamp?: string;
    path?: string;
  };
}

export interface BuyVipDto {
  months: number;
  amount: number;
}

export interface BuyVipResponse {
  success: boolean;
  data?: {
    vipExpiry: string;
    transactionId: string;
    remainingBalance: number;
  };
  error?: {
    message: string;
    statusCode?: number;
    timestamp?: string;
    path?: string;
  };
}
