'use client';

import React, { useState, useEffect } from 'react';
import { Expense, CategorySummary } from '../types';
import { X, CheckCircle, AlertCircle } from 'lucide-react';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    amount: number;
    category_name: string;
    date: string;
    notes?: string;
    payment_method?: string;
  }) => Promise<void>;
  categories: CategorySummary[];
  expenseToEdit?: Expense | null;
}

export const ExpenseModal: React.FC<ExpenseModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  categories,
  expenseToEdit,
}) => {
  const isEditing = !!expenseToEdit;

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [date, setDate] = useState('2026-09-09');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (expenseToEdit) {
      setTitle(expenseToEdit.title);
      setAmount(String(expenseToEdit.amount));
      setCategoryName(expenseToEdit.category_name);
      setDate(expenseToEdit.date ? expenseToEdit.date.slice(0, 10) : new Date().toISOString().slice(0, 10));
      setPaymentMethod(expenseToEdit.payment_method || 'Cash');
      setNotes(expenseToEdit.notes || '');
    } else {
      setTitle('');
      setAmount('');
      setCategoryName(categories[0]?.category_name || 'Food & Groceries');
      setDate(new Date().toISOString().slice(0, 10));
      setPaymentMethod('Cash');
      setNotes('');
    }
    setError('');
  }, [expenseToEdit, isOpen, categories]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Please provide a title or item description.');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount greater than 0.');
      return;
    }

    if (!categoryName) {
      setError('Please select a category.');
      return;
    }

    if (!date) {
      setError('Please select a date.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        title: title.trim(),
        amount: numAmount,
        category_name: categoryName,
        date,
        notes: notes.trim(),
        payment_method: paymentMethod,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save expense');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">
            {isEditing ? 'Edit Expense Record' : 'Log New Student Expense'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-xs font-medium text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Item or Service Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Spar Lunch, Minibus Taxi, Printing Lab"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Amount (ZAR) & Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Amount (ZAR) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500">
                  R
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-8 pr-3.5 py-2 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Date *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          {/* Category & Payment Method */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Category *
              </label>
              <select
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none bg-white"
              >
                {categories.map((cat) => (
                  <option key={cat.category_id || cat.category_name} value={cat.category_name}>
                    {cat.category_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Payment Channel
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none bg-white"
              >
                <option value="Cash">Cash</option>
                <option value="Debit Card">Debit Card</option>
                <option value="EFT">EFT / Mobile App</option>
                <option value="Campus Card">Campus Card</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Notes (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Return taxi fare, group study printing split"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none resize-none"
            />
          </div>

          {/* Modal Footer Actions */}
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
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 transition shadow-xs flex items-center gap-1.5"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving...' : isEditing ? 'Update Record' : 'Record Expense'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

