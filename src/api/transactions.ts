import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import apiClient from './client';

export interface Transaction {
  id: number;
  user_id: number;
  title: string;
  amount: string; // decimal in db comes back as string sometimes, but let's keep consistent
  type: 'income' | 'expense' | 'transfer';
  date: string;
  category_id?: number | null;
  description?: string;
  receipt_url?: string;
  subscription_id?: number | null;
}

export interface TransactionStatsParams {
  type?: string;
  fromDate?: string;
  toDate?: string;
  search?: string;
  category_id?: number | string;
  has_receipt?: boolean | string;
  is_recurring?: boolean | string;
  compare?: 'previous';
}

export interface TransactionStatsResult {
  income: number;
  expense: number;
  balance: number;
  highestExpense?: number;
  count?: number;
  incomeCount?: number;
  expenseCount?: number;
  average?: number;
  largest?: {
    id: number;
    title: string;
    amount: number;
    type: 'income' | 'expense';
    category_name: string;
    date: string;
  } | null;
  delta?: {
    balance: number | null;
    income: number | null;
    expense: number | null;
    count: number | null;
    average: number | null;
  } | null;
}

export const useTransactionStats = (params?: TransactionStatsParams) => {
  return useQuery({
    queryKey: ['transactionStats', params],
    queryFn: async (): Promise<TransactionStatsResult> => {
      const response = await apiClient.get('transactions/stats', { params });
      return response.data;
    },
  });
};

export const useDashboardAnalytics = (startDate: string, endDate: string) => {
  return useQuery({
    queryKey: ['dashboardAnalytics', startDate, endDate],
    queryFn: async () => {
      const response = await apiClient.get('reports/dashboard', {
        params: { startDate, endDate }
      });
      return response.data;
    },
    enabled: !!startDate && !!endDate,
  });
};

export interface TransactionsFilterParams {
  type?: string;
  fromDate?: string;
  toDate?: string;
  search?: string;
  has_receipt?: boolean | string;
  is_recurring?: boolean | string;
  category_id?: number | string;
}

export const useTransactionsInfinite = (filters: TransactionsFilterParams | string = 'all') => {
  const normalizedFilters: TransactionsFilterParams =
    typeof filters === 'string' ? { type: filters } : filters;

  return useInfiniteQuery({
    queryKey: ['transactions', normalizedFilters],
    queryFn: async ({ pageParam = 0 }) => {
      const params: any = {
        limit: 20,
        offset: pageParam,
        ...normalizedFilters,
      };
      if (params.type === 'all') delete params.type;
      const response = await apiClient.get('transactions', { params });
      return response.data;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextOffset,
  });
};

export const useTransaction = (id: string | number) => {
  return useQuery({
    queryKey: ['transaction', id],
    queryFn: async () => {
      const response = await apiClient.get(`transactions/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

// Data can be standard or FormData if a receipt is included
export const useAddTransaction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: FormData | any) => {
      let response;
      if (data instanceof FormData) {
        response = await apiClient.post('transactions', data, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        response = await apiClient.post('transactions', data);
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['transactionStats'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptionsInfinite'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptionDetails'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardOverview'] });
    },
  });
};

export const useUpdateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string | number; data: FormData | any }) => {
      let response;
      if (data instanceof FormData) {
        response = await apiClient.put(`transactions/${id}`, data, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        response = await apiClient.put(`transactions/${id}`, data);
      }
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['transaction', String(variables.id)] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['transactionStats'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardOverview'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptionDetails'] });
    },
  });
};

export const useDeleteTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string | number) => {
      const response = await apiClient.delete(`transactions/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['transactionStats'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardOverview'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptionDetails'] });
    },
  });
};
