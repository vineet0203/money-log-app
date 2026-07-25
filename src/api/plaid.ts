import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from './client';

// Plaid Link Token
export const useCreateLinkToken = () => {
  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.post('plaid/create-link-token');
      return response.data;
    },
  });
};

// Exchange Public Token (after Plaid Link success)
export const useExchangePublicToken = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (publicToken: string) => {
      const response = await apiClient.post('plaid/exchange-public-token', {
        public_token: publicToken,
      });
      return response.data;
    },
    onSuccess: () => {
      // Refresh accounts list after linking a new bank
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['accountsInfinite'] });
      queryClient.invalidateQueries({ queryKey: ['plaidItems'] });
    },
  });
};

// Get all linked Plaid items (banks)
export const usePlaidItems = () => {
  return useQuery({
    queryKey: ['plaidItems'],
    queryFn: async () => {
      const response = await apiClient.get('plaid/items');
      return response.data.data;
    },
  });
};

// Remove a linked Plaid item (disconnect bank)
export const useRemovePlaidItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: number) => {
      const response = await apiClient.delete(`plaid/items/${itemId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['accountsInfinite'] });
      queryClient.invalidateQueries({ queryKey: ['plaidItems'] });
    },
  });
};
