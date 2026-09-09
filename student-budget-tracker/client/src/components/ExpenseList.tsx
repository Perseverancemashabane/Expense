'use client';

import React, { useState } from 'react';
import { Expense, CategorySummary } from '../types';
import { formatZAR, formatDate } from '../lib/formatters';
import { exportExpensesToCSV } from '../lib/csvExport';
import { bubbleSortExpenses } from '../lib/sorting';
import {
  Search,
  Filter,
  ArrowUpDown,
  Edit2,
  Trash2,
  Download,
  Calendar,
  CreditCard,
  FileText,
  Plus,
} from 'lucide-react';

interface ExpenseListProps {
  expenses: Expense[];
  categories: CategorySummary[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  startDate: string;
  endDate: string;
  onDateChange: (start: string, end: string) => void;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSortChange: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (id: number) => void;
  onOpenAddModal: () => void;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({
  expenses,
  categories,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  startDate,
  endDate,
  onDateChange,
  sortBy,
  sortOrder,
  onSortChange,
  onEditExpense,
  onDeleteExpense,
  onOpenAddModal,
}) => {
  const [showFilters, setShowFilters] = useState(false);

  // CSV Export utility with Bubble Sort
  const handleExportCSV = () => {
    exportExpensesToCSV(
      expenses,
      sortBy as 'date' | 'amount' | 'title' | 'id',
      sortOrder,
      `student_expenses_bubblesorted_${new Date().toISOString().slice(0, 10)}.csv`
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header & Controls */}
      <div className="p-5 border-b border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              Logged Expenses & Receipts
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Showing {expenses.length} transaction{expenses.length === 1 ? '' : 's'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Toggle Filters */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                showFilters || selectedCategory !== 'All' || startDate || endDate
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filters {selectedCategory !== 'All' ? `(${selectedCategory})` : ''}</span>
            </button>

            {/* Export CSV with Bubble Sort */}
            <button
              onClick={handleExportCSV}
              disabled={expenses.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 disabled:opacity-50 transition"
              title="Export records to CSV sorted via Bubble Sort algorithm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV (Bubble Sorted)</span>
            </button>

            {/* Add button */}
            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Expense</span>
            </button>
          </div>
        </div>

        {/* Search & Sort Bar */}
        <div className="mt-4 flex flex-col md:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search expenses by title or note (e.g. Taxi, Lunch, Printing)..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
            />
          </div>

          {/* Sort Controller */}
          <div className="flex items-center gap-2 self-stretch sm:self-auto shrink-0">
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-700">
              <ArrowUpDown className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
              <span className="font-medium mr-1.5">Algorithm:</span>
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [sb, so] = e.target.value.split('-');
                  onSortChange(sb, so as 'asc' | 'desc');
                }}
                className="bg-transparent font-bold text-slate-800 outline-none cursor-pointer"
              >
                <option value="date-desc">Bubble Sort: Newest Date</option>
                <option value="date-asc">Bubble Sort: Oldest Date</option>
                <option value="amount-desc">Bubble Sort: Highest Amount</option>
                <option value="amount-asc">Bubble Sort: Lowest Amount</option>
                <option value="title-asc">Bubble Sort: Title (A-Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Collapsible Filter Bar */}
        {showFilters && (
          <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3 animate-in fade-in duration-200">
            {/* Category Filter */}
            <div>
              <label className="block text-2xs font-bold text-slate-600 uppercase mb-1">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => onSelectCategory(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg py-1.5 px-2.5 text-xs font-medium text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="All">All Categories</option>
                {categories.map((c) => (
                  <option key={c.category_id || c.category_name} value={c.category_name}>
                    {c.category_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-2xs font-bold text-slate-600 uppercase mb-1">
                From Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => onDateChange(e.target.value, endDate)}
                className="w-full bg-white border border-slate-200 rounded-lg py-1.5 px-2.5 text-xs font-medium text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-2xs font-bold text-slate-600 uppercase mb-1">
                To Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => onDateChange(startDate, e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg py-1.5 px-2.5 text-xs font-medium text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Expense Records List */}
      {expenses.length === 0 ? (
        <div className="text-center py-12 px-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">No expenses found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            No logged purchases match your selected filters or search query. Try clearing filters or
            log a new expense.
          </p>
          <button
            onClick={onOpenAddModal}
            className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Log an Expense</span>
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200 text-2xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Item & Description</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bubbleSortExpenses(expenses, sortBy as any, sortOrder).map((expense) => (
                <tr
                  key={expense.id}
                  className="hover:bg-slate-50/80 transition-colors group"
                >
                  {/* Title & Notes */}
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{expense.title}</div>
                    {expense.notes && (
                      <p className="text-2xs text-slate-500 mt-0.5 max-w-md line-clamp-1">
                        {expense.notes}
                      </p>
                    )}
                  </td>

                  {/* Category badge */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-2xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                      {expense.category_name}
                    </span>
                  </td>

                  {/* Date */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 text-xs">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formatDate(expense.date)}</span>
                    </div>
                  </td>

                  {/* Payment Method */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 text-xs">
                    <div className="flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                      <span>{expense.payment_method || 'Cash'}</span>
                    </div>
                  </td>

                  {/* Amount */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-right font-extrabold text-slate-900">
                    {formatZAR(expense.amount)}
                  </td>

                  {/* Action Buttons */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-1 opacity-80 group-hover:opacity-100 transition">
                      <button
                        onClick={() => onEditExpense(expense)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition"
                        title="Edit expense"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteExpense(expense.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition"
                        title="Delete expense"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

