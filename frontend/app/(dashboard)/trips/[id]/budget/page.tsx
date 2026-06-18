'use client';

/**
 * page.tsx — Budget & Expense Tracker Screen
 *
 * Provides analytical visualization of planned budget vs spent actuals,
 * category breakdown progress, log table, and input forms to add/delete entries.
 */

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import {
  Calendar,
  Loader2,
  ArrowLeft,
  DollarSign,
  Trash2,
  AlertCircle,
  Plus,
  TrendingDown,
  TrendingUp,
  PieChart,
  Tag,
  FileText
} from 'lucide-react';

interface BudgetEntry {
  _id: string;
  tripId: string;
  category: 'Food' | 'Stay' | 'Transport' | 'Activities' | 'Other';
  amount: number;
  description?: string;
  createdAt: string;
}

interface BudgetSummary {
  totalBudget: number;
  spent: number;
  remaining: number;
  breakdown: {
    Food: number;
    Stay: number;
    Transport: number;
    Activities: number;
    Other: number;
  };
}

interface Trip {
  _id: string;
  title: string;
  budget: number;
  startDate: string;
  endDate: string;
  destinationId?: {
    name: string;
  };
}

export default function BudgetTrackerPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = params.id as string;

  const { isAuthenticated, initialize } = useAuthStore();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [entries, setEntries] = useState<BudgetEntry[]>([]);
  const [summary, setSummary] = useState<BudgetSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form states
  const [category, setCategory] = useState<'Food' | 'Stay' | 'Transport' | 'Activities' | 'Other'>('Food');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const fetchBudgetData = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      // 1. Fetch Trip details
      const tripRes = await api.get(`/trips/${tripId}`);
      if (tripRes.data.success) {
        setTrip(tripRes.data.trip);
      }

      // 2. Fetch Budget entries
      const entriesRes = await api.get(`/trips/${tripId}/budget-entries`);
      if (entriesRes.data.success) {
        setEntries(entriesRes.data.entries);
      }

      // 3. Fetch Budget summary
      const summaryRes = await api.get(`/trips/${tripId}/budget-summary`);
      if (summaryRes.data.success) {
        setSummary(summaryRes.data.summary);
      }
    } catch (err: any) {
      console.error('Error fetching budget data:', err);
      if (err.response?.status === 401) {
        router.push('/login');
        return;
      }
      if (err.response?.status === 403) {
        setErrorMsg('Access denied: You are not authorized to view this trip\'s budget.');
        return;
      }
      setErrorMsg('Could not load budget data. Make sure you are a participant of this trip.');
    } finally {
      setIsLoading(false);
    }
  }, [tripId, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchBudgetData();
    } else if (!isLoading) {
      router.push('/login');
    }
  }, [isAuthenticated, fetchBudgetData, router, isLoading]);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const numericAmount = Number(amount);

    if (isNaN(numericAmount) || numericAmount <= 0) {
      setFormError('Amount must be a positive number');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post(`/trips/${tripId}/budget-entries`, {
        category,
        amount: numericAmount,
        description: description.trim() || undefined,
      });

      if (res.data.success) {
        // Clear form
        setAmount('');
        setDescription('');
        
        // Reload budget lists and summary calculation
        const entriesRes = await api.get(`/trips/${tripId}/budget-entries`);
        const summaryRes = await api.get(`/trips/${tripId}/budget-summary`);
        if (entriesRes.data.success) setEntries(entriesRes.data.entries);
        if (summaryRes.data.success) setSummary(summaryRes.data.summary);
      }
    } catch (err: any) {
      console.error('Error adding expense:', err);
      setFormError(err.response?.data?.message || 'Failed to record expense. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteExpense = async (entryId: string) => {
    if (!confirm('Are you sure you want to delete this expense record?')) return;

    try {
      const res = await api.delete(`/trips/${tripId}/budget-entries/${entryId}`);
      if (res.data.success) {
        // Refresh local listings and summary
        setEntries(entries.filter((entry) => entry._id !== entryId));
        const summaryRes = await api.get(`/trips/${tripId}/budget-summary`);
        if (summaryRes.data.success) setSummary(summaryRes.data.summary);
      }
    } catch (err: any) {
      console.error('Error deleting expense:', err);
      alert(err.response?.data?.message || 'Failed to delete expense.');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="flex-grow flex flex-col justify-center items-center py-20 bg-slate-950">
        <Loader2 className="h-10 w-10 text-teal-500 animate-spin" />
        <p className="mt-4 text-sm text-slate-500">Loading budget tracker...</p>
      </div>
    );
  }

  if (errorMsg || !trip || !summary) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-rose-500" />
        <h3 className="mt-4 text-lg font-bold text-white">Error Loading Budget</h3>
        <p className="mt-2 text-sm text-slate-400">{errorMsg || 'Budget data could not be parsed.'}</p>
        <div className="mt-6">
          <Link
            href={`/trips/${tripId}`}
            className="inline-flex items-center space-x-2 rounded-lg bg-slate-900 border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Trip Details</span>
          </Link>
        </div>
      </div>
    );
  }

  // Calculate budget stats
  const spentPercent = trip.budget > 0 ? (summary.spent / trip.budget) * 100 : 0;
  const isOverSpent = summary.spent > trip.budget;

  const getProgressBarColor = (percent: number) => {
    if (percent > 100) return 'bg-rose-500';
    if (percent > 75) return 'bg-amber-500';
    return 'bg-teal-500';
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Food': return 'bg-orange-500 text-orange-400 border-orange-500/25';
      case 'Stay': return 'bg-sky-500 text-sky-400 border-sky-500/25';
      case 'Transport': return 'bg-indigo-500 text-indigo-400 border-indigo-500/25';
      case 'Activities': return 'bg-emerald-500 text-emerald-400 border-emerald-500/25';
      default: return 'bg-purple-500 text-purple-400 border-purple-500/25';
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 w-full flex-grow flex flex-col justify-start">
      
      {/* Back link */}
      <div className="mb-6">
        <Link
          href={`/trips/${tripId}`}
          className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-teal-400 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Trip Details</span>
        </Link>
      </div>

      {/* Header and Summary stats */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Trip Budget Tracker
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Analytics for <span className="text-white font-bold">{trip.title}</span> {trip.destinationId ? `to ${trip.destinationId.name}` : ''}
          </p>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
        {/* Total Budget */}
        <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-6 shadow-2xl backdrop-blur-md relative overflow-hidden">
          <div className="absolute right-4 top-4 text-slate-700"><DollarSign className="h-8 w-8" /></div>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Planned Budget</p>
          <p className="mt-2 text-3xl font-extrabold text-white">₹{summary.totalBudget.toLocaleString('en-IN')}</p>
        </div>

        {/* Total Spent */}
        <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-6 shadow-2xl backdrop-blur-md relative overflow-hidden">
          <div className="absolute right-4 top-4 text-slate-700">
            {isOverSpent ? <TrendingUp className="h-8 w-8 text-rose-500" /> : <TrendingDown className="h-8 w-8 text-teal-500" />}
          </div>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total Actual Spent</p>
          <p className="mt-2 text-3xl font-extrabold text-white">₹{summary.spent.toLocaleString('en-IN')}</p>
        </div>

        {/* Remaining Balance */}
        <div className={`rounded-2xl border border-white/5 bg-slate-900/40 p-6 shadow-2xl backdrop-blur-md relative overflow-hidden`}>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Remaining Balance</p>
          <p className={`mt-2 text-3xl font-extrabold ${summary.remaining >= 0 ? 'text-teal-400' : 'text-rose-400'}`}>
            ₹{summary.remaining.toLocaleString('en-IN')}
          </p>
          <span className="text-[10px] block mt-1 text-slate-400">
            {summary.remaining >= 0 ? 'Within budget limit' : 'Budget limit exceeded!'}
          </span>
        </div>
      </div>

      {/* Budget Spending Progress Bar */}
      <div className="mt-6 rounded-2xl border border-white/5 bg-slate-900/40 p-6 shadow-2xl backdrop-blur-md">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2.5">
          <span>Overall Spending Progress</span>
          <span className={isOverSpent ? 'text-rose-400 font-bold' : 'text-slate-200'}>
            {spentPercent.toFixed(1)}% of budget spent
          </span>
        </div>
        <div className="w-full bg-slate-950 rounded-full h-3.5 border border-white/5 overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${getProgressBarColor(spentPercent)}`}
            style={{ width: `${Math.min(spentPercent, 100)}%` }}
          />
        </div>
      </div>

      {/* Category Breakdown & Inputs form Grid */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left 1 Col: Category Breakdown meter */}
        <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-6 shadow-2xl backdrop-blur-md">
          <h3 className="text-lg font-bold text-white flex items-center space-x-2">
            <PieChart className="h-5 w-5 text-indigo-400" />
            <span>Category Breakdown</span>
          </h3>

          <div className="mt-6 space-y-4">
            {Object.entries(summary.breakdown).map(([catName, catSpent]) => {
              const maxCatSpent = Math.max(...Object.values(summary.breakdown), 1);
              const percentOfMax = (catSpent / maxCatSpent) * 100;
              const percentOfBudget = trip.budget > 0 ? (catSpent / trip.budget) * 100 : 0;

              return (
                <div key={catName} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300">{catName}</span>
                    <span className="text-slate-400 font-semibold">
                      ₹{catSpent.toLocaleString('en-IN')}{' '}
                      <span className="text-[10px] text-slate-500">({percentOfBudget.toFixed(0)}%)</span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-white/5">
                    <div
                      className={`h-full ${getCategoryColor(catName).split(' ')[0]}`}
                      style={{ width: `${percentOfMax}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 2 Cols: Form and Logs list */}
        <div className="lg:col-span-2 space-y-8">
          {/* Main Action Block: Add Expense form & logs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            
            {/* Expense form */}
            <div className="md:col-span-1 rounded-2xl border border-white/5 bg-slate-900/40 p-6 shadow-2xl backdrop-blur-md">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Plus className="h-4.5 w-4.5 text-teal-400" />
                <span>Log Expense</span>
              </h3>

              <form onSubmit={handleAddExpense} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-teal-500 transition-colors"
                  >
                    <option value="Food">Food 🍔</option>
                    <option value="Stay">Stay 🏨</option>
                    <option value="Transport">Transport ✈️</option>
                    <option value="Activities">Activities 🏄</option>
                    <option value="Other">Other 🎒</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Amount (INR)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="500.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-600 outline-none focus:border-teal-500 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Description
                  </label>
                  <input
                    type="text"
                    placeholder="Lunch at beach resort"
                    maxLength={200}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-600 outline-none focus:border-teal-500 transition-colors"
                  />
                </div>

                {formError && (
                  <p className="text-[10px] text-rose-400 font-semibold bg-rose-500/10 border border-rose-500/20 rounded p-2 flex items-center space-x-1">
                    <AlertCircle className="h-3 w-3" />
                    <span>{formError}</span>
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-lg bg-teal-500 py-2.5 text-xs font-bold text-slate-950 hover:bg-teal-400 transition-colors disabled:opacity-50 flex items-center justify-center space-x-1.5"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <span>Add Expense</span>
                  )}
                </button>
              </form>
            </div>

            {/* Expense logs list */}
            <div className="md:col-span-2 rounded-2xl border border-white/5 bg-slate-900/40 p-6 shadow-2xl backdrop-blur-md flex flex-col justify-start">
              <h3 className="text-base font-bold text-white flex items-center space-x-2 mb-4">
                <FileText className="h-4.5 w-4.5 text-indigo-400" />
                <span>Expense Logs</span>
              </h3>

              {entries.length === 0 ? (
                <div className="py-12 border border-dashed border-white/5 rounded-xl text-center bg-slate-950/20 flex flex-col justify-center items-center">
                  <Tag className="h-8 w-8 text-slate-700" />
                  <p className="text-xs text-slate-500 mt-2 font-semibold">No expenses recorded yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-white/5 text-left text-xs">
                    <thead>
                      <tr className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                        <th className="pb-3 pr-2">Date</th>
                        <th className="pb-3 px-2">Category</th>
                        <th className="pb-3 px-2">Description</th>
                        <th className="pb-3 px-2 text-right">Amount</th>
                        <th className="pb-3 pl-2 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-slate-300">
                      {entries.map((entry) => (
                        <tr key={entry._id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-3 pr-2 whitespace-nowrap text-[11px] text-slate-400">
                            {formatDate(entry.createdAt)}
                          </td>
                          <td className="py-3 px-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getCategoryColor(entry.category).split(' ').slice(1).join(' ')}`}>
                              {entry.category}
                            </span>
                          </td>
                          <td className="py-3 px-2 max-w-[150px] truncate" title={entry.description}>
                            {entry.description || <span className="text-slate-600 font-mono">-</span>}
                          </td>
                          <td className="py-3 px-2 text-right font-semibold text-slate-200">
                            ₹{entry.amount.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 pl-2 text-center">
                            <button
                              onClick={() => handleDeleteExpense(entry._id)}
                              className="text-slate-600 hover:text-rose-400 p-1 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
