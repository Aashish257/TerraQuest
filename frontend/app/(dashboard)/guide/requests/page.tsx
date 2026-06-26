// This file renders the page screen for requests in the browser.
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import { 
  MessageSquare, 
  Calendar, 
  MapPin, 
  Check, 
  X, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

interface GuideRequest {
  _id: string;
  travelerId: {
    _id: string;
    name: string;
    email: string;
  };
  tripId: {
    _id: string;
    title: string;
    startDate: string;
    endDate: string;
    budget: number;
    destinationId?: {
      name: string;
    };
  };
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export default function GuideRequestsPage() {
  const router = useRouter();
  const { user, isAuthenticated, initialize } = useAuthStore();
  
  const [requests, setRequests] = useState<GuideRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Track ongoing request status updates
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/guide-requests/guide/me');
      if (res.data.success) {
        setRequests(res.data.requests || []);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch guide requests.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/guide/requests');
      return;
    }
    
    if (user && user.role !== 'guide') {
      router.push('/become-guide');
      return;
    }

    if (user && user.role === 'guide') {
      fetchRequests();
    }
  }, [isAuthenticated, user, router]);

  const handleRespond = async (requestId: string, status: 'accepted' | 'rejected') => {
    setError(null);
    setUpdatingId(requestId);
    try {
      const res = await api.patch(`/guide-requests/${requestId}/respond`, { status });
      if (res.data.success) {
        // Update local status state immediately
        setRequests((prev) =>
          prev.map((req) =>
            req._id === requestId ? { ...req, status } : req
          )
        );
      } else {
        setError(res.data.message || 'Failed to respond to request.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred while responding.');
    } finally {
      setUpdatingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-slate-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/15 via-slate-950 to-slate-950">
      <div className="mx-auto max-w-5xl">
        
        {/* Back Link */}
        <Link 
          href="/guide/dashboard" 
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-teal-400 transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Booking & Assistance Requests
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            View and respond to traveler booking requests linking their scheduled trips. Accepting updates the trip with your guide reference.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm">
            {error}
          </div>
        )}

        {/* Requests List */}
        {requests.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-slate-900/20 p-12 text-center backdrop-blur-xl">
            <MessageSquare className="h-12 w-12 text-slate-700 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-200">No Booking Requests</h3>
            <p className="text-slate-500 text-sm mt-1 max-w-md mx-auto">
              Your inbox is currently empty. Make sure your guide profile is completely filled out and has high ratings so travelers choose you!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {requests.map((req) => (
              <div 
                key={req._id}
                className="relative rounded-2xl border border-white/10 bg-slate-900/40 p-6 shadow-xl backdrop-blur-xl hover:border-white/20 transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                  
                  {/* Info details */}
                  <div className="space-y-4 flex-grow">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-lg font-bold text-white">
                        Request from {req.travelerId?.name}
                      </h3>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        req.status === 'accepted'
                          ? 'bg-teal-500/10 text-teal-300'
                          : req.status === 'rejected'
                          ? 'bg-rose-500/10 text-rose-300'
                          : 'bg-amber-500/10 text-amber-300'
                      }`}>
                        {req.status === 'accepted' ? (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        ) : req.status === 'rejected' ? (
                          <XCircle className="h-3.5 w-3.5" />
                        ) : (
                          <Clock className="h-3.5 w-3.5" />
                        )}
                        <span className="capitalize">{req.status}</span>
                      </span>
                    </div>

                    {/* Associated Trip info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 bg-slate-950/60 rounded-xl p-4 border border-white/5 text-sm text-slate-300">
                      <div>
                        <span className="block text-xs text-slate-500 font-semibold mb-0.5">Trip Title</span>
                        <span className="font-semibold text-slate-200">{req.tripId?.title || 'Trip Details'}</span>
                      </div>
                      <div>
                        <span className="block text-xs text-slate-500 font-semibold mb-0.5">Dates</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-slate-500" />
                          {req.tripId ? `${new Date(req.tripId.startDate).toLocaleDateString()} - ${new Date(req.tripId.endDate).toLocaleDateString()}` : 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="block text-xs text-slate-500 font-semibold mb-0.5">Budget Allocation</span>
                        <span className="font-semibold text-teal-400">
                          ₹{req.tripId?.budget?.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Traveler message */}
                    <div>
                      <span className="block text-xs text-slate-500 font-semibold mb-1">Traveler Message</span>
                      <p className="text-sm text-slate-300 italic bg-white/5 rounded-lg p-3 border border-white/5">
                        &quot;{req.message}&quot;
                      </p>
                    </div>

                    <div className="text-xs text-slate-500">
                      Received on {new Date(req.createdAt).toLocaleString()}
                    </div>
                  </div>

                  {/* Actions */}
                  {req.status === 'pending' && (
                    <div className="flex flex-row md:flex-col gap-3 min-w-[140px] justify-end">
                      <button
                        onClick={() => handleRespond(req._id, 'accepted')}
                        id={`btn-accept-${req._id}`}
                        disabled={updatingId !== null}
                        className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 rounded-lg bg-teal-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-teal-500 shadow-md shadow-teal-600/10 hover:scale-[1.02] transition-all disabled:opacity-50"
                      >
                        <Check className="h-4 w-4" />
                        <span>Accept</span>
                      </button>
                      <button
                        onClick={() => handleRespond(req._id, 'rejected')}
                        id={`btn-reject-${req._id}`}
                        disabled={updatingId !== null}
                        className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-xs font-bold text-rose-400 hover:bg-slate-800 hover:scale-[1.02] transition-all disabled:opacity-50"
                      >
                        <X className="h-4 w-4" />
                        <span>Reject</span>
                      </button>
                    </div>
                  )}

                  {req.status === 'accepted' && (
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-teal-400 bg-teal-500/10 rounded-lg py-2 px-3 self-end md:self-start">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Request Accepted</span>
                    </div>
                  )}

                  {req.status === 'rejected' && (
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-400 bg-rose-500/10 rounded-lg py-2 px-3 self-end md:self-start">
                      <XCircle className="h-4 w-4" />
                      <span>Request Rejected</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
