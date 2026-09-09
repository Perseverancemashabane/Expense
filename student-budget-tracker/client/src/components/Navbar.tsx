'use client';

import React from 'react';
import { Wallet, PlusCircle, SlidersHorizontal, RotateCcw, User } from 'lucide-react';

interface NavbarProps {
  currentMonth: string;
  onMonthChange: (month: string) => void;
  onOpenAddModal: () => void;
  onOpenBudgetModal: () => void;
  onResetDemo: () => void;
  isResetting: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentMonth,
  onMonthChange,
  onOpenAddModal,
  onOpenBudgetModal,
  onResetDemo,
  isResetting,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Logo & Student Identity */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  Student Budget Tracker
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    ZAR (R)
                  </span>
                </h1>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Naledi M. • TUT Computer Systems Eng.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Controls: Month Selector & Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Month Selector */}
            <div className="flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200 text-xs sm:text-sm">
              <label htmlFor="month-select" className="px-2 font-medium text-slate-600">
                Period:
              </label>
              <select
                id="month-select"
                value={currentMonth}
                onChange={(e) => onMonthChange(e.target.value)}
                aria-label="Select budget period"
                className="bg-white border-0 rounded-md py-1 px-2.5 text-slate-800 font-semibold shadow-xs focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer"
              >
                <option value="2026-08">August 2026</option>
                <option value="2026-09">September 2026</option>
                <option value="2026-10">October 2026</option>
              </select>
            </div>

            {/* Set Budget Button */}
            <button
              onClick={onOpenBudgetModal}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 active:bg-slate-100 transition shadow-2xs"
              title="Change monthly allowance limit"
            >
              <SlidersHorizontal className="w-4 h-4 text-slate-600" />
              <span>Set Budget</span>
            </button>

            {/* Log Expense Primary Button */}
            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 transition shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Log Expense</span>
            </button>

            {/* Reset Seed Demo Data */}
            <button
              onClick={onResetDemo}
              disabled={isResetting}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 border border-slate-200 transition"
              title="Reset to default sample student expenses"
            >
              <RotateCcw className={`w-4 h-4 ${isResetting ? 'animate-spin text-emerald-600' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

