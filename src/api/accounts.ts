import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import apiClient from './client';

export interface Account {
  id: number;
  user_id: number;
  type: 'bank' | 'card' | 'wallet' | 'depository' | 'credit' | string;
  subtype?: string;
  name: string;
  account_number: string;
  holder_name: string;
  expiry_date: string;
  provider?: string;
  external_id?: string;
  logo?: string;
  color?: string;
  balance?: number;
  available_balance?: number;
  credit_limit?: number;
  currency?: string;
  last_balance_sync?: string;
  plaid_raw_data?: any;
  created_at?: string;
  updated_at?: string;
  sync_status?: string;
  item_id?: string;
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
      const response = await apiClient.get('accounts');
      return Array.isArray(response.data) ? response.data : response.data.data;
    },
  });
};

export const useAccountDetails = (id: string | number) => {
  return useQuery({
    queryKey: ['account', id],
    queryFn: async (): Promise<Account> => {
      const response = await apiClient.get(`accounts/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
};

export const useAccountsInfinite = () => {
  return useInfiniteQuery({
    queryKey: ['accountsInfinite'],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await apiClient.get('accounts', {
        params: { limit: 20, page: pageParam },
      });
      return response.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (!lastPage.pagination) return undefined;
      const { currentPage, totalPages } = lastPage.pagination;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
  });
};

export const useAddAccount = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newAccount: AddAccountData) => {
      const response = await apiClient.post('accounts', newAccount);
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
      const response = await apiClient.put(`accounts/${id}`, data);
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
      const response = await apiClient.delete(`accounts/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
};

export const useSyncBalance = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiClient.post(`plaid/sync-balance`, { id });
      return { 
        id, 
        balance: response.data.balance, 
        available_balance: response.data.available_balance,
        credit_limit: response.data.credit_limit,
        last_balance_sync: response.data.last_balance_sync,
        updated_at: new Date().toISOString() 
      };
    },
    onSuccess: ({ id, balance, available_balance, credit_limit, last_balance_sync, updated_at }) => {
      // Update 'accounts' query locally
      queryClient.setQueryData(['accounts'], (oldData: any) => {
        if (!oldData) return oldData;
        
        const updateArray = (arr: any[]) => 
          arr.map(acc => acc.id === id ? { ...acc, balance, available_balance, credit_limit, last_balance_sync, updated_at } : acc);

        if (Array.isArray(oldData)) {
          return updateArray(oldData);
        } else if (oldData.data && Array.isArray(oldData.data)) {
          return { ...oldData, data: updateArray(oldData.data) };
        }
        return oldData;
      });

      // Update 'accountsInfinite' query locally
      queryClient.setQueryData(['accountsInfinite'], (oldData: any) => {
        if (!oldData || !oldData.pages) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => ({
            ...page,
            data: page.data.map((acc: any) => acc.id === id ? { ...acc, balance, available_balance, credit_limit, last_balance_sync, updated_at } : acc)
          }))
        };
      });
    },
  });
};

export const useSyncAllTransactions = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.post('plaid/sync-transactions');
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['accountsInfinite'] });
    },
  });
};

export interface AccountTransaction {
  id: number;
  user_id: number;
  account_id: number;
  provider_transaction_id: string;
  amount: number;
  date: string;
  name: string;
  merchant_name?: string;
  logo_url?: string;
  currency: string;
  payment_channel?: string;
  primary_category?: string;
  detailed_category?: string;
  pending: boolean;
  datetime?: string;
  authorized_date?: string;
  authorized_datetime?: string;
  location?: any;
  payment_meta?: any;
  created_at: string;
  updated_at: string;
}

export const useAccountTransactions = (accountId: number) => {
  return useInfiniteQuery({
    queryKey: ['accountTransactions', accountId],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await apiClient.get(`accounts/${accountId}/transactions`, {
        params: { limit: 20, page: pageParam },
      });
      return response.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (!lastPage.pagination) return undefined;
      const { currentPage, totalPages } = lastPage.pagination;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    enabled: !!accountId,
  });
};

export const useAccountTransaction = (txnId: string | number) => {
  return useQuery({
    queryKey: ['accountTransaction', txnId],
    queryFn: async () => {
      const response = await apiClient.get(`accounts/transactions/${txnId}`);
      return response.data.data;
    },
    enabled: !!txnId,
  });
};
