'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from '../components/Navbar';
import { BudgetSummaryCards } from '../components/BudgetSummaryCards';
import { CategoryBreakdown } from '../components/CategoryBreakdown';
import { SpendingCharts } from '../components/SpendingCharts';
import { ExpenseList } from '../components/ExpenseList';
import { ExpenseModal } from '../components/ExpenseModal';
import { SetBudgetModal } from '../components/SetBudgetModal';
import {
  fetchBudgetSummary,
  fetchExpenses,
  fetchCategories,
  fetchAnalyticsSummary,
  createExpense,
  updateExpense,
  deleteExpense,
  setBudget,
  resetDatabase,
} from '../lib/api';
import { BudgetSummary, CategorySummary, Expense, AnalyticsSummary } from '../types';
import { CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export default function DashboardPage() {
  const [currentMonth, setCurrentMonth] = useState('2026-09');
  const [budgetSummary, setBudgetSummary] = useState<BudgetSummary | null>(null);
  const [categories, setCategories] = useState<CategorySummary[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);

  // Filters and sorting
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Modal states
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);

  // Status & Notification
  const [loading, setLoading] = useState(true);
  const [isResetting, setIsResetting] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Main data loader
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [budgetRes, catRes, analyticsRes, expRes] = await Promise.all([
        fetchBudgetSummary(currentMonth),
        fetchCategories(currentMonth),
        fetchAnalyticsSummary(currentMonth),
        fetchExpenses({
          month: currentMonth,
          category: selectedCategory,
          search: searchQuery,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          sortBy,
          sortOrder,
        }),
      ]);

      if (budgetRes?.data?.summary) setBudgetSummary(budgetRes.data.summary);
      else if (budgetRes?.summary) setBudgetSummary(budgetRes.summary);

      if (catRes?.data) setCategories(catRes.data);
      else if (Array.isArray(catRes)) setCategories(catRes);

      if (analyticsRes?.budget) setAnalytics(analyticsRes);
      else if (analyticsRes?.data?.budget) setAnalytics(analyticsRes.data);

      if (expRes?.data) setExpenses(expRes.data);
      else if (Array.isArray(expRes)) setExpenses(expRes);
    } catch (err: any) {
      console.warn('Dashboard data loader fallback notice:', err);
    } finally {
      setLoading(false);
    }
  }, [currentMonth, selectedCategory, searchQuery, startDate, endDate, sortBy, sortOrder]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Handle Create or Update Expense
  const handleSaveExpense = async (data: {
    title: string;
    amount: number;
    category_name: string;
    date: string;
    notes?: string;
    payment_method?: string;
  }) => {
    try {
      if (expenseToEdit) {
        await updateExpense(expenseToEdit.id, data);
        showToast(`Updated expense: ${data.title}`);
      } else {
        await createExpense(data);
        showToast(`Recorded expense: ${data.title}`);
      }
      await loadDashboardData();
    } catch (err: any) {
      showToast(err.message || 'Failed to save expense', 'error');
      throw err;
    }
  };

  // Handle Delete Expense
  const handleDeleteExpense = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this expense record?')) {
      return;
    }
    try {
      await deleteExpense(id);
      showToast('Expense removed successfully');
      await loadDashboardData();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete expense', 'error');
    }
  };

  // Handle Budget Update
  const handleSaveBudget = async (amount: number, notes?: string) => {
    try {
      await setBudget(currentMonth, amount, notes);
      showToast(`Monthly budget set to R ${amount.toLocaleString()}`);
      await loadDashboardData();
    } catch (err: any) {
      showToast(err.message || 'Failed to update budget', 'error');
      throw err;
    }
  };

  // Handle Reset to Demo
  const handleResetDemo = async () => {
    if (!window.confirm('Reset all expense and budget records to default student demo data?')) {
      return;
    }
    try {
      setIsResetting(true);
      await resetDatabase();
      setSelectedCategory('All');
      setSearchQuery('');
      setStartDate('');
      setEndDate('');
      await loadDashboardData();
      showToast('Demo data successfully reloaded');
    } catch (err: any) {
      showToast(err.message || 'Failed to reset demo data', 'error');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col text-slate-900">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom-3 duration-200">
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-sm font-semibold ${
              toast.type === 'error'
                ? 'bg-rose-50 text-rose-800 border-rose-200'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
            }`}
          >
            {toast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-600" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        currentMonth={currentMonth}
        onMonthChange={(m) => {
          setCurrentMonth(m);
          setStartDate('');
          setEndDate('');
        }}
        onOpenAddModal={() => {
          setExpenseToEdit(null);
          setIsExpenseModalOpen(true);
        }}
        onOpenBudgetModal={() => setIsBudgetModalOpen(true)}
        onResetDemo={handleResetDemo}
        isResetting={isResetting}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Top Header Information Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Student Financial Overview
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Allowance management & expense tracking for university students • Month of{' '}
              <span className="font-semibold text-slate-700">
                {currentMonth === '2026-09'
                  ? 'September 2026'
                  : currentMonth === '2026-08'
                  ? 'August 2026'
                  : currentMonth}
              </span>
            </p>
          </div>

          {loading && (
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
              <span>Updating balances...</span>
            </div>
          )}
        </div>

        {/* 1. Key Budget Stat Cards & Daily Burn Rate */}
        <BudgetSummaryCards
          summary={budgetSummary}
          onOpenBudgetModal={() => setIsBudgetModalOpen(true)}
        />

        {/* 2. Category Spending Breakdown */}
        <CategoryBreakdown
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => setSelectedCategory(cat)}
        />

        {/* 3. Visual Spending Trend Charts */}
        <SpendingCharts analytics={analytics} />

        {/* 4. Filterable Expense List & Receipts Table */}
        <ExpenseList
          expenses={expenses}
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => setSelectedCategory(cat)}
          searchQuery={searchQuery}
          onSearchChange={(q) => setSearchQuery(q)}
          startDate={startDate}
          endDate={endDate}
          onDateChange={(s, e) => {
            setStartDate(s);
            setEndDate(e);
          }}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={(sb, so) => {
            setSortBy(sb);
            setSortOrder(so);
          }}
          onEditExpense={(exp) => {
            setExpenseToEdit(exp);
            setIsExpenseModalOpen(true);
          }}
          onDeleteExpense={handleDeleteExpense}
          onOpenAddModal={() => {
            setExpenseToEdit(null);
            setIsExpenseModalOpen(true);
          }}
        />
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <p className="font-medium">
          Student Budget and Expense Tracker • Work-Integrated Learning Project
        </p>
        <p className="text-2xs text-slate-400 mt-1">
          Designed for Tshwane University of Technology (TUT) Computer Systems Engineering • ZAR (R)
        </p>
      </footer>

      {/* Modals */}
      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => {
          setIsExpenseModalOpen(false);
          setExpenseToEdit(null);
        }}
        onSubmit={handleSaveExpense}
        categories={categories}
        expenseToEdit={expenseToEdit}
      />

      <SetBudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        currentAmount={budgetSummary?.budget_amount || 3500}
        currentMonth={currentMonth}
        onSave={handleSaveBudget}
      />
    </div>
  );
}

