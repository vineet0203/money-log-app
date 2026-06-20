import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from './client';

export interface Subscription {
  id: number;
  user_id: number;
  category_id?: number;
  category_name?: string;
  category_icon?: string;
  category_color?: string;
  name: string;
  amount: number;
  billing_cycle: 'monthly' | 'yearly';
  next_billing_date: string;
  status: 'active' | 'cancelled';
  source: string;
  is_reminder_on: boolean | number;
  reminder_days: number;
  is_sms_enabled: boolean | number;
  is_email_enabled: boolean | number;
  created_at: string;
  updated_at: string;
}

interface AddSubscriptionData {
  name: string;
  amount: number;
  billing_cycle: 'monthly' | 'yearly';
  start_date: string;
  status: 'active' | 'cancelled';
  source?: string;
  category_id?: number | null;
  is_reminder_on?: boolean | number;
  is_sms_enabled?: boolean | number;
  is_email_enabled?: boolean | number;
}

interface UpdateSubscriptionData extends Partial<AddSubscriptionData> {
  id: number;
  is_reminder_on?: boolean | number;
  reminder_days?: number;
  is_sms_enabled?: boolean | number;
  is_email_enabled?: boolean | number;
}

// Delete old CreateSubscriptionInput

export const useSubscriptions = (optionsOrLimit?: number | { limit?: number, offset?: number, upcomingDays?: number }, offsetParam: number = 0) => {
  let limit = 50;
  let offset = offsetParam;
  let upcomingDays: number | undefined = undefined;

  if (typeof optionsOrLimit === 'object' && optionsOrLimit !== null) {
    limit = optionsOrLimit.limit ?? 50;
    offset = optionsOrLimit.offset ?? 0;
    upcomingDays = optionsOrLimit.upcomingDays;
  } else if (typeof optionsOrLimit === 'number') {
    limit = optionsOrLimit;
  }

  return useQuery({
    queryKey: ['subscriptions', limit, offset, upcomingDays],
    queryFn: async (): Promise<Subscription[]> => {
      const response = await apiClient.get('/api/subscriptions', {
        params: { limit, offset, upcoming_days: upcomingDays }
      });
      return response.data;
    },
  });
};

export const useSubscriptionDetails = (id: string | number) => {
  return useQuery({
    queryKey: ['subscriptionDetails', id],
    queryFn: async () => {
      const response = await apiClient.get(`/api/subscriptions/${id}/details`);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useAddSubscription = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newSubscription: AddSubscriptionData) => {
      const response = await apiClient.post('/api/subscriptions', newSubscription);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
    },
  });
};

export const useUpdateSubscription = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (subscription: UpdateSubscriptionData) => {
      const { id, ...data } = subscription;
      const response = await apiClient.put(`/api/subscriptions/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
    },
  });
};

export const usePaySubscription = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number | string) => {
      const response = await apiClient.post(`/api/subscriptions/${id}/pay`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      // Invalidate categories and transactions since paying a sub affects them too
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
};

export const useDeleteSubscription = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiClient.delete(`/api/subscriptions/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
    },
  });
};
