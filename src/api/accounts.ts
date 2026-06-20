import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import apiClient from './client';

export interface Account {
  id: number;
  user_id: number;
  type: 'bank' | 'card' | 'wallet';
  name: string;
  account_number: string;
  holder_name: string;
  expiry_date: string;
  provider: string;
  external_id: string;
  created_at: string;
  updated_at: string;
}

export interface AddAccountData {
  type: 'bank' | 'card' | 'wallet';
  name: string;
  account_number: string;
  holder_name: string;
  expiry_date?: string;
  provider?: string;
  external_id?: string;
}

export interface UpdateAccountData extends Partial<AddAccountData> {
  id: number;
}

export const useAccounts = () => {
  return useQuery({
    queryKey: ['accounts'],
    queryFn: async (): Promise<Account[]> => {
      const response = await apiClient.get('/api/accounts');
      return Array.isArray(response.data) ? response.data : response.data.data;
    },
  });
};

export const useAccountsInfinite = () => {
  return useInfiniteQuery({
    queryKey: ['accountsInfinite'],
    queryFn: async ({ pageParam = 0 }) => {
      const response = await apiClient.get('/api/accounts', {
        params: { limit: 20, offset: pageParam },
      });
      return response.data;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextOffset,
  });
};

export const useAddAccount = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newAccount: AddAccountData) => {
      const response = await apiClient.post('/api/accounts', newAccount);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
};

export const useUpdateAccount = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (account: UpdateAccountData) => {
      const { id, ...data } = account;
      const response = await apiClient.put(`/api/accounts/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
};

export const useDeleteAccount = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiClient.delete(`/api/accounts/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
};
