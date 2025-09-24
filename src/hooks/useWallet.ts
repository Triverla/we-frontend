import { useQuery, useMutation, useQueryClient, UseQueryResult } from "@tanstack/react-query";
import { axiosBase } from "@woothomes/lib";

// Payment Method interfaces
export interface PaymentMethod {
  id: string;
  user_id: string;
  type: 'bank_account' | 'paypal' | 'stripe' | 'mobile_money';
  name: string;
  account_details: {
    account_number?: string;
    bank_name?: string;
    bank_code?: string;
    account_name?: string;
    routing_number?: string;
    email?: string;
    phone_number?: string;
    provider?: string;
  };
  is_default: boolean;
  is_verified: boolean;
  status: 'active' | 'inactive' | 'pending_verification';
  created_at: string;
  updated_at: string;
}

export interface PaymentMethodRequest {
  type: 'bank_account' | 'paypal' | 'stripe' | 'mobile_money';
  name: string;
  account_details: Record<string, unknown>;
  is_default?: boolean;
}

// Wallet interfaces based on common wallet API patterns
export interface WalletBalance {
  id: string;
  user_id: string;
  available_balance: number;
  total_balance: number;
  currency: string;
  status: 'active' | 'suspended' | 'frozen';
  created_at: string;
  updated_at: string;
}

export interface WalletTransaction {
  id: string;
  wallet_id: string;
  type: 'credit' | 'debit';
  amount: number;
  currency: string;
  description: string;
  reference: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  transaction_fee?: number;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface WalletTransactionsResponse {
  transactions: WalletTransaction[];
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    has_more_pages: boolean;
  };
}

export interface WalletWithdrawalRequest {
  amount: number;
  description?: string;
  withdrawal_method: 'bank_transfer' | 'paypal' | 'stripe' | 'mobile_money';
  payment_method_id: string;
  pin: string;
}

export interface WalletWithdrawal {
  id: string;
  wallet_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  withdrawal_method: string;
  account_details: Record<string, unknown>;
  transaction_fee: number;
  net_amount: number;
  processed_at?: string;
  created_at: string;
  updated_at: string;
}

/**
 * 💰 Get user's wallet balance
 */
export function useWalletBalance(): UseQueryResult<WalletBalance> {
  return useQuery({
    queryKey: ["wallet-balance"],
    queryFn: async () => {
      const response = await axiosBase.get<{
        success: boolean;
        message: string;
        data: WalletBalance;
      }>("/wallets/NGN/balance");
      return response.data.data;
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute for real-time balance
    retry: 2,
    retryDelay: 1000,
  });
}

/**
 * 📊 Get wallet transaction history with pagination
 */
export function useWalletTransactions(
  page = 1,
  perPage = 20,
  type?: 'credit' | 'debit',
  status?: 'pending' | 'completed' | 'failed' | 'cancelled'
): UseQueryResult<WalletTransactionsResponse> {
  return useQuery({
    queryKey: ["wallet-transactions", page, perPage, type, status],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: perPage.toString(),
      });

      if (type) params.append("type", type);
      if (status) params.append("status", status);

      const response = await axiosBase.get<{
        success: boolean;
        message: string;
        data: {
          transactions: WalletTransaction[];
          pagination: {
            current_page: number;
            per_page: number;
            total: number;
            last_page: number;
            has_more_pages: boolean;
          };
        };
      }>(`/wallets/NGN/transactions?${params.toString()}`);
      
      return {
        transactions: response.data.data.transactions || [],
        pagination: response.data.data.pagination || {
          current_page: 1,
          per_page: perPage,
          total: 0,
          last_page: 1,
          has_more_pages: false,
        },
      };
    },
    staleTime: 30 * 1000, // 30 seconds
    retry: 2,
    retryDelay: 1000,
  });
}

/**
 * 💸 Request wallet withdrawal
 */
export function useRequestWithdrawal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (withdrawalData: WalletWithdrawalRequest) => {
      const response = await axiosBase.post<{
        success: boolean;
        message: string;
        data: WalletWithdrawal;
      }>("/wallets/NGN/withdraw", withdrawalData);
      return response.data.data;
    },
    onSuccess: () => {
      // Invalidate and refetch wallet balance and transactions
      queryClient.invalidateQueries({ queryKey: ["wallet-balance"] });
      queryClient.invalidateQueries({ queryKey: ["wallet-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["wallet-withdrawals"] });
    },
  });
}

/**
 * 📋 Get withdrawal history
 */
export function useWithdrawalHistory(
  page = 1,
  perPage = 20,
  status?: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
): UseQueryResult<{
  withdrawals: WalletWithdrawal[];
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    has_more_pages: boolean;
  };
}> {
  return useQuery({
    queryKey: ["wallet-withdrawals", page, perPage, status],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: perPage.toString(),
        type: "withdrawal"
      });

      if (status) params.append("status", status);

      const response = await axiosBase.get<{
        success: boolean;
        message: string;
        data: {
          withdrawals: WalletWithdrawal[];
          pagination: {
            current_page: number;
            per_page: number;
            total: number;
            last_page: number;
            has_more_pages: boolean;
          };
        };
      }>(`/wallets/NGN/transactions?${params.toString()}`);
      
      return {
        withdrawals: response.data.data.withdrawals || [],
        pagination: response.data.data.pagination || {
          current_page: 1,
          per_page: perPage,
          total: 0,
          last_page: 1,
          has_more_pages: false,
        },
      };
    },
    staleTime: 30 * 1000, // 30 seconds
    retry: 2,
    retryDelay: 1000,
  });
}

// Wallet Analytics interfaces based on actual API payload
export interface WalletAnalytics {
  period: string;
  total_wallets: number;
  currencies: string[];
  total_balances: {
    [currency: string]: {
      balance: string;
      available_balance: number;
      reserved_balance: string;
      formatted_balance: string;
    };
  };
  period_summary: {
    total_credits: number;
    total_debits: number;
    net_change: number;
    transaction_count: number;
  };
  transaction_breakdown: {
    [currency: string]: {
      credits: number;
      debits: number;
      net_change: number;
      transaction_count: number;
      by_type: unknown[];
    };
  };
}

/**
 * 📈 Get wallet analytics/statistics
 */
export function useWalletAnalytics(
  period: '7d' | '30d' | '90d' | '1y' = '30d'
): UseQueryResult<WalletAnalytics> {
  return useQuery({
    queryKey: ["wallet-analytics", period],
    queryFn: async () => {
      const response = await axiosBase.get<{
        success: boolean;
        message: string;
        data: WalletAnalytics;
      }>(`/wallets/statistics?period=${period}`);
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    retryDelay: 1000,
  });
}

// ============================================================================
// PAYMENT METHODS API HOOKS
// ============================================================================

/**
 * 💳 Get user's payment methods
 */
export function usePaymentMethods(): UseQueryResult<PaymentMethod[]> {
  return useQuery({
    queryKey: ["payment-methods"],
    queryFn: async () => {
      const response = await axiosBase.get<{
        success: boolean;
        message: string;
        data: PaymentMethod[];
      }>("/payment-methods");
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    retryDelay: 1000,
  });
}

/**
 * ➕ Add new payment method
 */
export function useAddPaymentMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (paymentMethodData: PaymentMethodRequest) => {
      const response = await axiosBase.post<{
        success: boolean;
        message: string;
        data: PaymentMethod;
      }>("/payment-methods", paymentMethodData);
      return response.data.data;
    },
    onSuccess: () => {
      // Invalidate and refetch payment methods
      queryClient.invalidateQueries({ queryKey: ["payment-methods"] });
    },
  });
}

/**
 * ✏️ Update payment method
 */
export function useUpdatePaymentMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updateData }: Partial<PaymentMethodRequest> & { id: string }) => {
      const response = await axiosBase.put<{
        success: boolean;
        message: string;
        data: PaymentMethod;
      }>(`/payment-methods/${id}`, updateData);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-methods"] });
    },
  });
}

/**
 * 🗑️ Delete payment method
 */
export function useDeletePaymentMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await axiosBase.delete<{
        success: boolean;
        message: string;
      }>(`/payment-methods/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-methods"] });
    },
  });
}

/**
 * ⭐ Set default payment method
 */
export function useSetDefaultPaymentMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await axiosBase.patch<{
        success: boolean;
        message: string;
        data: PaymentMethod;
      }>(`/payment-methods/${id}/set-default`);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-methods"] });
    },
  });
}

/**
 * 🔐 Verify payment method
 */
export function useVerifyPaymentMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, verificationData }: { id: string; verificationData: Record<string, unknown> }) => {
      const response = await axiosBase.post<{
        success: boolean;
        message: string;
        data: PaymentMethod;
      }>(`/payment-methods/${id}/verify`, verificationData);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-methods"] });
    },
  });
}
