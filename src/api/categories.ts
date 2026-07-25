import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from './client';

export interface Category {
  id: string | number;
  name: string;
  iconName: string;
  color: string;
  budgetLimit?: number;
  spentThisMonth?: number; // Calculated by backend
}

interface AddCategoryData {
  name: string;
  icon_name: string;
  color: string;
  budget_limit?: number;
}

interface UpdateCategoryData extends AddCategoryData {
  id: string | number;
}

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async (): Promise<Category[]> => {
      const response = await apiClient.get('categories');
      return response.data.map((cat: any) => ({
        id: cat.id.toString(),
        name: cat.name,
        iconName: cat.icon_name || 'folder',
        color: cat.color || '#94A3B8',
        budgetLimit: cat.budget_limit ? parseFloat(cat.budget_limit) : undefined,
        spentThisMonth: cat.spent_this_month !== undefined && cat.spent_this_month !== null ? parseFloat(cat.spent_this_month) : 0,
      }));
    },
  });
};

export const useAddCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newCategory: AddCategoryData) => {
      const response = await apiClient.post('categories', newCategory);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (category: UpdateCategoryData) => {
      const { id, ...data } = category;
      const response = await apiClient.put(`categories/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string | number) => {
      const response = await apiClient.delete(`categories/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};
