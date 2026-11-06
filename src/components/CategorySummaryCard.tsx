import React from 'react';
import { CategorySummary, ExpenseCategory } from '../types/expense';
import { CATEGORY_METADATA, formatCurrency } from '../utils/expenseCalculations';

interface CategorySummaryCardProps {
  summary: CategorySummary;
  isSelected: boolean;
  onSelect: (category: ExpenseCategory) => void;
}

export const CategorySummaryCard: React.FC<CategorySummaryCardProps> = ({
  summary,
  isSelected,
  onSelect,
}) => {
  const meta = CATEGORY_METADATA[summary.category];
  const entryLabel = summary.count === 1 ? '1 entry' : `${summary.count} entries`;

  return (
    <button
      type="button"
      onClick={() => onSelect(summary.category)}
      aria-pressed={isSelected}
      data-testid={`category-card-${summary.category.toLowerCase()}`}
      className={`text-left bg-white rounded-xl p-5 transition-colors cursor-pointer flex flex-col justify-between gap-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
        isSelected
          ? 'border-2 border-slate-900 bg-slate-50/60'
          : 'border border-slate-200 hover:border-slate-300'
      }`}
    >
      <div className="flex items-center justify-between gap-2 w-full">
        <div className="flex items-center gap-2.5 min-w-0">
          <span
            aria-hidden="true"
            className="w-2.5 h-2.5 rounded-xs shrink-0"
            style={{ backgroundColor: meta.color }}
          />
          <span className="font-display text-sm font-semibold text-slate-900 truncate">
            {summary.category}
          </span>
        </div>
        <span className="font-mono text-xs font-medium text-slate-500 tabular-nums shrink-0">
          {summary.percentage.toFixed(1)}%
        </span>
      </div>

      <div className="space-y-2.5 w-full">
        <p className="font-mono text-2xl font-semibold tracking-tight text-slate-900 tabular-nums">
          {formatCurrency(summary.total)}
        </p>

        <div
          className="h-2 w-full rounded-full overflow-hidden"
          style={{ backgroundColor: meta.trackColor }}
          aria-hidden="true"
        >
          <div
            className="h-full rounded-full transition-transform duration-200 origin-left"
            style={{
              width: `${Math.min(100, Math.max(0, summary.percentage))}%`,
              backgroundColor: meta.color,
            }}
          />
        </div>
      </div>

      <div className="flex items-center gap-1.5 text-xs text-slate-500 truncate w-full">
        <span className="tabular-nums">{entryLabel}</span>
        <span aria-hidden="true">·</span>
        <span className="truncate">{meta.subtitle}</span>
      </div>
    </button>
  );
};
