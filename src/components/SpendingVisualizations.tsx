import React, { useState } from 'react';
import { CategorySummary, DailySpendPoint, ExpenseCategory } from '../types/expense';
import {
  CATEGORY_METADATA,
  EXPENSE_CATEGORIES,
  formatCurrency,
  formatFullDate,
} from '../utils/expenseCalculations';

interface SpendingVisualizationsProps {
  dailyPoints: DailySpendPoint[];
  categorySummaries: CategorySummary[];
  totalSpent: number;
  activeCategory: ExpenseCategory | 'All';
  onSelectCategory: (category: ExpenseCategory | 'All') => void;
}

export const SpendingVisualizations: React.FC<SpendingVisualizationsProps> = ({
  dailyPoints,
  categorySummaries,
  totalSpent,
  activeCategory,
  onSelectCategory,
}) => {
  const [selectedDayDate, setSelectedDayDate] = useState<string | null>(null);

  const maxDailyTotal = dailyPoints.reduce(
    (max, pt) => (pt.total > max ? pt.total : max),
    0
  );

  const inspectedDay =
    dailyPoints.find((d) => d.date === selectedDayDate) ??
    (dailyPoints.length > 0 ? dailyPoints[dailyPoints.length - 1] : null);

  return (
    <section
      id="visual-summary"
      aria-labelledby="visual-summary-heading"
      className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch"
    >
      {/* Left: Daily Spending Trend */}
      <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between gap-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2
              id="visual-summary-heading"
              className="font-display text-base font-semibold text-slate-900"
            >
              Daily Spending Trend
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Stacked daily totals across recent active days
            </p>
          </div>

          {inspectedDay && (
            <div className="text-right">
              <p className="text-xs text-slate-500">
                {formatFullDate(inspectedDay.date)} ·{' '}
                <span className="tabular-nums">
                  {inspectedDay.count} {inspectedDay.count === 1 ? 'entry' : 'entries'}
                </span>
              </p>
              <p className="font-mono text-base font-semibold text-slate-900 tabular-nums">
                {formatCurrency(inspectedDay.total)}
              </p>
            </div>
          )}
        </div>

        {dailyPoints.length === 0 ? (
          <div className="h-52 flex items-center justify-center border border-dashed border-slate-200 rounded-lg text-sm text-slate-500">
            No daily spending data to chart yet.
          </div>
        ) : (
          <div className="space-y-4">
            <div
              className="h-52 pt-4 pb-1 px-2 flex items-end justify-between gap-2 sm:gap-4 border-b border-slate-200"
              role="list"
              aria-label="Daily spending bars"
            >
              {dailyPoints.map((point) => {
                const heightPercent =
                  maxDailyTotal > 0 ? Math.max(8, (point.total / maxDailyTotal) * 100) : 0;
                const isSelected = inspectedDay?.date === point.date;

                return (
                  <button
                    key={point.date}
                    type="button"
                    onClick={() => setSelectedDayDate(point.date)}
                    onMouseEnter={() => setSelectedDayDate(point.date)}
                    aria-label={`${formatFullDate(point.date)}: ${formatCurrency(point.total)}`}
                    className={`group flex-1 h-full flex flex-col items-center justify-end gap-2 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 rounded ${
                      isSelected ? 'opacity-100' : 'opacity-85 hover:opacity-100'
                    }`}
                  >
                    <span className="font-mono text-[11px] font-medium text-slate-600 tabular-nums">
                      ₹{Math.round(point.total)}
                    </span>

                    <div
                      className={`w-full max-w-[44px] rounded-t-md overflow-hidden flex flex-col-reverse transition-transform duration-150 ${
                        isSelected ? 'shadow-sm ring-1 ring-slate-900/25' : ''
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    >
                      {EXPENSE_CATEGORIES.map((cat) => {
                        const catVal = point.byCategory[cat];
                        if (catVal <= 0 || point.total <= 0) return null;
                        const segPct = (catVal / point.total) * 100;
                        return (
                          <div
                            key={cat}
                            style={{
                              height: `${segPct}%`,
                              backgroundColor: CATEGORY_METADATA[cat].color,
                            }}
                          />
                        );
                      })}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between gap-2 sm:gap-4 px-2">
              {dailyPoints.map((point) => {
                const isSelected = inspectedDay?.date === point.date;
                return (
                  <span
                    key={point.date}
                    className={`flex-1 text-center font-mono text-[11px] tabular-nums truncate ${
                      isSelected ? 'font-semibold text-slate-900' : 'text-slate-500'
                    }`}
                  >
                    {point.shortLabel}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
          {EXPENSE_CATEGORIES.map((cat) => (
            <div key={cat} className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="w-2.5 h-2.5 rounded-xs shrink-0"
                style={{ backgroundColor: CATEGORY_METADATA[cat].color }}
              />
              <span>{cat}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right: Category Allocation Breakdown */}
      <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between gap-6">
        <div>
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-display text-base font-semibold text-slate-900">
              Category Allocation
            </h2>
            {activeCategory !== 'All' && (
              <button
                type="button"
                onClick={() => onSelectCategory('All')}
                className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
              >
                Show all
              </button>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Proportional share of total logged expenses
          </p>
        </div>

        {/* Stacked Horizontal Distribution Bar */}
        <div className="space-y-2">
          <div
            className="h-3.5 w-full rounded-full bg-slate-100 overflow-hidden flex"
            role="img"
            aria-label="Category spending distribution bar"
          >
            {totalSpent > 0 &&
              categorySummaries.map((item) => {
                if (item.percentage <= 0) return null;
                return (
                  <div
                    key={item.category}
                    style={{
                      width: `${item.percentage}%`,
                      backgroundColor: CATEGORY_METADATA[item.category].color,
                    }}
                    className="h-full first:rounded-l-full last:rounded-r-full"
                    title={`${item.category}: ${formatCurrency(item.total)} (${item.percentage}%)`}
                  />
                );
              })}
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>0%</span>
            <span className="font-mono tabular-nums font-medium text-slate-700">
              Total {formatCurrency(totalSpent)}
            </span>
            <span>100%</span>
          </div>
        </div>

        {/* Clean 4-row Breakdown Table */}
        <div className="divide-y divide-slate-100">
          {categorySummaries.map((item) => {
            const meta = CATEGORY_METADATA[item.category];
            const isSelected = activeCategory === item.category;
            return (
              <button
                key={item.category}
                type="button"
                onClick={() =>
                  onSelectCategory(isSelected ? 'All' : item.category)
                }
                className={`w-full py-3 px-2 -mx-2 rounded-lg flex items-center justify-between gap-4 text-left transition-colors cursor-pointer ${
                  isSelected ? 'bg-slate-50' : 'hover:bg-slate-50/70'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    aria-hidden="true"
                    className="w-2.5 h-2.5 rounded-xs shrink-0"
                    style={{ backgroundColor: meta.color }}
                  />
                  <span className="text-sm font-medium text-slate-900 truncate">
                    {item.category}
                  </span>
                  <span className="text-xs text-slate-400 tabular-nums">
                    ({item.count})
                  </span>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <span className="font-mono text-xs text-slate-500 tabular-nums w-12 text-right">
                    {item.percentage.toFixed(1)}%
                  </span>
                  <span className="font-mono text-sm font-semibold text-slate-900 tabular-nums w-20 text-right">
                    {formatCurrency(item.total)}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
