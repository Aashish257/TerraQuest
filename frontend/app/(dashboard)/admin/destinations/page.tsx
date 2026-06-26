// This file renders the page screen for destinations in the browser.
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import { 
  ShieldAlert, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Activity, 
  Check, 
  X, 
  Compass, 
  Clock,
  ArrowRight,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

interface Destination {
  _id: string;
  name: string;
  country: string;
  state: string;
  description: string;
  bestTimeToVisit: string;
  budgetRange: string;
  activities: string[];
  status: 'pending' | 'approved' | 'rejected';
  submittedBy?: {
    name: string;
    email: string;
  };
}

export default function AdminDestinationsPage() {
  const router = useRouter();
  const { user, isAuthenticated, initialize } = useAuthStore();
  
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const fetchPendingDestinations = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/destinations/admin/pending');
      if (res.data.success) {
        setDestinations(res.data.destinations || []);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch pending destinations.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/admin/destinations');
      return;
    }

    if (user && user.role !== 'admin') {
      router.push('/');
      return;
    }

    if (user && user.role === 'admin') {
      fetchPendingDestinations();
    }
  }, [isAuthenticated, user, router]);

  const handleAction = async (destinationId: string, status: 'approved' | 'rejected') => {
    setError(null);
    setSuccessMsg(null);
    setActioningId(destinationId);
    try {
      const res = await api.patch(`/destinations/${destinationId}/status`, { status });
      if (res.data.success) {
        setSuccessMsg(`Destination successfully ${status === 'approved' ? 'approved' : 'rejected'}!`);
        // Remove from local list state
        setDestinations((prev) => prev.filter((d) => d._id !== destinationId));
      } else {
        setError(res.data.message || 'Failed to update destination status.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred during processing.');
    } finally {
      setActioningId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-slate-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent"></div>
      </div>
    );
  }

  if (user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/15 via-slate-950 to-slate-950">
      <div className="mx-auto max-w-6xl">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-10 pb-6 border-b border-white/10">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <ShieldAlert className="h-8 w-8 text-teal-400" />
              <span>Destination Moderation Portal</span>
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Approve or reject destination contributions submitted by platform Local Guides.
            </p>
          </div>
          <span className="rounded-full bg-teal-500/10 border border-teal-500/30 px-3 py-1 text-xs font-semibold text-teal-400">
            Admin View
          </span>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-300 text-sm font-semibold flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            {successMsg}
          </div>
        )}

        {/* Content list */}
        {destinations.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-slate-900/20 p-16 text-center backdrop-blur-xl">
            <Compass className="h-14 w-14 text-slate-700 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-200">No Pending Submissions</h3>
            <p className="text-slate-500 text-sm mt-1 max-w-md mx-auto">
              Everything is clean! All submitted guide destinations have been moderated.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {destinations.map((dest) => (
              <div 
                key={dest._id}
                className="rounded-2xl border border-white/10 bg-slate-900/40 p-6 flex flex-col justify-between shadow-xl backdrop-blur-md"
              >
                <div>
                  {/* Title & Location details */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white tracking-tight">{dest.name}</h3>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-1 font-medium">
                        <MapPin className="h-3 w-3 text-slate-500" />
                        {dest.state ? `${dest.state}, ` : ''}{dest.country}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase bg-amber-500/10 border border-amber-500/20 text-amber-400">
                      <Clock className="h-2.5 w-2.5" />
                      Pending Approval
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-slate-300 line-clamp-3 mb-4 bg-slate-950/40 rounded-xl p-3 border border-white/5">
                    {dest.description}
                  </p>

                  {/* Meta Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
                    <div className="bg-slate-950/60 rounded-lg p-2.5 border border-white/5">
                      <span className="block text-slate-500 font-semibold mb-0.5">Best Time</span>
                      <span className="text-slate-200 font-medium flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-slate-500" />
                        {dest.bestTimeToVisit || 'Not listed'}
                      </span>
                    </div>
                    <div className="bg-slate-950/60 rounded-lg p-2.5 border border-white/5">
                      <span className="block text-slate-500 font-semibold mb-0.5">Budget Range</span>
                      <span className="text-slate-200 font-medium flex items-center gap-1">
                        <DollarSign className="h-3 w-3 text-slate-500" />
                        {dest.budgetRange || 'Not listed'}
                      </span>
                    </div>
                  </div>

                  {/* Activities */}
                  {dest.activities && dest.activities.length > 0 && (
                    <div className="mb-6">
                      <span className="block text-xs text-slate-500 font-semibold mb-2">Key Activities</span>
                      <div className="flex flex-wrap gap-1.5">
                        {dest.activities.map((act, i) => (
                          <span 
                            key={i} 
                            className="inline-flex items-center gap-1 rounded-md bg-indigo-500/10 px-2.5 py-1 text-[10px] font-medium text-indigo-300 border border-indigo-500/10"
                          >
                            <Activity className="h-2.5 w-2.5 text-indigo-400" />
                            {act}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Moderation Actions */}
                <div className="border-t border-white/5 pt-4 mt-auto flex gap-3">
                  <button
                    onClick={() => handleAction(dest._id, 'rejected')}
                    id={`reject-btn-${dest._id}`}
                    disabled={actioningId !== null}
                    className="w-1/2 flex items-center justify-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-xs font-bold text-rose-400 hover:bg-slate-800 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                  >
                    <X className="h-4 w-4" />
                    <span>Reject Contribution</span>
                  </button>
                  <button
                    onClick={() => handleAction(dest._id, 'approved')}
                    id={`approve-btn-${dest._id}`}
                    disabled={actioningId !== null}
                    className="w-1/2 flex items-center justify-center gap-1.5 rounded-lg bg-teal-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-teal-500 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md shadow-teal-600/15 disabled:opacity-50"
                  >
                    <Check className="h-4 w-4" />
                    <span>Approve Contribution</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
