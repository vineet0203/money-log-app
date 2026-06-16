export type TransactionType = 'income' | 'expense' | 'transfer';

export interface Transaction {
  id: string;
  title: string;
  subtitle: string;
  amount: number;
  type: TransactionType;
  date: string; // ISO string or simple YYYY-MM-DD
  iconName: any; // Ionicons name
  iconBgColor: string; // Tailwind color string for bg
}

export interface Subscription {
  id: string;
  name: string;
  price: number;
  billingCycle: 'monthly' | 'yearly';
  iconName: any; // Ionicons name
  iconBgColor: string; // Tailwind color string
  nextBillingDate: string; // e.g., 'Oct 24'
}

export interface Account {
  id: string;
  name: string;
  last4: string;
  balance: number;
  logoName: any; // Ionicons name
  logoBgColor: string;
}

export interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: string; // e.g., 'Oct 15'
  status: 'upcoming' | 'paid';
  iconName: any; // Ionicons name
  iconBgColor: string;
}

export interface Category {
  id: string;
  name: string;
  iconName: any; // Ionicons name
  color: string; // hex color or tailwind color
  budgetLimit?: number; // Optional max budget limit
}

