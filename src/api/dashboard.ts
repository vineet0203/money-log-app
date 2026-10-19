import { useQuery } from '@tanstack/react-query';
import apiClient from './client';

export interface DashboardOverview {
  totalBalance: {
    total: number;
    cash: number;
    creditDebt: number;
  };
  savingsRate: {
    rate: number | null;
    delta: number | null;
  };
  todayIncome: {
    today: number;
    thisWeek: number;
    thisMonth: number;
    prevMonth: number;
    delta: number | null;
  };
  todayExpenses: {
    today: number;
    thisWeek: number;
    thisMonth: number;
    prevMonth: number;
    delta: number | null;
  };
  netProfit: {
    daily: number;
    monthly: number;
    yearly: number;
    delta: number | null;
  };
  commitments?: {
    monthlyCommitted: number;
    committedPercentOfIncome: number | null;
    dueNext7: { count: number; amount: number };
    dueNext30: { count: number; amount: number };
  };
  projection?: {
    averageDailySpend: number;
    projectedMonthEndSpend: number;
    daysElapsed: number;
    daysInMonth: number;
  };
  dataQuality?: {
    uncategorisedCount: number;
    receiptCoverage: number | null;
  };
  charts?: {
    incomeVsExpenses: Array<{
      month: string;
      income: number;
      expenses: number;
    }>;
    spendingByCategory: Array<{
      name: string;
      value: number;
      color: string;
    }>;
  };
  budgetHealth?: {
    totalBudget: number;
    totalSpent: number;
    overLimit: number;
    nearLimit: number;
    totalTracked: number;
  };
  budgets?: Array<{
    category: string;
    spent: number;
    total: number;
    color: string;
  }>;
  recentTransactions?: Array<{
    id: number;
    title: string;
    amount: number;
    type: 'income' | 'expense' | 'transfer';
    date: string;
    category_name?: string;
    category_color?: string;
    category_icon?: string;
    receipt_url?: string;
  }>;
  upcomingSubscriptions?: {
    count: number;
    items: Array<{
      id: number;
      name: string;
      amount: number | string;
      billing_cycle: 'monthly' | 'yearly';
      next_billing_date: string;
      category_name?: string;
      category_color?: string;
      category_icon?: string;
    }>;
  };
}

export const useDashboardOverview = () => {
  return useQuery({
    queryKey: ['dashboardOverview'],
    queryFn: async (): Promise<DashboardOverview> => {
      const response = await apiClient.get('dashboard/overview');
      return response.data;
    },
  });
};
