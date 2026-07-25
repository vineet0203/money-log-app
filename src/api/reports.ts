import { useQuery } from '@tanstack/react-query';
import apiClient from './client';

export interface CategoryBreakdown {
  category_id: number;
  category_name: string;
  category_color: string;
  icon_name: string;
  budget_limit?: number | null;
  total_amount: number;
}

export interface MonthlyReport {
  month: string;
  totalIncome: number;
  totalExpense: number;
  categoryBreakdown: CategoryBreakdown[];
  incomeCategoryBreakdown: CategoryBreakdown[];
}

export const useMonthlyReport = (year?: number, month?: number) => {
  return useQuery({
    queryKey: ['reports', 'monthly', year, month],
    queryFn: async (): Promise<MonthlyReport> => {
      let url = 'reports/monthly';
      if (year && month) {
        url += `?year=${year}&month=${month}`;
      }
      const response = await apiClient.get(url);
      return response.data;
    },
  });
};
