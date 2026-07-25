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

export const useTransactionStats = () => {
  return useQuery({
    queryKey: ['transactionStats'],
    queryFn: async () => {
      const response = await apiClient.get('transactions/stats');
      return response.data as { income: number; expense: number; balance: number };
    },
  });
};

export const useTransactionsInfinite = (type: string = 'all') => {
  return useInfiniteQuery({
    queryKey: ['transactions', type],
    queryFn: async ({ pageParam = 0 }) => {
      const response = await apiClient.get('transactions', {
        params: { limit: 20, offset: pageParam, type },
      });
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
    },
  });
};
