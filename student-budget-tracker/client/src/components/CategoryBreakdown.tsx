'use client';

import React from 'react';
import { CategorySummary } from '../types';
import { formatZAR, formatPercentage } from '../lib/formatters';
import {
  Utensils,
  Bus,
  BookOpen,
  Smartphone,
  Sparkles,
  Home,
  Coffee,
  HelpCircle,
  Tag,
} from 'lucide-react';

interface CategoryBreakdownProps {
  categories: CategorySummary[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

const ICON_MAP: Record<string, any> = {
  Utensils,
  Bus,
  BookOpen,
  Smartphone,
  Sparkles,
  Home,
  Coffee,
  HelpCircle,
};

export const CategoryBreakdown: React.FC<CategoryBreakdownProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Tag className="w-4 h-4 text-emerald-600" />
            Spending by Category
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Click on any category to filter your logged transactions
          </p>
        </div>

        {selectedCategory !== 'All' && (
          <button
            onClick={() => onSelectCategory('All')}
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg transition"
          >
            Clear Filter (Show All)
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {categories.map((cat) => {
          const IconComponent = ICON_MAP[cat.icon] || HelpCircle;
          const isSelected = selectedCategory === cat.category_name;

          return (
            <button
              key={cat.category_id || cat.category_name}
              onClick={() => onSelectCategory(isSelected ? 'All' : cat.category_name)}
              className={`text-left p-3.5 rounded-xl border transition-all ${
                isSelected
                  ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/70'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 shadow-2xs"
                    style={{ backgroundColor: cat.color || '#10B981' }}
                  >
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 leading-tight">
                      {cat.category_name}
                    </h3>
                    <span className="text-2xs text-slate-400">
                      {cat.expense_count} {cat.expense_count === 1 ? 'item' : 'items'}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-900">{formatZAR(cat.total_spent)}</div>
                  <div className="text-2xs font-semibold text-emerald-600">
                    {formatPercentage(cat.percentage_of_total_spent)}
                  </div>
                </div>
              </div>

              {/* Mini progress bar */}
              <div className="mt-2.5 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-1.5 rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, Math.max(0, cat.percentage_of_total_spent))}%`,
                    backgroundColor: cat.color || '#10B981',
                  }}
                ></div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

