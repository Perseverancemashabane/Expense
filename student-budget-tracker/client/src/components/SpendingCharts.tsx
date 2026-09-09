'use client';

import React from 'react';
import { AnalyticsSummary } from '../types';
import { formatZAR } from '../lib/formatters';
import { BarChart3, PieChart, CreditCard } from 'lucide-react';

interface SpendingChartsProps {
  analytics: AnalyticsSummary | null;
}

export const SpendingCharts: React.FC<SpendingChartsProps> = ({ analytics }) => {
  if (!analytics) return null;

  const { dailyTrend, categoryBreakdown, paymentMethods, budget } = analytics;

  // Max daily amount for scaling bars
  const maxDayAmount = Math.max(...dailyTrend.map((d) => d.amount), 100);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* 1. Daily Spending Trend Bar Graph */}
      <div className="lg:col-span-2 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-600" />
              Daily Spending Distribution (September 2026)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Track daily expenses against your recommended daily allowance limit
            </p>
          </div>
          <div className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
            Total: {formatZAR(budget.total_spent)}
          </div>
        </div>

        {/* Bar Chart Container */}
        <div className="mt-6">
          <div className="h-44 flex items-end gap-1 sm:gap-1.5 pt-6 pb-2 px-1 border-b border-slate-200 overflow-x-auto">
            {dailyTrend.map((item) => {
              const heightPercent = item.amount > 0 ? Math.max(8, (item.amount / maxDayAmount) * 100) : 0;
              const isToday = item.day === 9; // Today's anchor date
              const hasSpend = item.amount > 0;

              return (
                <div
                  key={item.date}
                  className="flex-1 min-w-[14px] flex flex-col items-center group relative cursor-pointer"
                >
                  {/* Tooltip */}
                  <div className="absolute -top-10 scale-0 group-hover:scale-100 transition-all z-20 bg-slate-900 text-white text-2xs py-1 px-2 rounded-md shadow-md whitespace-nowrap pointer-events-none">
                    <p className="font-bold">{item.date}</p>
                    <p className="text-emerald-300">{formatZAR(item.amount)}</p>
                  </div>

                  {/* Vertical bar */}
                  <div className="w-full flex items-end justify-center h-32">
                    <div
                      className={`w-full rounded-t transition-all duration-300 ${
                        hasSpend
                          ? isToday
                            ? 'bg-indigo-600 group-hover:bg-indigo-700'
                            : 'bg-emerald-500 group-hover:bg-emerald-600'
                          : 'bg-slate-100'
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    ></div>
                  </div>

                  {/* Day label */}
                  <span
                    className={`mt-1.5 text-3xs font-semibold ${
                      isToday ? 'text-indigo-700 font-bold' : 'text-slate-400'
                    }`}
                  >
                    {item.day}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-emerald-500"></span>
                <span>Past Days Spend</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-indigo-600"></span>
                <span>Today (09 Sep)</span>
              </div>
            </div>
            <span>Peak Day: {formatZAR(maxDayAmount)}</span>
          </div>
        </div>
      </div>

      {/* 2. Payment Methods & Spending Distribution */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                Payment Channels
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Where your student money flows</p>
            </div>
          </div>

          {/* Payment Method Bars */}
          <div className="space-y-3 mt-4">
            {paymentMethods.map((pm) => (
              <div key={pm.method} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span>{pm.method}</span>
                  <span>
                    {formatZAR(pm.amount)} ({pm.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-600 h-2 rounded-full"
                    style={{ width: `${Math.min(100, Math.max(0, pm.percentage))}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Student Financial Health Advice */}
        <div className="mt-6 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <PieChart className="w-4 h-4 text-emerald-600" />
            Budget Health Check
          </div>
          <p className="mt-1 text-xs text-slate-600 leading-relaxed">
            {budget.insightMessage}
          </p>
        </div>
      </div>
    </div>
  );
};

