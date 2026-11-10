import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from './client';

export interface UserProfile {
  id: number;
  firebase_uid?: string;
  phone_number: string | null;
  name: string;
  email: string;
  profile_image_url: string | null;
  global_sms_enabled: boolean;
  global_email_enabled: boolean;
  global_push_enabled: boolean;
  created_at?: string;
}

export const useUser = () => {
  return useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const response = await apiClient.get('users/profile');
      return response.data as UserProfile;
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: any) => {
      // Because we may upload an image, we handle both FormData and JSON
      const isFormData = formData instanceof FormData;
      
      const config = {
        headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
      };

      const response = await apiClient.put('users/profile', formData, config);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
  });
};

export const deleteAccountApi = async (email: string) => {
  const response = await apiClient.delete('users/account', { data: { email } });
  return response.data;
};

export const useDeleteAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (email: string) => deleteAccountApi(email),
    onSuccess: () => {
      queryClient.clear();
    },
  });
};

