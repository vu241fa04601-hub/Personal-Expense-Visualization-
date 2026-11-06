export type ExpenseCategory = 'Food' | 'Travel' | 'Education' | 'Entertainment';

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: ExpenseCategory;
  date: string; // YYYY-MM-DD
  note?: string;
}

export interface CategoryMeta {
  category: ExpenseCategory;
  label: string;
  color: string;
  trackColor: string;
  textColor: string;
  subtitle: string;
}

export interface CategorySummary {
  category: ExpenseCategory;
  total: number;
  count: number;
  percentage: number;
}

export interface DailySpendPoint {
  date: string; // YYYY-MM-DD
  shortLabel: string; // e.g. "Nov 05"
  total: number;
  count: number;
  byCategory: Record<ExpenseCategory, number>;
}

export interface ExpenseFormInput {
  description: string;
  amount: string;
  category: ExpenseCategory;
  date: string;
  note?: string;
}

export interface ExpenseValidationErrors {
  description?: string;
  amount?: string;
  date?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
  avatarInitials?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

