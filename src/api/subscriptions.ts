import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
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
  auto_post?: boolean | number;
  type?: 'expense' | 'income';
  start_date?: string;
  last_paid_date?: string;
  created_at: string;
  updated_at: string;
}

export type RecurrenceFrequency =
  | 'daily'
  | 'weekly'
  | 'biweekly'
  | 'monthly'
  | 'quarterly'
  | 'half_yearly'
  | 'yearly'
  | 'custom';

export type RecurrenceEndMode = 'never' | 'on_date' | 'after_n';

export interface AddSubscriptionData {
  name: string;
  amount: number;
  type?: 'expense' | 'income';
  billing_cycle?: 'monthly' | 'yearly';
  frequency?: RecurrenceFrequency;
  interval_count?: number;
  by_month_day?: number | null;
  by_weekday?: number | null;
  end_mode?: RecurrenceEndMode;
  end_date?: string | null;
  occurrences_total?: number | null;
  auto_post?: boolean | number;
  start_date: string;
  status?: 'active' | 'cancelled';
  source?: string;
  category_id?: number | null;
  is_reminder_on?: boolean | number;
  reminder_days?: number;
  is_sms_enabled?: boolean | number;
  is_email_enabled?: boolean | number;
}

export interface UpdateSubscriptionData extends Partial<AddSubscriptionData> {
  id: number;
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
      const response = await apiClient.get('subscriptions', {
        params: { limit, offset, upcoming_days: upcomingDays }
      });
      // Handle the case where backend returns { data, nextOffset } instead of an array
      return Array.isArray(response.data) ? response.data : response.data.data;
    },
  });
};

export const useSubscriptionsInfinite = (options?: { upcomingDays?: number }) => {
  return useInfiniteQuery({
    queryKey: ['subscriptionsInfinite', options?.upcomingDays],
    queryFn: async ({ pageParam = 0 }) => {
      const response = await apiClient.get('subscriptions', {
        params: { limit: 20, offset: pageParam, upcoming_days: options?.upcomingDays },
      });
      return response.data; // { data: Subscription[], nextOffset: number | null }
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextOffset,
  });
};

export interface SubscriptionStats {
  total_count: number;
  total_monthly_count: number;
  total_yearly_count: number;
  overdue_count: number;
  within_7_days_count: number;
  within_8_30_days_count: number;
  yearly_30_45_days_count: number;
  ongoing_count: number;
  upcoming_count: number;
  inactive_count: number;
}

export const useSubscriptionStats = () => {
  return useQuery({
    queryKey: ['subscriptionStats'],
    queryFn: async (): Promise<SubscriptionStats> => {
      const response = await apiClient.get('subscriptions/stats');
      return response.data;
    },
  });
};

export const useSubscriptionDetails = (id: string | number) => {
  return useQuery({
    queryKey: ['subscriptionDetails', id],
    queryFn: async () => {
      const response = await apiClient.get(`subscriptions/${id}/details`);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useAddSubscription = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newSubscription: AddSubscriptionData) => {
      const response = await apiClient.post('subscriptions', newSubscription);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptionsInfinite'] });
    },
  });
};

export const useUpdateSubscription = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (subscription: UpdateSubscriptionData) => {
      const { id, ...data } = subscription;
      const response = await apiClient.put(`subscriptions/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptionsInfinite'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptionDetails'] });
    },
  });
};

export const useGetRecurrencePreview = (
  params: {
    start_date?: string;
    frequency?: string;
    interval_count?: number;
    by_month_day?: number;
    by_weekday?: number;
    end_mode?: string;
    end_date?: string;
    occurrences_total?: number;
    count?: number;
  },
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ['recurrencePreview', params],
    queryFn: async () => {
      const response = await apiClient.get<{ dates: string[] }>('subscriptions/preview', { params });
      return response.data?.dates || [];
    },
    enabled: enabled && !!params.start_date,
    staleTime: 60 * 1000,
  });
};

export const usePaySubscription = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number | string) => {
      const response = await apiClient.post(`subscriptions/${id}/pay`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptionsInfinite'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptionDetails'] });
      // Invalidate categories and transactions since paying a sub affects them too
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['transactionStats'] });
    },
  });
};

export const useDeleteSubscription = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiClient.delete(`subscriptions/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptionsInfinite'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptionDetails'] });
    },
  });
};

export interface RecurringOccurrence {
  id: number;
  user_id: number;
  recurring_id: number;
  due_date: string;
  amount: string | number;
  status: 'due' | 'paid' | 'skipped' | 'missed' | 'cancelled';
  transaction_id: number | null;
  paid_at: string | null;
  skipped_at?: string | null;
  created_at: string;
  updated_at: string;
  transaction_title?: string;
  transaction_description?: string | null;
  transaction_date?: string | null;
  transaction_receipt_url?: string | null;
}

export interface GetOccurrencesResponse {
  data: RecurringOccurrence[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export const useGetOccurrences = (
  subscriptionId: string | number,
  params?: {
    status?: string;
    from?: string;
    to?: string;
    sort?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }
) => {
  return useQuery({
    queryKey: ['occurrences', String(subscriptionId), params],
    queryFn: async () => {
      const response = await apiClient.get<GetOccurrencesResponse>(`subscriptions/${subscriptionId}/occurrences`, {
        params,
      });
      return response.data;
    },
    enabled: !!subscriptionId,
  });
};

export const usePayOccurrence = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      subscriptionId,
      occurrenceId,
      amount,
      date,
      category_id,
      notes,
    }: {
      subscriptionId: string | number;
      occurrenceId: number;
      amount?: number;
      date?: string;
      category_id?: number | null;
      notes?: string;
    }) => {
      const response = await apiClient.post(`subscriptions/${subscriptionId}/occurrences/${occurrenceId}/pay`, {
        amount,
        date,
        category_id,
        notes,
      });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptionsInfinite'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptionDetails'] });
      queryClient.invalidateQueries({ queryKey: ['occurrences', String(variables.subscriptionId)] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['transactionStats'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const useSkipOccurrence = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      subscriptionId,
      occurrenceId,
      reason,
    }: {
      subscriptionId: string | number;
      occurrenceId: number;
      reason?: string;
    }) => {
      const response = await apiClient.post(`subscriptions/${subscriptionId}/occurrences/${occurrenceId}/skip`, {
        reason,
      });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptionsInfinite'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptionDetails'] });
      queryClient.invalidateQueries({ queryKey: ['occurrences', String(variables.subscriptionId)] });
    },
  });
};

export const useUnskipOccurrence = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      subscriptionId,
      occurrenceId,
    }: {
      subscriptionId: string | number;
      occurrenceId: number;
    }) => {
      const response = await apiClient.post(`subscriptions/${subscriptionId}/occurrences/${occurrenceId}/unskip`);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptionsInfinite'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptionDetails'] });
      queryClient.invalidateQueries({ queryKey: ['occurrences', String(variables.subscriptionId)] });
    },
  });
};

export const useUndoSubscriptionPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string | number) => {
      const response = await apiClient.post(`subscriptions/${id}/undo-payment`);
      return response.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptionsInfinite'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptionDetails'] });
      queryClient.invalidateQueries({ queryKey: ['occurrences', String(id)] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['transactionStats'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

