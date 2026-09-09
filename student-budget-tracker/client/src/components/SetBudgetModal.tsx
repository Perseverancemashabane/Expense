'use client';

import React, { useState, useEffect } from 'react';
import { X, Check, Banknote, AlertCircle } from 'lucide-react';

interface SetBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAmount: number;
  currentMonth: string;
  onSave: (amount: number, notes?: string) => Promise<void>;
}

export const SetBudgetModal: React.FC<SetBudgetModalProps> = ({
  isOpen,
  onClose,
  currentAmount,
  currentMonth,
  onSave,
}) => {
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAmount(String(currentAmount || 3500));
      setNotes('Monthly NSFAS Allowance & Student Budget');
      setError('');
    }
  }, [isOpen, currentAmount]);

  if (!isOpen) return null;

  const handlePreset = (preset: number) => {
    setAmount(String(preset));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed <= 0) {
      setError('Please enter a valid positive budget amount in ZAR.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave(parsed, notes.trim());
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update budget');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Banknote className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Set Monthly Allowance ({currentMonth})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-xs font-medium text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Monthly Budget Amount (ZAR) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base font-bold text-slate-500">
                R
              </span>
              <input
                type="number"
                step="50"
                min="100"
                required
                placeholder="3500.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-lg font-extrabold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          {/* Quick preset chips */}
          <div>
            <span className="block text-2xs font-semibold uppercase text-slate-500 mb-1.5">
              Quick Allowance Presets:
            </span>
            <div className="flex flex-wrap gap-2">
              {[2500, 3500, 4500, 5000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handlePreset(preset)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold border transition ${
                    parseFloat(amount) === preset
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-300'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  R {preset.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Funding Source or Note
            </label>
            <input
              type="text"
              placeholder="e.g. NSFAS Allowance, Bursary stipend, Part-time job"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 transition shadow-xs flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? 'Updating...' : 'Save Allowance'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

