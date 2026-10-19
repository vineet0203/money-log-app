import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from './client';

export interface Liability {
  liability_id: number;
  liability_type: string;
  apr: number | null;
  rate_type: string | null;
  minimum_payment: number | null;
  last_payment_amount: number | null;
  next_payment_date: string | null;
  loan_term: string | null;
  expected_payoff_date: string | null;
  origination_principal: number | null;
  ytd_interest_paid: number | null;
  account_id: number;
  name: string;
  subtype: string;
  balance: number;
  credit_limit: number | null;
  provider: string;
  color: string;
  logo: string;
  aprs?: string | any[];
}

export const useSyncLiabilities = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post('plaid/sync-liabilities');
      return data;
    },
    onSuccess: (data) => {
      console.log('Liabilities synced:', data?.totalSynced);
      queryClient.invalidateQueries({ queryKey: ['liabilities'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
};

export const useGetLiabilityByAccountId = (accountId: string | number | undefined) => {
  return useQuery({
    queryKey: ['liability', accountId],
    queryFn: async () => {
      const { data } = await apiClient.get(`plaid/liabilities/${accountId}`);
      return data?.data as Liability;
    },
    enabled: !!accountId,
    retry: false,
  });
};
