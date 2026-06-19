import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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

export const useTransactions = () => {
  return useQuery({
    queryKey: ['transactions'],
    queryFn: async (): Promise<Transaction[]> => {
      const response = await apiClient.get('/api/transactions');
      return response.data;
    },
  });
};

// Data can be standard or FormData if a receipt is included
export const useAddTransaction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: FormData | any) => {
      let response;
      if (data instanceof FormData) {
        response = await apiClient.post('/api/transactions', data, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        response = await apiClient.post('/api/transactions', data);
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      // If we paid a subscription, it bumps the cycle, so invalidate that too
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
    },
  });
};
