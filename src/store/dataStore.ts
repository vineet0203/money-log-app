import { create } from 'zustand';

interface DataState {
  transactions: any[];
  subscriptions: any[];
  bills: any[];
  cashAccounts: any[];
  creditAccounts: any[];
  budgets: any[];
  
  // Actions to set data (for future API integration)
  setTransactions: (data: any[]) => void;
  setSubscriptions: (data: any[]) => void;
  setBills: (data: any[]) => void;
  setCashAccounts: (data: any[]) => void;
  setCreditAccounts: (data: any[]) => void;
  setBudgets: (data: any[]) => void;
  
  // Global clear function
  clearAllData: () => void;
}

export const useDataStore = create<DataState>((set) => ({
  // Initialize with dummy data for testing
  transactions: [
    { id: 1, name: 'Whole Foods Market', category: 'Groceries', date: 'Today, 10:45 AM', amount: '-$84.50', icon: 'cart', bg: 'bg-orange-50', color: '#F97316' },
    { id: 2, name: 'Starbucks', category: 'Food & Dining', date: 'Yesterday, 8:30 AM', amount: '-$5.40', icon: 'cafe', bg: 'bg-amber-50', color: '#F59E0B' },
    { id: 3, name: 'Salary Transfer', category: 'Income', date: 'Oct 1, 9:00 AM', amount: '+$3,240.00', icon: 'cash', bg: 'bg-emerald-50', color: '#10B981', isPositive: true },
  ],
  subscriptions: [
    { id: 1, name: 'Netflix Premium', nextBilling: 'Oct 15', amount: '$19.99', icon: 'tv', bg: 'bg-red-50', color: '#EF4444' },
    { id: 2, name: 'Amazon Prime', nextBilling: 'Oct 18', amount: '$14.99', icon: 'logo-amazon', bg: 'bg-blue-50', color: '#3B82F6' },
  ],
  bills: [
    { id: 1, name: 'Electricity Bill', due: 'Due in 2 days', amount: '$120.00', icon: 'flash', bg: 'bg-orange-50', color: '#F97316', status: 'Pending' },
    { id: 2, name: 'Internet Bill', due: 'Due in 5 days', amount: '$60.00', icon: 'wifi', bg: 'bg-blue-50', color: '#3B82F6', status: 'Pending' },
  ],
  cashAccounts: [
    { id: '1', name: 'Checking', bank: 'Chase Bank', amount: '$7,850.25', icon: 'business', color: 'bg-[#1D4ED8]', bg: 'bg-blue-50' },
  ],
  creditAccounts: [
    { id: '3', name: 'Credit Card', bank: 'Chase Bank', amount: '-$2,250.40', icon: 'card', color: 'bg-[#EF4444]', bg: 'bg-red-50', isNegative: true },
  ],
  budgets: [
    { id: 1, category: 'Housing & Rent', spent: 1500, limit: 1500, icon: 'home', bg: 'bg-indigo-50', color: '#6366F1' },
    { id: 2, category: 'Food & Dining', spent: 420, limit: 500, icon: 'restaurant', bg: 'bg-orange-50', color: '#F97316' },
    { id: 3, category: 'Transportation', spent: 180, limit: 200, icon: 'car', bg: 'bg-blue-50', color: '#3B82F6' },
  ],

  // Setters
  setTransactions: (data) => set({ transactions: data }),
  setSubscriptions: (data) => set({ subscriptions: data }),
  setBills: (data) => set({ bills: data }),
  setCashAccounts: (data) => set({ cashAccounts: data }),
  setCreditAccounts: (data) => set({ creditAccounts: data }),
  setBudgets: (data) => set({ budgets: data }),

  // Clear everything (e.g. on logout)
  clearAllData: () => set({
    transactions: [],
    subscriptions: [],
    bills: [],
    cashAccounts: [],
    creditAccounts: [],
    budgets: [],
  }),
}));
