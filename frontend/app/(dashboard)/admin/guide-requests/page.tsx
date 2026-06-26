// This file renders the page screen for guide requests in the browser.
'use client';

/**
 * admin/guide-requests/page.tsx
 *
 * Admin view of all guide booking requests across the platform.
 * Shows traveler → guide request details, statuses, and trip context.
 * Guides can accept/reject their own requests from their dashboard;
 * this view gives admins full visibility across all requests.
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import {
  MessageSquare,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  User,
  Compass,
  AlertCircle,
  RefreshCw,
  Search,
} from 'lucide-react';


interface GuideRequest {
  _id: string;
  travelerId: {
    _id: string;
    name: string;
    email: string;
  };
  guideId: {
    _id: string;
    userId?: {
      name: string;
      email: string;
    };
  };
  tripId: {
    _id: string;
    title: string;
    startDate: string;
    endDate: string;
    budget?: number;
    destinationId?: {
      name: string;
      country: string;
      state?: string;
    };
  };
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    icon: Clock,
    className: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
    dotClass: 'bg-amber-400',
  },
  accepted: {
    label: 'Accepted',
    icon: CheckCircle,
    className: 'bg-teal-500/10 text-teal-300 border-teal-500/20',
    dotClass: 'bg-teal-400',
  },
  rejected: {
    label: 'Rejected',
    icon: XCircle,
    className: 'bg-rose-500/10 text-rose-300 border-rose-500/20',
    dotClass: 'bg-rose-400',
  },
};

export default function AdminGuideRequestsPage() {
  const router = useRouter();
  const { user, isAuthenticated, initialize } = useAuthStore();

  const [requests, setRequests] = useState<GuideRequest[]>([]);
  const [filtered, setFiltered] = useState<GuideRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/admin/guide-requests');
      return;
    }
    if (user && user.role !== 'admin') {
      router.push('/destinations');
      return;
    }
    if (user?.role === 'admin') fetchRequests();
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    let result = requests;
    if (statusFilter !== 'all') {
      result = result.filter((r) => r.status === statusFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.travelerId?.name?.toLowerCase().includes(q) ||
          r.guideId?.userId?.name?.toLowerCase().includes(q) ||
          r.tripId?.title?.toLowerCase().includes(q) ||
          r.tripId?.destinationId?.name?.toLowerCase().includes(q) ||
          r.message?.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [requests, searchQuery, statusFilter]);

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await api.get('/guide-requests/admin/all');
      if (res.data.success) {
        setRequests(res.data.requests || []);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load guide requests.');
    } finally {
      setIsLoading(false);
    }
  };

  const counts = {
    all: requests.length,
    pending: requests.filter((r) => r.status === 'pending').length,
    accepted: requests.filter((r) => r.status === 'accepted').length,
    rejected: requests.filter((r) => r.status === 'rejected').length,
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-rose-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 py-8 px-4 sm:px-6 lg:px-8 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-rose-950/10 via-slate-950 to-slate-950">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="rounded-lg p-1.5 bg-rose-500/10 text-rose-400">
                <MessageSquare className="h-4 w-4" />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-rose-400">Admin</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Guide Booking Requests</h1>
            <p className="mt-1 text-sm text-slate-400">
              View all traveler→guide booking requests across the platform. Guides manage accept/reject from their dashboard.
            </p>
          </div>
          <button
            onClick={fetchRequests}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors self-start sm:self-center"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </button>
        </div>

        {/* Stats Pills */}
        <div className="flex flex-wrap gap-3 mb-6">
          {(['all', 'pending', 'accepted', 'rejected'] as const).map((s) => {
            const isSelected = statusFilter === s;
            const cfg = s !== 'all' ? STATUS_CONFIG[s] : null;
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all capitalize ${
                  isSelected
                    ? s === 'all'
                      ? 'bg-slate-700 border-slate-600 text-white'
                      : (cfg!.className + ' border')
                    : 'border-white/10 bg-slate-900/40 text-slate-400 hover:bg-white/5 hover:text-slate-200'
                }`}
              >
                {s !== 'all' && cfg && (
                  <span className={`h-1.5 w-1.5 rounded-full ${isSelected ? cfg.dotClass : 'bg-slate-600'}`} />
                )}
                {s === 'all' ? 'All' : cfg?.label}
                <span className="ml-0.5 opacity-70">({counts[s]})</span>
              </button>
            );
          })}

        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by traveler, guide, trip, or destination..."
            className="w-full rounded-xl border border-white/10 bg-slate-900/60 pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-colors"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 text-sm text-rose-400">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Requests List */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 rounded-2xl border border-dashed border-white/10 bg-slate-900/20 text-center">
            <MessageSquare className="h-12 w-12 text-slate-700 mb-4" />
            <h3 className="text-lg font-bold text-white">No requests found</h3>
            <p className="mt-2 text-sm text-slate-500 max-w-xs">
              {searchQuery || statusFilter !== 'all'
                ? 'No requests match your current filters.'
                : 'No guide booking requests have been submitted yet.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((req) => {
              const cfg = STATUS_CONFIG[req.status];
              const StatusIcon = cfg.icon;
              const guideUserName = req.guideId?.userId?.name || '—';
              const guideUserEmail = req.guideId?.userId?.email || '';
              const destName = req.tripId?.destinationId
                ? `${req.tripId.destinationId.name}${req.tripId.destinationId.state ? `, ${req.tripId.destinationId.state}` : ''}`
                : null;

              return (
                <div
                  key={req._id}
                  className="rounded-2xl border border-white/10 bg-slate-900/40 p-5 backdrop-blur-sm hover:border-white/20 transition-all"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">

                    {/* Left: core info */}
                    <div className="flex-1 min-w-0">
                      {/* Row 1: traveler + guide */}
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <div className="flex items-center gap-1.5">
                          <div className="h-6 w-6 rounded-full bg-gradient-to-br from-teal-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {req.travelerId?.name?.charAt(0) || '?'}
                          </div>
                          <span className="font-semibold text-sm text-white">{req.travelerId?.name}</span>
                          <span className="text-xs text-slate-500">{req.travelerId?.email}</span>
                        </div>
                        <span className="text-slate-600 text-sm">→</span>
                        <div className="flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 text-slate-500" />
                          <span className="font-semibold text-sm text-slate-200">{guideUserName}</span>
                          {guideUserEmail && (
                            <span className="text-xs text-slate-500">{guideUserEmail}</span>
                          )}
                        </div>
                      </div>

                      {/* Row 2: trip + destination */}
                      <div className="flex flex-wrap items-center gap-3 mb-3 text-sm text-slate-300">
                        <span className="flex items-center gap-1.5 font-semibold">
                          <Calendar className="h-3.5 w-3.5 text-slate-500" />
                          {req.tripId?.title || '—'}
                        </span>
                        {destName && (
                          <span className="flex items-center gap-1 text-slate-400">
                            <Compass className="h-3.5 w-3.5 text-teal-500/70" />
                            {destName}
                          </span>
                        )}
                        {req.tripId?.startDate && (
                          <span className="text-xs text-slate-500">
                            {new Date(req.tripId.startDate).toLocaleDateString()} –{' '}
                            {new Date(req.tripId.endDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      {/* Row 3: message */}
                      {req.message && (
                        <p className="text-sm text-slate-400 bg-slate-950/40 rounded-lg px-3 py-2 border border-white/5 italic">
                          &ldquo;{req.message}&rdquo;
                        </p>
                      )}
                    </div>

                    {/* Right: status + date */}
                    <div className="flex lg:flex-col items-center lg:items-end gap-3 lg:gap-2 flex-shrink-0">
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${cfg.className}`}>
                        <StatusIcon className="h-3.5 w-3.5" />
                        {cfg.label}
                      </span>
                      <span className="text-xs text-slate-500">
                        {new Date(req.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Summary */}
        {filtered.length > 0 && (
          <p className="mt-6 text-center text-xs text-slate-600">
            Showing {filtered.length} of {requests.length} requests
          </p>
        )}
      </div>
    </div>
  );
}
