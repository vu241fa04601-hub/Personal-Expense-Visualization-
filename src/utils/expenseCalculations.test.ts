import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateCategorySummaries,
  calculateDailyAverage,
  calculateDailyTotals,
  calculateTotalSpent,
  filterAndSortExpenses,
  formatCurrency,
  getTopCategory,
  validateExpenseInput,
} from './expenseCalculations';
import { Expense } from '../types/expense';

const sampleExpenses: Expense[] = [
  { id: '1', description: 'Lunch', amount: 15.5, category: 'Food', date: '2026-11-04' },
  { id: '2', description: 'Train Ticket', amount: 34.5, category: 'Travel', date: '2026-11-04' },
  { id: '3', description: 'Book', amount: 50.0, category: 'Education', date: '2026-11-05' },
];

test('calculateTotalSpent sums amounts accurately without floating point drift', () => {
  assert.equal(calculateTotalSpent(sampleExpenses), 100);
  assert.equal(calculateTotalSpent([]), 0);
});

test('calculateCategorySummaries returns all 4 categories with accurate totals, counts, and shares', () => {
  const summaries = calculateCategorySummaries(sampleExpenses);
  assert.equal(summaries.length, 4);

  const food = summaries.find((s) => s.category === 'Food');
  const travel = summaries.find((s) => s.category === 'Travel');
  const education = summaries.find((s) => s.category === 'Education');
  const entertainment = summaries.find((s) => s.category === 'Entertainment');

  assert.deepEqual(food, { category: 'Food', total: 15.5, count: 1, percentage: 15.5 });
  assert.deepEqual(travel, { category: 'Travel', total: 34.5, count: 1, percentage: 34.5 });
  assert.deepEqual(education, { category: 'Education', total: 50, count: 1, percentage: 50 });
  assert.deepEqual(entertainment, {
    category: 'Entertainment',
    total: 0,
    count: 0,
    percentage: 0,
  });
});

test('calculateDailyTotals groups and sorts daily spending chronologically', () => {
  const daily = calculateDailyTotals(sampleExpenses, 7);
  assert.equal(daily.length, 2);
  assert.equal(daily[0].date, '2026-11-04');
  assert.equal(daily[0].total, 50);
  assert.equal(daily[0].count, 2);
  assert.equal(daily[1].date, '2026-11-05');
  assert.equal(daily[1].total, 50);
  assert.equal(daily[1].count, 1);
});

test('getTopCategory and calculateDailyAverage compute derived metrics', () => {
  const summaries = calculateCategorySummaries(sampleExpenses);
  const top = getTopCategory(summaries);
  assert.equal(top?.category, 'Education');
  assert.equal(calculateDailyAverage(sampleExpenses), 50);
  assert.equal(getTopCategory(calculateCategorySummaries([])), null);
  assert.equal(calculateDailyAverage([]), 0);
});

test('filterAndSortExpenses filters by category and search query and sorts properly', () => {
  const byCategory = filterAndSortExpenses(sampleExpenses, {
    categoryFilter: 'Travel',
    searchQuery: '',
    sortBy: 'date-desc',
  });
  assert.equal(byCategory.length, 1);
  assert.equal(byCategory[0].id, '2');

  const bySearch = filterAndSortExpenses(sampleExpenses, {
    categoryFilter: 'All',
    searchQuery: 'book',
    sortBy: 'amount-desc',
  });
  assert.equal(bySearch.length, 1);
  assert.equal(bySearch[0].id, '3');
});

test('validateExpenseInput rejects empty description, non-positive amount, and invalid date', () => {
  const invalid = validateExpenseInput({
    description: '   ',
    amount: '-5',
    category: 'Food',
    date: '',
  });
  assert.equal(invalid.valid, false);
  assert.ok(invalid.errors.description);
  assert.ok(invalid.errors.amount);
  assert.ok(invalid.errors.date);

  const valid = validateExpenseInput({
    description: 'Espresso',
    amount: '4.75',
    category: 'Food',
    date: '2026-11-05',
  });
  assert.equal(valid.valid, true);
  assert.equal(valid.parsedAmount, 4.75);
});

test('formatCurrency formats values with Indian Rupee symbol', () => {
  const formatted = formatCurrency(1450);
  assert.ok(formatted.includes('₹'));
  assert.ok(formatted.includes('1,450'));
});

