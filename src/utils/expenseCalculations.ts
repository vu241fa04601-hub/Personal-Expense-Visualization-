import {
  CategoryMeta,
  CategorySummary,
  DailySpendPoint,
  Expense,
  ExpenseCategory,
  ExpenseFormInput,
  ExpenseValidationErrors,
} from '../types/expense';

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Food',
  'Travel',
  'Education',
  'Entertainment',
];

export const CATEGORY_METADATA: Record<ExpenseCategory, CategoryMeta> = {
  Food: {
    category: 'Food',
    label: 'Food & Dining',
    color: '#0D9488',
    trackColor: '#CCFBF1',
    textColor: '#0F766E',
    subtitle: 'Groceries, cafes & daily meals',
  },
  Travel: {
    category: 'Travel',
    label: 'Travel & Transit',
    color: '#2563EB',
    trackColor: '#DBEAFE',
    textColor: '#1D4ED8',
    subtitle: 'Commuter passes, fuel & flights',
  },
  Education: {
    category: 'Education',
    label: 'Education & Books',
    color: '#7C3AED',
    trackColor: '#EDE9FE',
    textColor: '#6D28D9',
    subtitle: 'Courses, textbooks & workshops',
  },
  Entertainment: {
    category: 'Entertainment',
    label: 'Entertainment',
    color: '#D97706',
    trackColor: '#FEF3C7',
    textColor: '#B45309',
    subtitle: 'Cinema, concerts & streaming',
  },
};

export const INITIAL_DEMO_EXPENSES: Expense[] = [
  {
    id: 'exp-101',
    description: 'Fresh Grocery & Farm Produce',
    amount: 1450.0,
    category: 'Food',
    date: '2026-11-05',
    note: 'Weekly vegetables, dairy, grains, and spices',
  },
  {
    id: 'exp-102',
    description: 'Metro Rail Monthly Commuter Card',
    amount: 950.0,
    category: 'Travel',
    date: '2026-11-05',
    note: 'Unlimited zone transit pass recharge',
  },
  {
    id: 'exp-103',
    description: 'Data Structures & Algorithms Reference Book',
    amount: 650.0,
    category: 'Education',
    date: '2026-11-04',
    note: 'Paperback edition with exercises',
  },
  {
    id: 'exp-104',
    description: 'PVR Cinema Weekend Movie Ticket',
    amount: 350.0,
    category: 'Entertainment',
    date: '2026-11-04',
    note: 'IMAX evening show ticket',
  },
  {
    id: 'exp-105',
    description: 'Irani Cafe Chai & Bun Maska',
    amount: 120.0,
    category: 'Food',
    date: '2026-11-03',
  },
  {
    id: 'exp-106',
    description: 'Cloud DevOps & Containerization Workshop',
    amount: 2200.0,
    category: 'Education',
    date: '2026-11-02',
    note: 'Weekend cohort certification pass',
  },
  {
    id: 'exp-107',
    description: 'Auto Rickshaw & Metro Connecting Fare',
    amount: 180.0,
    category: 'Travel',
    date: '2026-11-01',
  },
  {
    id: 'exp-108',
    description: 'Symphony & Classical Sitar Concert',
    amount: 500.0,
    category: 'Entertainment',
    date: '2026-10-31',
    note: 'Auditorium seat',
  },
  {
    id: 'exp-109',
    description: 'South Indian Thali Lunch',
    amount: 240.0,
    category: 'Food',
    date: '2026-10-30',
  },
];

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatShortDate(isoDate: string): string {
  const parts = isoDate.split('-');
  if (parts.length !== 3) return isoDate;
  const year = Number(parts[0]);
  const month = Number(parts[1]) - 1;
  const day = Number(parts[2]);
  const dateObj = new Date(year, month, day);
  if (Number.isNaN(dateObj.getTime())) return isoDate;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(dateObj);
}

export function formatFullDate(isoDate: string): string {
  const parts = isoDate.split('-');
  if (parts.length !== 3) return isoDate;
  const year = Number(parts[0]);
  const month = Number(parts[1]) - 1;
  const day = Number(parts[2]);
  const dateObj = new Date(year, month, day);
  if (Number.isNaN(dateObj.getTime())) return isoDate;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(dateObj);
}

export function calculateTotalSpent(expenses: Expense[]): number {
  const raw = expenses.reduce((sum, item) => sum + item.amount, 0);
  return Math.round(raw * 100) / 100;
}

export function calculateCategorySummaries(expenses: Expense[]): CategorySummary[] {
  const grandTotal = calculateTotalSpent(expenses);

  const grouped = expenses.reduce<Record<ExpenseCategory, { total: number; count: number }>>(
    (acc, item) => {
      acc[item.category].total = Math.round((acc[item.category].total + item.amount) * 100) / 100;
      acc[item.category].count += 1;
      return acc;
    },
    {
      Food: { total: 0, count: 0 },
      Travel: { total: 0, count: 0 },
      Education: { total: 0, count: 0 },
      Entertainment: { total: 0, count: 0 },
    }
  );

  return EXPENSE_CATEGORIES.map((category) => {
    const entry = grouped[category];
    const percentage =
      grandTotal > 0 ? Math.round((entry.total / grandTotal) * 1000) / 10 : 0;
    return {
      category,
      total: entry.total,
      count: entry.count,
      percentage,
    };
  });
}

export function calculateDailyTotals(expenses: Expense[], maxDays = 7): DailySpendPoint[] {
  const byDate = expenses.reduce<
    Record<
      string,
      {
        total: number;
        count: number;
        byCategory: Record<ExpenseCategory, number>;
      }
    >
  >((acc, item) => {
    if (!acc[item.date]) {
      acc[item.date] = {
        total: 0,
        count: 0,
        byCategory: {
          Food: 0,
          Travel: 0,
          Education: 0,
          Entertainment: 0,
        },
      };
    }
    acc[item.date].total = Math.round((acc[item.date].total + item.amount) * 100) / 100;
    acc[item.date].count += 1;
    acc[item.date].byCategory[item.category] =
      Math.round((acc[item.date].byCategory[item.category] + item.amount) * 100) / 100;
    return acc;
  }, {});

  return Object.keys(byDate)
    .sort((a, b) => a.localeCompare(b))
    .slice(-maxDays)
    .map((date) => ({
      date,
      shortLabel: formatShortDate(date),
      total: byDate[date].total,
      count: byDate[date].count,
      byCategory: byDate[date].byCategory,
    }));
}

export function getTopCategory(summaries: CategorySummary[]): CategorySummary | null {
  const nonZero = summaries.filter((s) => s.total > 0);
  if (nonZero.length === 0) return null;
  return [...nonZero].sort((a, b) => b.total - a.total)[0];
}

export function calculateDailyAverage(expenses: Expense[]): number {
  if (expenses.length === 0) return 0;
  const uniqueDays = new Set(expenses.map((e) => e.date)).size;
  if (uniqueDays === 0) return 0;
  return Math.round((calculateTotalSpent(expenses) / uniqueDays) * 100) / 100;
}

export function filterAndSortExpenses(
  expenses: Expense[],
  options: {
    categoryFilter: ExpenseCategory | 'All';
    searchQuery: string;
    sortBy: 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc';
  }
): Expense[] {
  const query = options.searchQuery.trim().toLowerCase();

  const filtered = expenses.filter((item) => {
    const matchesCategory =
      options.categoryFilter === 'All' || item.category === options.categoryFilter;
    const matchesQuery =
      query.length === 0 ||
      item.description.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query) ||
      (item.note ? item.note.toLowerCase().includes(query) : false);
    return matchesCategory && matchesQuery;
  });

  return [...filtered].sort((a, b) => {
    switch (options.sortBy) {
      case 'date-asc':
        return a.date.localeCompare(b.date);
      case 'amount-desc':
        return b.amount - a.amount;
      case 'amount-asc':
        return a.amount - b.amount;
      case 'date-desc':
      default:
        return b.date.localeCompare(a.date);
    }
  });
}

export function validateExpenseInput(input: ExpenseFormInput): {
  valid: boolean;
  errors: ExpenseValidationErrors;
  parsedAmount: number;
} {
  const errors: ExpenseValidationErrors = {};
  const trimmedDesc = input.description.trim();

  if (!trimmedDesc) {
    errors.description = 'Enter a description for this expense.';
  } else if (trimmedDesc.length > 80) {
    errors.description = 'Description must be 80 characters or fewer.';
  }

  const parsedAmount = Number(input.amount);
  if (!input.amount.trim() || Number.isNaN(parsedAmount)) {
    errors.amount = 'Enter a valid rupee amount.';
  } else if (parsedAmount <= 0) {
    errors.amount = 'Amount must be greater than ₹0.00.';
  } else if (parsedAmount > 10000000) {
    errors.amount = 'Amount cannot exceed ₹1,00,00,000.00.';
  }

  if (!input.date || !/^\d{4}-\d{2}-\d{2}$/.test(input.date)) {
    errors.date = 'Select a valid date.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    parsedAmount: Math.round(parsedAmount * 100) / 100,
  };
}

export function exportExpensesToCsv(expenses: Expense[]): string {
  const header = ['Date', 'Category', 'Description', 'Amount (INR)', 'Note'];
  const rows = expenses.map((e) => [
    e.date,
    e.category,
    `"${e.description.replace(/"/g, '""')}"`,
    e.amount.toFixed(2),
    `"${(e.note || '').replace(/"/g, '""')}"`,
  ]);
  return [header.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

