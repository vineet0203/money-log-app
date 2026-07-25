import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from './client';

export interface UserProfile {
  id: number;
  firebase_uid: string;
  phone_number: string;
  name: string;
  email: string | null;
  profile_image_url: string | null;
  global_sms_enabled: boolean;
  global_email_enabled: boolean;
  global_push_enabled: boolean;
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
