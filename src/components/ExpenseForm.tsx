import React, { useState } from 'react';
import { Expense, ExpenseCategory, ExpenseValidationErrors } from '../types/expense';
import {
  EXPENSE_CATEGORIES,
  validateExpenseInput,
} from '../utils/expenseCalculations';

interface ExpenseFormProps {
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
  descriptionInputRef: React.RefObject<HTMLInputElement | null>;
}

const QUICK_PRESETS: Array<{
  label: string;
  description: string;
  amount: string;
  category: ExpenseCategory;
}> = [
  {
    label: 'Chai & Snacks · ₹60',
    description: 'Masala Chai & Samosa',
    amount: '60.00',
    category: 'Food',
  },
  {
    label: 'Metro Transit · ₹40',
    description: 'Metro Smart Card Ride',
    amount: '40.00',
    category: 'Travel',
  },
  {
    label: 'Book · ₹450',
    description: 'Computer Science Study Material',
    amount: '450.00',
    category: 'Education',
  },
];


export const ExpenseForm: React.FC<ExpenseFormProps> = ({
  onAddExpense,
  descriptionInputRef,
}) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Food');
  const [date, setDate] = useState('2026-11-05');
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<ExpenseValidationErrors>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateExpenseInput({
      description,
      amount,
      category,
      date,
      note,
    });

    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    onAddExpense({
      description: description.trim(),
      amount: validation.parsedAmount,
      category,
      date,
      note: note.trim() || undefined,
    });

    setDescription('');
    setAmount('');
    setNote('');
    setErrors({});
  };

  const applyPreset = (preset: (typeof QUICK_PRESETS)[number]) => {
    setDescription(preset.description);
    setAmount(preset.amount);
    setCategory(preset.category);
    setErrors({});
  };

  return (
    <section
      aria-labelledby="add-expense-heading"
      className="bg-white border border-slate-200 rounded-xl p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h2
            id="add-expense-heading"
            className="font-display text-base font-semibold text-slate-900"
          >
            Add Daily Expense
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Record a new entry under Food, Travel, Education, or Entertainment
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400">Quick fill:</span>
          {QUICK_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => applyPreset(preset)}
              className="px-2.5 py-1 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200/80 hover:text-slate-900 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4">
          {/* Description */}
          <div className="lg:col-span-4">
            <label
              htmlFor="expense-description"
              className="block text-xs font-medium text-slate-700 mb-1.5"
            >
              Description
            </label>
            <input
              ref={descriptionInputRef}
              id="expense-description"
              name="description"
              type="text"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (errors.description) {
                  setErrors((prev) => ({ ...prev, description: undefined }));
                }
              }}
              placeholder="e.g., Lunch at Corner Bistro"
              aria-invalid={Boolean(errors.description)}
              aria-describedby={errors.description ? 'description-error' : undefined}
              className={`w-full h-10 px-3 text-sm bg-white border rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 ${
                errors.description ? 'border-red-500' : 'border-slate-300'
              }`}
            />
            {errors.description && (
              <p
                id="description-error"
                role="alert"
                className="mt-1 text-xs text-red-600"
              >
                {errors.description}
              </p>
            )}
          </div>

          {/* Amount */}
          <div className="lg:col-span-2">
            <label
              htmlFor="expense-amount"
              className="block text-xs font-medium text-slate-700 mb-1.5"
            >
              Amount (INR)
            </label>
            <div className="relative">
              <span
                aria-hidden="true"
                className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm text-slate-400"
              >
                ₹
              </span>
              <input
                id="expense-amount"
                name="amount"
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  if (errors.amount) {
                    setErrors((prev) => ({ ...prev, amount: undefined }));
                  }
                }}
                placeholder="0.00"
                aria-invalid={Boolean(errors.amount)}
                aria-describedby={errors.amount ? 'amount-error' : undefined}
                className={`w-full h-10 pl-7 pr-3 font-mono text-sm tabular-nums bg-white border rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 ${
                  errors.amount ? 'border-red-500' : 'border-slate-300'
                }`}
              />
            </div>
            {errors.amount && (
              <p
                id="amount-error"
                role="alert"
                className="mt-1 text-xs text-red-600"
              >
                {errors.amount}
              </p>
            )}
          </div>

          {/* Category */}
          <div className="lg:col-span-2">
            <label
              htmlFor="expense-category"
              className="block text-xs font-medium text-slate-700 mb-1.5"
            >
              Category
            </label>
            <select
              id="expense-category"
              name="category"
              value={category}
              onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
              className="w-full h-10 px-3 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
            >
              {EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div className="lg:col-span-2">
            <label
              htmlFor="expense-date"
              className="block text-xs font-medium text-slate-700 mb-1.5"
            >
              Date
            </label>
            <input
              id="expense-date"
              name="date"
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                if (errors.date) {
                  setErrors((prev) => ({ ...prev, date: undefined }));
                }
              }}
              aria-invalid={Boolean(errors.date)}
              aria-describedby={errors.date ? 'date-error' : undefined}
              className={`w-full h-10 px-3 font-mono text-sm tabular-nums bg-white border rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 ${
                errors.date ? 'border-red-500' : 'border-slate-300'
              }`}
            />
            {errors.date && (
              <p
                id="date-error"
                role="alert"
                className="mt-1 text-xs text-red-600"
              >
                {errors.date}
              </p>
            )}
          </div>

          {/* Submit */}
          <div className="lg:col-span-2 flex items-end">
            <button
              type="submit"
              className="w-full h-10 px-4 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              Add Expense
            </button>
          </div>
        </div>

        {/* Optional Note */}
        <div>
          <label
            htmlFor="expense-note"
            className="block text-xs font-medium text-slate-600 mb-1"
          >
            Note (optional)
          </label>
          <input
            id="expense-note"
            name="note"
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add context such as merchant location or item details"
            className="w-full h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
          />
        </div>
      </form>
    </section>
  );
};
