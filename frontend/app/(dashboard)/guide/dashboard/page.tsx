'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import Link from 'next/link';
import { 
  Briefcase, 
  Map, 
  MapPin, 
  Compass, 
  MessageSquare, 
  Plus, 
  User, 
  ArrowRight, 
  Calendar,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';

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
  };
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export default function GuideDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, initialize } = useAuthStore();
  
  const [stats, setStats] = useState({
    hiddenPlaces: 0,
    experiences: 0,
    destinations: 0,
    requests: 0,
  });
  
  const [recentRequests, setRecentRequests] = useState<GuideRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileComplete, setProfileComplete] = useState(true);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/guide/dashboard');
      return;
    }
    
    if (user && user.role !== 'guide') {
      router.push('/become-guide');
      return;
    }

    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const [hiddenPlacesRes, experiencesRes, destinationsRes, requestsRes, profileRes] = await Promise.all([
          api.get('/hidden-places/guide/me'),
          api.get('/experiences/guide/me'),
          api.get('/destinations/guide/me'),
          api.get('/guide-requests/guide/me'),
          api.get(`/guides/${user?._id}`).catch(() => null),
        ]);

        setStats({
          hiddenPlaces: hiddenPlacesRes.data.count || 0,
          experiences: experiencesRes.data.count || 0,
          destinations: destinationsRes.data.count || 0,
          requests: requestsRes.data.count || 0,
        });

        // Check if guide has filled in their profile
        if (profileRes?.data?.guide) {
          const p = profileRes.data.guide;
          setProfileComplete(!!(p.location && p.bio));
        } else {
          setProfileComplete(false);
        }

        // Sort requests by newest first and take top 5
        const allRequests = requestsRes.data.requests || [];
        const sorted = [...allRequests].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setRecentRequests(sorted.slice(0, 5));
        
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch dashboard data.');
      } finally {
        setIsLoading(false);
      }
    };

    if (user && user.role === 'guide') {
      fetchDashboardData();
    }
  }, [isAuthenticated, user, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-slate-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center bg-slate-950 px-4">
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-6 text-center max-w-md">
          <h2 className="text-xl font-bold text-rose-300">Dashboard Error</h2>
          <p className="mt-2 text-slate-400">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 rounded-lg bg-slate-900 border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 py-10 px-4 sm:px-6 lg:px-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/15 via-slate-950 to-slate-950">
      <div className="mx-auto max-w-7xl">
        
        {/* Profile Incomplete Banner */}
        {!profileComplete && (
          <div className="mb-6 flex items-start gap-4 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
            <div className="flex-shrink-0 rounded-lg bg-amber-500/10 p-2 text-amber-400">
              <User className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-amber-300">Complete your guide profile to get started</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Travelers can&apos;t find or request you until you fill in your bio and location.
              </p>
            </div>
            <Link
              href="/guide/profile"
              className="flex-shrink-0 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-slate-950 hover:bg-amber-400 transition-colors"
            >
              Complete Now
            </Link>
          </div>
        )}

        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Guide Workspace
            </h1>
            <p className="mt-1.5 text-slate-400">
              Welcome back, <span className="text-teal-400 font-semibold">{user?.name}</span>. Manage your public profile, listings, and traveler requests.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/guide/profile"
              id="btn-edit-profile"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
            >
              <User className="h-4 w-4 text-slate-400" />
              <span>Edit Profile</span>
            </Link>
            <Link
              href="/guide/requests"
              id="btn-view-requests"
              className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-500 transition-colors"
            >
              <MessageSquare className="h-4 w-4" />
              <span>Manage Requests</span>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-10">
          {[
            { label: 'My Hidden Places', value: stats.hiddenPlaces, icon: Map, color: 'from-teal-400/20 to-teal-600/5', text: 'text-teal-400' },
            { label: 'My Experiences', value: stats.experiences, icon: Compass, color: 'from-indigo-400/20 to-indigo-600/5', text: 'text-indigo-400' },
            { label: 'Destinations', value: stats.destinations, icon: MapPin, color: 'from-purple-400/20 to-purple-600/5', text: 'text-purple-400' },
            { label: 'Total Requests', value: stats.requests, icon: MessageSquare, color: 'from-pink-400/20 to-pink-600/5', text: 'text-pink-400' },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className={`relative rounded-xl border border-white/10 bg-slate-900/40 p-6 backdrop-blur-sm overflow-hidden hover:border-white/20 transition-all`}>
                <div className={`absolute -right-4 -bottom-4 opacity-5 ${stat.text}`}>
                  <Icon className="h-24 w-24" />
                </div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-slate-400">{stat.label}</span>
                  <div className={`rounded-lg p-2 bg-slate-950/60 ${stat.text}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-white">{stat.value}</div>
              </div>
            );
          })}
        </div>

        {/* Actions & Recent Requests Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Quick CTA Panel */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-lg font-bold text-white mb-4">Quick Add Actions</h2>
            
            <Link
              href="/guide/hidden-places/create"
              id="cta-add-hidden"
              className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-slate-900/30 hover:bg-slate-900/60 hover:border-teal-500/30 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-lg p-2.5 bg-teal-500/10 text-teal-400">
                  <Plus className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-200 text-sm group-hover:text-teal-400 transition-colors">Add Hidden Place</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Share offbeat viewpoint spots</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-600 group-hover:text-teal-400 transition-colors group-hover:translate-x-1" />
            </Link>

            <Link
              href="/guide/experiences/create"
              id="cta-add-experience"
              className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-slate-900/30 hover:bg-slate-900/60 hover:border-indigo-500/30 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-lg p-2.5 bg-indigo-500/10 text-indigo-400">
                  <Plus className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-200 text-sm group-hover:text-indigo-400 transition-colors">Add Experience</h3>
                  <p className="text-xs text-slate-500 mt-0.5">List a guided tour or trek trail</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-600 group-hover:text-indigo-400 transition-colors group-hover:translate-x-1" />
            </Link>

            <Link
              href="/guide/destinations/create"
              id="cta-add-destination"
              className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-slate-900/30 hover:bg-slate-900/60 hover:border-purple-500/30 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-lg p-2.5 bg-purple-500/10 text-purple-400">
                  <Plus className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-200 text-sm group-hover:text-purple-400 transition-colors">Contribute Destination</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Submit new location for approval</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-600 group-hover:text-purple-400 transition-colors group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Recent Requests Table */}
          <div className="lg:col-span-2 rounded-xl border border-white/10 bg-slate-900/40 p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white">Recent Requests</h2>
              <Link 
                href="/guide/requests" 
                className="text-xs font-semibold text-teal-400 hover:text-teal-300 flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {recentRequests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <MessageSquare className="h-10 w-10 text-slate-700 mb-3" />
                <p className="text-slate-400 text-sm font-medium">No booking requests received yet</p>
                <p className="text-slate-600 text-xs mt-1">Travelers will request you from your public profile</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-400 text-xs uppercase font-semibold">
                      <th className="pb-3">Traveler</th>
                      <th className="pb-3">Trip Title</th>
                      <th className="pb-3">Message</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3 text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {recentRequests.map((req) => (
                      <tr key={req._id} className="text-slate-300 hover:bg-white/5 transition-colors">
                        <td className="py-3 font-semibold text-slate-200">{req.travelerId?.name}</td>
                        <td className="py-3">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-slate-500" />
                            {req.tripId?.title}
                          </span>
                        </td>
                        <td className="py-3 max-w-[200px] truncate text-slate-400">{req.message}</td>
                        <td className="py-3">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
                            req.status === 'accepted'
                              ? 'bg-teal-500/10 text-teal-300'
                              : req.status === 'rejected'
                              ? 'bg-rose-500/10 text-rose-300'
                              : 'bg-amber-500/10 text-amber-300'
                          }`}>
                            {req.status === 'accepted' ? (
                              <CheckCircle className="h-3 w-3" />
                            ) : req.status === 'rejected' ? (
                              <XCircle className="h-3 w-3" />
                            ) : (
                              <Clock className="h-3 w-3" />
                            )}
                            {req.status}
                          </span>
                        </td>
                        <td className="py-3 text-right text-xs text-slate-500">
                          {new Date(req.createdAt).toLocaleDateString()}
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
  );
}
