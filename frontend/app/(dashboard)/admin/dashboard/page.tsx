'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import Link from 'next/link';
import {
  Shield,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  Users,
  ArrowRight,
  Settings,
  MessageSquare,
} from 'lucide-react';


export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, initialize } = useAuthStore();

  const [stats, setStats] = useState({
    pendingDestinations: 0,
    approvedDestinations: 0,
    totalGuides: 0,
    totalUsers: 0,
    pendingRequests: 0,
    acceptedRequests: 0,
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/admin/dashboard');
      return;
    }
    if (user && user.role !== 'admin') {
      router.push('/destinations');
      return;
    }

    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const [destinationsRes, requestsRes] = await Promise.all([
          api.get('/destinations/admin/pending'),
          api.get('/guide-requests/admin/all').catch(() => ({ data: { requests: [] } })),
        ]);
        const pending = destinationsRes.data.destinations?.length ?? 0;
        const allReqs = requestsRes.data.requests || [];
        setStats((prev) => ({
          ...prev,
          pendingDestinations: pending,
          pendingRequests: allReqs.filter((r: any) => r.status === 'pending').length,
          acceptedRequests: allReqs.filter((r: any) => r.status === 'accepted').length,
        }));
      } catch {
        // Stats are non-critical; fail silently
      } finally {
        setIsLoading(false);
      }
    };


    if (user?.role === 'admin') fetchStats();
  }, [isAuthenticated, user, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-slate-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent" />
      </div>
    );
  }

  const sections = [
    {
      href: '/admin/destinations',
      title: 'Destination Moderation',
      description: 'Review and approve guide-submitted destination contributions.',
      icon: MapPin,
      badge: stats.pendingDestinations > 0 ? `${stats.pendingDestinations} pending` : null,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      iconColor: 'text-teal-400',
      iconBg: 'bg-teal-500/10',
      borderHover: 'hover:border-teal-500/40',
    },
    {
      href: '/admin/guide-requests',
      title: 'Guide Booking Requests',
      description: 'View all traveler-to-guide booking requests and their status across the platform.',
      icon: MessageSquare,
      badge: stats.pendingRequests > 0 ? `${stats.pendingRequests} pending` : null,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      iconColor: 'text-indigo-400',
      iconBg: 'bg-indigo-500/10',
      borderHover: 'hover:border-indigo-500/40',
    },
    {
      href: '/guides',
      title: 'Browse Guides',
      description: 'View all registered local guides and their public profiles.',
      icon: Users,
      badge: null,
      badgeColor: '',
      iconColor: 'text-purple-400',
      iconBg: 'bg-purple-500/10',
      borderHover: 'hover:border-purple-500/40',
    },
    {
      href: '/destinations',
      title: 'Browse Destinations',
      description: 'See all approved destinations visible to travelers.',
      icon: CheckCircle,
      badge: null,
      badgeColor: '',
      iconColor: 'text-pink-400',
      iconBg: 'bg-pink-500/10',
      borderHover: 'hover:border-pink-500/40',
    },
  ];


  return (
    <div className="min-h-screen bg-slate-950 py-10 px-4 sm:px-6 lg:px-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/20 via-slate-950 to-slate-950">
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400 ring-1 ring-rose-500/20">
                <Shield className="h-5 w-5" />
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 px-3 py-1 text-xs font-bold text-rose-400 uppercase tracking-wide">
                <Shield className="h-3 w-3" />
                Admin Panel
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Admin Dashboard
            </h1>
            <p className="mt-1.5 text-slate-400">
              Welcome, <span className="text-rose-400 font-semibold">{user?.name}</span>. Manage platform content and moderation.
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {[
            {
              label: 'Pending Destinations',
              value: stats.pendingDestinations,
              icon: Clock,
              color: 'text-amber-400',
              bg: 'bg-amber-500/10',
            },
            {
              label: 'Pending Requests',
              value: stats.pendingRequests,
              icon: MessageSquare,
              color: 'text-indigo-400',
              bg: 'bg-indigo-500/10',
            },
            {
              label: 'Accepted Requests',
              value: stats.acceptedRequests,
              icon: CheckCircle,
              color: 'text-teal-400',
              bg: 'bg-teal-500/10',
            },
            {
              label: 'Rejected',
              value: '—',
              icon: XCircle,
              color: 'text-rose-400',
              bg: 'bg-rose-500/10',
            },
          ].map((stat, i) => {

            const Icon = stat.icon;
            return (
              <div
                key={i}
                className="relative rounded-xl border border-white/10 bg-slate-900/40 p-5 backdrop-blur-sm hover:border-white/20 transition-all overflow-hidden"
              >
                <div className={`absolute -right-3 -bottom-3 opacity-5 ${stat.color}`}>
                  <Icon className="h-20 w-20" />
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-slate-400">{stat.label}</span>
                  <div className={`rounded-lg p-1.5 ${stat.bg} ${stat.color}`}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                </div>
                <div className="text-2xl font-extrabold text-white">{stat.value}</div>
              </div>
            );
          })}
        </div>

        {/* Moderation Sections */}
        <h2 className="text-lg font-bold text-white mb-4">Moderation Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <Link
                key={section.href}
                href={section.href}
                className={`group flex items-center justify-between rounded-xl border border-white/10 bg-slate-900/40 p-5 backdrop-blur-sm ${section.borderHover} transition-all hover:bg-slate-900/60`}
              >
                <div className="flex items-start gap-4">
                  <div className={`rounded-lg p-2.5 ${section.iconBg} ${section.iconColor} flex-shrink-0 mt-0.5`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-slate-200 group-hover:text-white transition-colors">
                        {section.title}
                      </h3>
                      {section.badge && (
                        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${section.badgeColor}`}>
                          {section.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500">{section.description}</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-600 group-hover:text-slate-300 group-hover:translate-x-1 transition-all flex-shrink-0 ml-4" />
              </Link>
            );
          })}
        </div>

        {/* Info Banner */}
        <div className="rounded-xl border border-white/10 bg-slate-900/30 p-5 flex items-start gap-4">
          <div className="rounded-lg p-2 bg-slate-800 text-slate-400 flex-shrink-0">
            <Settings className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-300">Admin Access</p>
            <p className="text-xs text-slate-500 mt-0.5">
              You are logged in as <span className="text-rose-400 font-semibold">{user?.email}</span> with full admin privileges. 
              All moderation actions are logged.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
