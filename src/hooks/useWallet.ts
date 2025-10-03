import { useState, useEffect, useCallback } from 'react';
import { walletService } from '../services/wallet.service';
import {
  WalletBalance,
  WalletTransaction,
  PayDto,
  CheckoutDto,
  BuyVipDto,
} from '../types/wallet.types';

export const useWallet = () => {
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [lastPage, setLastPage] = useState(1);

  // Fetch wallet balance
  const fetchBalance = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await walletService.getBalance();

      if (response.success && response.data) {
        setBalance(response.data);
      } else {
        setError(response.error?.message || 'Failed to fetch balance');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch transaction history
  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await walletService.getHistory();

      if (response.success && response.data) {
        setTransactions(response.data.data);
        setTotal(response.data.total);
        setPage(1);
        setSize(response.data.data.length);
        setLastPage(1);
      } else {
        setError(response.error?.message || 'Failed to fetch history');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  // Make payment
  const makePayment = useCallback(async (payData: PayDto) => {
    setLoading(true);
    setError(null);

    try {
      const response = await walletService.pay(payData);

      if (response.success && response.data) {
        // Refresh balance after successful payment
        await fetchBalance();
        await fetchHistory();
        return response.data;
      } else {
        setError(response.error?.message || 'Payment failed');
        return null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchBalance, fetchHistory]);

  // Create checkout
  const createCheckout = useCallback(async (checkoutData: CheckoutDto) => {
    setLoading(true);
    setError(null);

    try {
      const response = await walletService.createCheckout(checkoutData);

      if (response.success && response.data) {
        return response.data;
        
      } else {
        setError(response.error?.message || 'Failed to create checkout');
        return null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Buy VIP
  const buyVip = useCallback(async (vipData: BuyVipDto) => {
    setLoading(true);
    setError(null);

    try {
      const response = await walletService.buyVip(vipData);

      if (response.success && response.data) {
        // Refresh balance after successful VIP purchase
        await fetchBalance();
        await fetchHistory();
        return response.data;
      } else {
        setError(response.error?.message || 'Failed to buy VIP');
        return null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchBalance, fetchHistory]);

  // Refresh all data
  const refresh = useCallback(async () => {
    await Promise.all([fetchBalance(), fetchHistory()]);
  }, [fetchBalance, fetchHistory]);

  // Load initial data
  useEffect(() => {
    refresh();
  }, []);

  return {
    // Data
    balance,
    transactions,
    total,
    page,
    size,
    lastPage,
    
    // States
    loading,
    error,
    
    // Actions
    fetchBalance,
    fetchHistory,
    makePayment,
    createCheckout,
    buyVip,
    refresh,
  };
};

export const useWalletBalance = () => {
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await walletService.getBalance();

      if (response.success && response.data) {
        setBalance(response.data);
      } else {
        setError(response.error?.message || 'Failed to fetch balance');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  return {
    balance,
    loading,
    error,
    fetchBalance,
  };
};
