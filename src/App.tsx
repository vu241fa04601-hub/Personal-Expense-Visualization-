import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Expense, ExpenseCategory } from './types/expense';
import {
  calculateCategorySummaries,
  calculateDailyAverage,
  calculateDailyTotals,
  calculateTotalSpent,
  exportExpensesToCsv,
  filterAndSortExpenses,
  formatCurrency,
  getTopCategory,
  INITIAL_DEMO_EXPENSES,
} from './utils/expenseCalculations';
import { TopBar } from './components/TopBar';
import { SummaryMetricCard } from './components/SummaryMetricCard';
import { CategorySummaryCard } from './components/CategorySummaryCard';
import { SpendingVisualizations } from './components/SpendingVisualizations';
import { ExpenseForm } from './components/ExpenseForm';
import { ExpenseLedger } from './components/ExpenseLedger';
import { MongoStatusCard } from './components/MongoStatusCard';
import { LoginPage } from './components/LoginPage';
import {
  fetchExpenses,
  createExpenseApi,
  deleteExpenseApi,
  resetExpensesApi,
  fetchDbStatus,
} from './utils/api';
import { DatabaseStatus } from './server/db';
import { User } from './types/expense';

const STORAGE_KEY = 'ledgerline_expenses_v1';
const USER_STORAGE_KEY = 'ledgerline_user_v1';

function loadInitialUser(): User | null {
  try {
    const raw = window.localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function loadInitialExpenses(): Expense[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_DEMO_EXPENSES;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_DEMO_EXPENSES;
  } catch {
    return INITIAL_DEMO_EXPENSES;
  }
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(loadInitialUser);
  const [expenses, setExpenses] = useState<Expense[]>(loadInitialExpenses);
  const [categoryFilter, setCategoryFilter] = useState<ExpenseCategory | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<
    'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'
  >('date-desc');
  const [dbStatus, setDbStatus] = useState<DatabaseStatus | null>(null);
  const [dbLoading, setDbLoading] = useState(false);

  const descriptionInputRef = useRef<HTMLInputElement | null>(null);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    try {
      window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } catch {
      // ignore
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      window.localStorage.removeItem(USER_STORAGE_KEY);
    } catch {
      // ignore
    }
  };


  // Sync with MongoDB backend API
  const refreshDbStatus = async () => {
    setDbLoading(true);
    try {
      const status = await fetchDbStatus();
      if (status) {
        setDbStatus(status);
      }
    } finally {
      setDbLoading(false);
    }
  };

  useEffect(() => {
    // Load expenses and DB status from backend
    refreshDbStatus();
    fetchExpenses()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setExpenses(data);
        }
      })
      .catch((err) => {
        console.warn('Backend expenses fetch fallback:', err);
      });
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
    } catch {
      // Ignore storage quota errors
    }
  }, [expenses]);

  const totalSpent = useMemo(() => calculateTotalSpent(expenses), [expenses]);
  const categorySummaries = useMemo(
    () => calculateCategorySummaries(expenses),
    [expenses]
  );
  const dailyPoints = useMemo(() => calculateDailyTotals(expenses, 7), [expenses]);
  const topCategory = useMemo(
    () => getTopCategory(categorySummaries),
    [categorySummaries]
  );
  const dailyAverage = useMemo(() => calculateDailyAverage(expenses), [expenses]);

  const filteredExpenses = useMemo(
    () =>
      filterAndSortExpenses(expenses, {
        categoryFilter,
        searchQuery,
        sortBy,
      }),
    [expenses, categoryFilter, searchQuery, sortBy]
  );

  const handleAddExpense = async (newExpense: Omit<Expense, 'id'>) => {
    // Optimistic / local fallback ID
    const localFallback: Expense = {
      ...newExpense,
      id: `exp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    };

    try {
      const saved = await createExpenseApi(newExpense);
      setExpenses((prev) => [saved, ...prev.filter((e) => e.id !== saved.id)]);
      refreshDbStatus();
    } catch (err) {
      console.warn('Falling back to local state:', err);
      setExpenses((prev) => [localFallback, ...prev]);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    setExpenses((prev) => prev.filter((item) => item.id !== id));
    try {
      await deleteExpenseApi(id);
      refreshDbStatus();
    } catch (err) {
      console.warn('Delete API failed, maintained local update:', err);
    }
  };

  const handleResetDemo = async () => {
    try {
      const resetList = await resetExpensesApi();
      setExpenses(resetList);
      refreshDbStatus();
    } catch {
      setExpenses(INITIAL_DEMO_EXPENSES);
    }
    setCategoryFilter('All');
    setSearchQuery('');
    setSortBy('date-desc');
  };

  const handleExportCsv = () => {
    const csv = exportExpensesToCsv(filteredExpenses);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'personal-expenses.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFocusForm = () => {
    descriptionInputRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
    descriptionInputRef.current?.focus();
  };

  const handleCategoryCardSelect = (category: ExpenseCategory) => {
    setCategoryFilter((prev) => (prev === category ? 'All' : category));
  };

  const activeDaysCount = useMemo(
    () => new Set(expenses.map((e) => e.date)).size,
    [expenses]
  );

  if (!currentUser) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900">
      <TopBar
        currentUser={currentUser}
        onLogout={handleLogout}
        onLogExpenseClick={handleFocusForm}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Page Heading & Database Status */}
        <section id="overview" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 text-balance">
                Personal Expense Visualization Board
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                Track daily spending across food, travel, education, and entertainment
                with live category totals and visual summaries in Indian Rupees (₹ INR).
              </p>
            </div>
            {categoryFilter !== 'All' && (
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <span>
                  Filtered by <strong className="font-semibold text-slate-900">{categoryFilter}</strong>
                </span>
                <span aria-hidden="true">·</span>
                <button
                  type="button"
                  onClick={() => setCategoryFilter('All')}
                  className="font-medium text-blue-600 hover:underline cursor-pointer"
                >
                  Reset filter
                </button>
              </div>
            )}
          </div>

          {/* MongoDB Connection Card */}
          <MongoStatusCard
            status={dbStatus}
            loading={dbLoading}
            onRefresh={refreshDbStatus}
          />


          {/* 4-Column KPI Summary Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryMetricCard
              testId="kpi-total-spent"
              label="Total Spent"
              value={formatCurrency(totalSpent)}
              detail={`${expenses.length} ${expenses.length === 1 ? 'entry' : 'entries'} · ${activeDaysCount} active ${activeDaysCount === 1 ? 'day' : 'days'}`}
            />
            <SummaryMetricCard
              testId="kpi-daily-average"
              label="Daily Average"
              value={formatCurrency(dailyAverage)}
              detail={
                activeDaysCount > 0
                  ? `Across ${activeDaysCount} logged ${activeDaysCount === 1 ? 'day' : 'days'}`
                  : 'No active days yet'
              }
            />
            <SummaryMetricCard
              testId="kpi-top-category"
              label="Highest Category"
              value={topCategory ? topCategory.category : 'None'}
              detail={
                topCategory
                  ? `${formatCurrency(topCategory.total)} · ${topCategory.percentage.toFixed(1)}% of total`
                  : 'Log an expense to compare'
              }
            />
            <SummaryMetricCard
              testId="kpi-filtered-count"
              label="Active View"
              value={`${filteredExpenses.length}`}
              detail={
                categoryFilter === 'All'
                  ? 'All 4 categories included'
                  : `${categoryFilter} category selected`
              }
            />
          </div>
        </section>

        {/* Reusable Category Summary Cards */}
        <section id="categories" aria-labelledby="categories-heading" className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-1.5">
            <h2
              id="categories-heading"
              className="font-display text-base font-semibold text-slate-900"
            >
              Category Totals
            </h2>
            <span className="text-xs text-slate-500">
              Select a category card to filter the ledger
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {categorySummaries.map((summary) => (
              <CategorySummaryCard
                key={summary.category}
                summary={summary}
                isSelected={categoryFilter === summary.category}
                onSelect={handleCategoryCardSelect}
              />
            ))}
          </div>
        </section>

        {/* Visual Summaries: Daily Trend & Category Allocation */}
        <SpendingVisualizations
          dailyPoints={dailyPoints}
          categorySummaries={categorySummaries}
          totalSpent={totalSpent}
          activeCategory={categoryFilter}
          onSelectCategory={setCategoryFilter}
        />

        {/* Daily Expense Entry Form */}
        <ExpenseForm
          onAddExpense={handleAddExpense}
          descriptionInputRef={descriptionInputRef}
        />

        {/* Filterable Expense Ledger */}
        <ExpenseLedger
          expenses={filteredExpenses}
          totalUnfilteredCount={expenses.length}
          categoryFilter={categoryFilter}
          onCategoryFilterChange={setCategoryFilter}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          sortBy={sortBy}
          onSortByChange={setSortBy}
          onDeleteExpense={handleDeleteExpense}
          onExportCsv={handleExportCsv}
          onResetDemo={handleResetDemo}
          onFocusForm={handleFocusForm}
        />
      </main>

      <footer className="border-t border-slate-200 bg-white mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <span>Ledgerline · Personal Expense Visualization Board</span>
          <span>Data saved locally in your browser</span>
        </div>
      </footer>
    </div>
  );
}
