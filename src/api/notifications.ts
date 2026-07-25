import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import apiClient from './client';

export interface InAppNotification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: 'warning' | 'success' | 'alert' | 'info';
  is_read: boolean;
  created_at: string;
}

export const useNotificationsInfinite = () => {
  return useInfiniteQuery({
    queryKey: ['notificationsInfinite'],
    queryFn: async ({ pageParam = 0 }) => {
      const response = await apiClient.get('notifications', {
        params: { limit: 20, offset: pageParam },
      });
      return response.data;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextOffset,
  });
};

export const useUnreadNotificationsCount = () => {
  return useQuery({
    queryKey: ['unreadNotificationsCount'],
    queryFn: async () => {
      const response = await apiClient.get<{ unreadCount: number }>('notifications/unread-count');
      return response.data.unreadCount;
    },
    refetchInterval: 60000, // optionally auto-refresh every 60s
  });
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiClient.put(`notifications/${id}/read`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificationsInfinite'] });
      queryClient.invalidateQueries({ queryKey: ['unreadNotificationsCount'] });
    },
  });
};

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.put('notifications/read-all');
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificationsInfinite'] });
      queryClient.invalidateQueries({ queryKey: ['unreadNotificationsCount'] });
    },
  });
};
