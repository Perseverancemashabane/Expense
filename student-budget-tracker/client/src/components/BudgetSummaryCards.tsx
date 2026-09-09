'use client';

import React from 'react';
import { BudgetSummary } from '../types';
import { formatZAR, formatPercentage } from '../lib/formatters';
import {
  Banknote,
  TrendingDown,
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  Calendar,
  Flame,
  CheckCircle2,
} from 'lucide-react';

interface BudgetSummaryCardsProps {
  summary: BudgetSummary | null;
  onOpenBudgetModal: () => void;
}

export const BudgetSummaryCards: React.FC<BudgetSummaryCardsProps> = ({
  summary,
  onOpenBudgetModal,
}) => {
  if (!summary) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-slate-200 rounded-2xl"></div>
        ))}
      </div>
    );
  }

  const {
    budget_amount,
    total_spent,
    remaining_budget,
    percentage_spent,
    status,
    days_remaining,
    daily_burn_rate,
    recommended_daily_budget,
  } = summary;

  // Status configuration
  let statusBadge = {
    label: 'On Track',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    icon: ShieldCheck,
    cardBorder: 'border-slate-200',
    progressColor: 'bg-emerald-500',
  };

  if (status === 'warning') {
    statusBadge = {
      label: 'Warning (Nearing Limit)',
      color: 'bg-amber-100 text-amber-800 border-amber-200',
      icon: AlertTriangle,
      cardBorder: 'border-amber-200',
      progressColor: 'bg-amber-500',
    };
  } else if (status === 'danger') {
    statusBadge = {
      label: 'Over Budget!',
      color: 'bg-rose-100 text-rose-800 border-rose-200',
      icon: AlertOctagon,
      cardBorder: 'border-rose-300',
      progressColor: 'bg-rose-500',
    };
  }

  const StatusIcon = statusBadge.icon;

  return (
    <div className="space-y-4">
      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Monthly Budget */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Monthly Budget
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Banknote className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {formatZAR(budget_amount)}
            </div>
            <button
              onClick={onOpenBudgetModal}
              className="mt-2 text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1"
            >
              <span>Edit monthly allowance</span>
              <span>→</span>
            </button>
          </div>
        </div>

        {/* 2. Total Spent */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Spent
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {formatZAR(total_spent)}
            </div>
            {/* Progress bar */}
            <div className="mt-2.5">
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${statusBadge.progressColor}`}
                  style={{ width: `${Math.min(100, Math.max(0, percentage_spent))}%` }}
                ></div>
              </div>
              <div className="mt-1 flex items-center justify-between text-2xs text-slate-500">
                <span>{formatPercentage(percentage_spent)} used</span>
                <span>{formatPercentage(Math.max(0, 100 - percentage_spent))} left</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Remaining Budget */}
        <div className={`bg-white rounded-2xl p-5 border ${statusBadge.cardBorder} shadow-xs hover:shadow-md transition`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Remaining Balance
            </span>
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                remaining_budget >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
              }`}
            >
              <StatusIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div
              className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
                remaining_budget >= 0 ? 'text-slate-900' : 'text-rose-600'
              }`}
            >
              {formatZAR(remaining_budget)}
            </div>
            <div className="mt-2">
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusBadge.color}`}
              >
                <StatusIcon className="w-3 h-3" />
                {statusBadge.label}
              </span>
            </div>
          </div>
        </div>

        {/* 4. Student Daily Allowance Calculator */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Safe Daily Spend
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {formatZAR(recommended_daily_budget)}
              <span className="text-xs font-normal text-slate-500 ml-1">/ day</span>
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{days_remaining} days left in period</span>
            </div>
          </div>
        </div>
      </div>

      {/* Student Financial Health Banner */}
      <div
        className={`rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border ${
          status === 'danger'
            ? 'bg-rose-50 border-rose-200 text-rose-900'
            : status === 'warning'
            ? 'bg-amber-50 border-amber-200 text-amber-900'
            : 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
        }`}
      >
        <div className="flex items-start sm:items-center gap-3">
          <div
            className={`p-2 rounded-lg shrink-0 ${
              status === 'danger'
                ? 'bg-rose-200 text-rose-800'
                : status === 'warning'
                ? 'bg-amber-200 text-amber-800'
                : 'bg-emerald-200 text-emerald-800'
            }`}
          >
            {status === 'danger' ? (
              <AlertOctagon className="w-5 h-5" />
            ) : status === 'warning' ? (
              <AlertTriangle className="w-5 h-5" />
            ) : (
              <CheckCircle2 className="w-5 h-5" />
            )}
          </div>
          <div>
            <h2 className="text-sm font-bold">
              {status === 'danger'
                ? 'Budget Deficit Alert'
                : status === 'warning'
                ? 'High Spending Pace Caution'
                : 'Pacing On Target'}
            </h2>
            <p className="text-xs opacity-90 mt-0.5">
              {status === 'danger'
                ? `You have spent R ${Math.abs(remaining_budget).toFixed(2)} past your monthly NSFAS/Student budget. Reduce discretionary spending.`
                : status === 'warning'
                ? `You've used ${percentage_spent.toFixed(1)}% of allowance. Your current burn rate is ${formatZAR(
                    daily_burn_rate
                  )}/day.`
                : `You are spending an average of ${formatZAR(
                    daily_burn_rate
                  )}/day with ${formatZAR(recommended_daily_budget)}/day allocated for the rest of the month.`}
            </p>
          </div>
        </div>

        <div className="text-xs font-semibold shrink-0">
          <span className="inline-block px-3 py-1.5 rounded-lg bg-white/80 border border-current shadow-2xs">
            Burn Rate: {formatZAR(daily_burn_rate)} / day
          </span>
        </div>
      </div>
    </div>
  );
};

