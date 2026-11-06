import { Expense, ExpenseFormInput } from '../types/expense.js';
import { DatabaseStatus } from '../server/db.js';

export async function fetchDbStatus(): Promise<DatabaseStatus | null> {
  try {
    const res = await fetch('/api/db-status');
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function fetchExpenses(): Promise<Expense[]> {
  const res = await fetch('/api/expenses');
  if (!res.ok) {
    throw new Error(`Failed to load expenses: ${res.statusText}`);
  }
  return await res.json();
}

export async function createExpenseApi(input: {
  description: string;
  amount: number;
  category: string;
  date: string;
  note?: string;
}): Promise<Expense> {
  const res = await fetch('/api/expenses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to save expense');
  }
  return await res.json();
}

export async function deleteExpenseApi(id: string): Promise<void> {
  const res = await fetch(`/api/expenses/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    throw new Error(`Failed to delete expense: ${res.statusText}`);
  }
}

export async function resetExpensesApi(): Promise<Expense[]> {
  const res = await fetch('/api/expenses/reset', {
    method: 'POST',
  });
  if (!res.ok) {
    throw new Error(`Failed to reset expenses: ${res.statusText}`);
  }
  return await res.json();
}

export async function loginApi(
  email: string,
  password: string
): Promise<{ user: { id: string; name: string; email: string }; token: string }> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Invalid email or password');
  }
  return await res.json();
}

export async function registerApi(
  name: string,
  email: string,
  password: string
): Promise<{ user: { id: string; name: string; email: string }; token: string }> {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Registration failed');
  }
  return await res.json();
}

export async function getDemoUserApi(): Promise<{
  user: { id: string; name: string; email: string };
  token: string;
}> {
  const res = await fetch('/api/auth/demo-user');
  if (!res.ok) {
    throw new Error('Failed to load demo user');
  }
  return await res.json();
}

