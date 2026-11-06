import React from 'react';
import { Trash2, Download, RotateCcw, Search } from 'lucide-react';
import { Expense, ExpenseCategory } from '../types/expense';
import {
  CATEGORY_METADATA,
  EXPENSE_CATEGORIES,
  formatCurrency,
  formatFullDate,
} from '../utils/expenseCalculations';

interface ExpenseLedgerProps {
  expenses: Expense[];
  totalUnfilteredCount: number;
  categoryFilter: ExpenseCategory | 'All';
  onCategoryFilterChange: (category: ExpenseCategory | 'All') => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  sortBy: 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc';
  onSortByChange: (sort: 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc') => void;
  onDeleteExpense: (id: string) => void;
  onExportCsv: () => void;
  onResetDemo: () => void;
  onFocusForm: () => void;
}

export const ExpenseLedger: React.FC<ExpenseLedgerProps> = ({
  expenses,
  totalUnfilteredCount,
  categoryFilter,
  onCategoryFilterChange,
  searchQuery,
  onSearchQueryChange,
  sortBy,
  onSortByChange,
  onDeleteExpense,
  onExportCsv,
  onResetDemo,
  onFocusForm,
}) => {
  const filterTabs: Array<ExpenseCategory | 'All'> = ['All', ...EXPENSE_CATEGORIES];

  return (
    <section
      id="ledger"
      aria-labelledby="ledger-heading"
      className="bg-white border border-slate-200 rounded-xl overflow-hidden"
    >
      {/* Header & Workspace Toolbar */}
      <div className="p-6 border-b border-slate-200 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2
              id="ledger-heading"
              className="font-display text-base font-semibold text-slate-900"
            >
              Expense Ledger
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
              Showing {expenses.length} of {totalUnfilteredCount}{' '}
              {totalUnfilteredCount === 1 ? 'entry' : 'entries'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onExportCsv}
              disabled={totalUnfilteredCount === 0}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" aria-hidden="true" />
              Export CSV
            </button>
            <button
              type="button"
              onClick={onResetDemo}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              Reset Demo
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div
            role="group"
            aria-label="Filter expenses by category"
            className="inline-flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg"
          >
            {filterTabs.map((tab) => {
              const active = categoryFilter === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => onCategoryFilterChange(tab)}
                  aria-pressed={active}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="relative">
              <Search
                className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => onSearchQueryChange(e.target.value)}
                placeholder="Search description or note..."
                aria-label="Search expenses"
                className="w-full sm:w-56 h-9 pl-8 pr-3 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
              />
            </div>

            <label htmlFor="ledger-sort" className="sr-only">
              Sort expenses
            </label>
            <select
              id="ledger-sort"
              value={sortBy}
              onChange={(e) =>
                onSortByChange(
                  e.target.value as
                    | 'date-desc'
                    | 'date-asc'
                    | 'amount-desc'
                    | 'amount-asc'
                )
              }
              className="h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
            >
              <option value="date-desc">Newest first</option>
              <option value="date-asc">Oldest first</option>
              <option value="amount-desc">Highest amount</option>
              <option value="amount-asc">Lowest amount</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table or Empty State */}
      {totalUnfilteredCount === 0 ? (
        <div className="p-12 text-center space-y-3">
          <p className="font-display text-sm font-semibold text-slate-900">
            No expenses logged yet
          </p>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Add your first daily expense above to see category totals, daily trends, and
            spending breakdowns update automatically.
          </p>
          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={onFocusForm}
              className="px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              Log First Expense
            </button>
            <button
              type="button"
              onClick={onResetDemo}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              Restore Demo Data
            </button>
          </div>
        </div>
      ) : expenses.length === 0 ? (
        <div className="p-12 text-center space-y-3">
          <p className="font-display text-sm font-semibold text-slate-900">
            No matching expenses found
          </p>
          <p className="text-xs text-slate-500">
            Try clearing your search query or switching back to all categories.
          </p>
          <div className="pt-1">
            <button
              type="button"
              onClick={() => {
                onCategoryFilterChange('All');
                onSearchQueryChange('');
              }}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              Clear Filters
            </button>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-medium text-slate-500">
                <th scope="col" className="py-3 pl-6 pr-4">
                  Description
                </th>
                <th scope="col" className="py-3 px-4">
                  Category
                </th>
                <th scope="col" className="py-3 px-4">
                  Date
                </th>
                <th scope="col" className="py-3 px-4 text-right">
                  Amount
                </th>
                <th scope="col" className="py-3 pl-4 pr-6 text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {expenses.map((expense) => {
                const meta = CATEGORY_METADATA[expense.category];
                return (
                  <tr
                    key={expense.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-3.5 pl-6 pr-4">
                      <div className="font-medium text-slate-900">
                        {expense.description}
                      </div>
                      {expense.note && (
                        <div className="text-xs text-slate-500 mt-0.5">
                          {expense.note}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="inline-flex items-center gap-2 text-xs font-medium text-slate-700">
                        <span
                          aria-hidden="true"
                          className="w-2 h-2 rounded-xs shrink-0"
                          style={{ backgroundColor: meta.color }}
                        />
                        <span>{expense.category}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-500 tabular-nums whitespace-nowrap">
                      {formatFullDate(expense.date)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-sm font-semibold text-slate-900 tabular-nums text-right whitespace-nowrap">
                      {formatCurrency(expense.amount)}
                    </td>
                    <td className="py-3.5 pl-4 pr-6 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => onDeleteExpense(expense.id)}
                        aria-label={`Delete "${expense.description}"`}
                        className="inline-flex items-center justify-center w-8 h-8 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                      >
                        <Trash2 className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};
