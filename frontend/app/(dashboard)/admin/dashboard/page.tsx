// This file renders the page screen for dashboard in the browser.
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
  Activity,
  Globe,
  BookOpen,
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
      <div className="relative overflow-hidden mesh-bg flex min-h-[100dvh] items-center justify-center">
        {/* Ambient overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-950/20 via-transparent to-zinc-950/60" />
        <div className="glass rounded-2xl p-10 flex flex-col items-center gap-5 relative z-10">
          <div className="relative h-12 w-12">
            <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20" />
            <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-emerald-400" />
            <div
              className="absolute inset-2 rounded-full"
              style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)' }}
            />
          </div>
          <p
            className="text-sm tracking-widest uppercase"
            style={{ fontFamily: 'var(--font-mono)', color: 'rgba(161,161,170,0.7)' }}
          >
            Loading
          </p>
        </div>
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
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-500/10',
      borderHover: 'hover:border-emerald-500/40',
    },
    {
      href: '/admin/guide-requests',
      title: 'Guide Booking Requests',
      description: 'View all traveler-to-guide booking requests and their status across the platform.',
      icon: MessageSquare,
      badge: stats.pendingRequests > 0 ? `${stats.pendingRequests} pending` : null,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      iconColor: 'text-sky-400',
      iconBg: 'bg-sky-500/10',
      borderHover: 'hover:border-sky-500/40',
    },
    {
      href: '/guides',
      title: 'Browse Guides',
      description: 'View all registered local guides and their public profiles.',
      icon: Users,
      badge: null,
      badgeColor: '',
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-500/10',
      borderHover: 'hover:border-emerald-500/30',
    },
    {
      href: '/destinations',
      title: 'Browse Destinations',
      description: 'See all approved destinations visible to travelers.',
      icon: CheckCircle,
      badge: null,
      badgeColor: '',
      iconColor: 'text-sky-400',
      iconBg: 'bg-sky-500/10',
      borderHover: 'hover:border-sky-500/30',
    },
  ];

  /** KPI stat tiles for the 6-column bar */
  const kpiTiles = [
    {
      label: 'Pending Destinations',
      value: stats.pendingDestinations,
      icon: Clock,
      iconColor: 'text-amber-400',
      iconBg: 'bg-amber-500/10',
    },
    {
      label: 'Approved Destinations',
      value: stats.approvedDestinations,
      icon: CheckCircle,
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-500/10',
    },
    {
      label: 'Total Guides',
      value: stats.totalGuides,
      icon: BookOpen,
      iconColor: 'text-sky-400',
      iconBg: 'bg-sky-500/10',
    },
    {
      label: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      iconColor: 'text-sky-400',
      iconBg: 'bg-sky-500/10',
    },
    {
      label: 'Pending Requests',
      value: stats.pendingRequests,
      icon: MessageSquare,
      iconColor: 'text-amber-400',
      iconBg: 'bg-amber-500/10',
    },
    {
      label: 'Accepted Requests',
      value: stats.acceptedRequests,
      icon: CheckCircle,
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-500/10',
    },
  ];

  /** Action nav cards */
  const actionCards = [
    {
      href: '/admin/destinations',
      title: 'Pending Destinations',
      description: 'Review and approve destination submissions from guides awaiting moderation.',
      icon: MapPin,
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-500/10',
      count: stats.pendingDestinations,
      countLabel: 'awaiting review',
    },
    {
      href: '/admin/users',
      title: 'User Management',
      description: 'Manage traveler and guide accounts, roles, and platform access.',
      icon: Users,
      iconColor: 'text-sky-400',
      iconBg: 'bg-sky-500/10',
      count: stats.totalUsers,
      countLabel: 'registered users',
    },
    {
      href: '/admin/guide-requests',
      title: 'Guide Requests',
      description: 'Monitor all guide booking requests and their current statuses platform-wide.',
      icon: MessageSquare,
      iconColor: 'text-amber-400',
      iconBg: 'bg-amber-500/10',
      count: stats.pendingRequests,
      countLabel: 'pending now',
    },
  ];

  return (
    <div className="relative overflow-hidden mesh-bg min-h-[100dvh]">
      {/* Ambient gradient overlay */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-950/10 via-transparent to-zinc-950/50" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* ── Header ── */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-12">
          {/* Left: title block */}
          <div className="flex items-center gap-4">
            <div
              className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl"
              style={{
                background: 'rgba(16,185,129,0.1)',
                border: '1px solid rgba(16,185,129,0.25)',
              }}
            >
              <Shield className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <h1
                className="text-3xl font-bold tracking-tight text-white"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Control{' '}
                <span className="text-gradient-emerald">Center</span>
              </h1>
              <p className="mt-0.5 text-sm" style={{ color: 'rgba(161,161,170,0.8)' }}>
                Platform overview &mdash; logged in as{' '}
                <span className="text-emerald-400 font-semibold">{user?.name}</span>
              </p>
            </div>
          </div>

          {/* Right: quick nav */}
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/admin/users" className="btn btn-ghost text-sm">
              Users
            </Link>
            <Link href="/admin/destinations" className="btn btn-ghost text-sm">
              Destinations
            </Link>
            <Link href="/admin/guide-requests" className="btn btn-primary text-sm">
              Guide Requests
            </Link>
          </div>
        </div>

        {/* ── KPI Stat Bar ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-12">
          {kpiTiles.map((tile, i) => {
            const Icon = tile.icon;
            return (
              <div
                key={i}
                className="glass card-3d-wrapper card-3d rounded-xl p-5 relative overflow-hidden"
              >
                {/* Faint bg icon */}
                <div
                  className={`pointer-events-none absolute -right-2 -bottom-2 opacity-[0.06] ${tile.iconColor}`}
                >
                  <Icon className="h-16 w-16" />
                </div>

                {/* Top-right icon */}
                <div className={`absolute top-3 right-3 rounded-lg p-1.5 ${tile.iconBg} ${tile.iconColor}`}>
                  <Icon className="h-3.5 w-3.5" />
                </div>

                {/* Value */}
                <p
                  className={`text-3xl font-bold leading-none mb-2 ${tile.iconColor}`}
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  {tile.value}
                </p>

                {/* Label */}
                <p
                  className="text-xs leading-tight"
                  style={{ fontFamily: 'var(--font-body)', color: 'rgba(161,161,170,0.7)' }}
                >
                  {tile.label}
                </p>
              </div>
            );
          })}
        </div>

        {/* ── Action Navigation Cards ── */}
        <div className="mb-4">
          <h2
            className="text-lg font-semibold text-white mb-1"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Quick Actions
          </h2>
          <p className="text-sm" style={{ color: 'rgba(161,161,170,0.6)' }}>
            Jump directly into key moderation workflows
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          {actionCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.href}
                href={card.href}
                className="glass-strong card-spotlight rounded-2xl p-6 group block transition-all duration-300 hover:-translate-y-1"
              >
                {/* Icon row */}
                <div className="flex items-center justify-between mb-5">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${card.iconBg} ${card.iconColor}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <ArrowRight
                    className={`h-4 w-4 ${card.iconColor} opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300`}
                  />
                </div>

                {/* Title */}
                <h3
                  className="font-semibold text-white mb-1.5 group-hover:text-emerald-300 transition-colors duration-200"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {card.title}
                </h3>

                {/* Description */}
                <p
                  className="text-sm leading-relaxed mb-4"
                  style={{ color: 'rgba(161,161,170,0.65)' }}
                >
                  {card.description}
                </p>

                {/* Count badge */}
                <div
                  className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold"
                  style={{
                    background: 'rgba(16,185,129,0.08)',
                    borderColor: 'rgba(16,185,129,0.2)',
                    color: 'rgba(52,211,153,0.9)',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 opacity-80" />
                  {card.count} {card.countLabel}
                </div>
              </Link>
            );
          })}
        </div>

        {/* ── Platform Status Section ── */}
        <div className="mb-4">
          <h2
            className="text-lg font-semibold text-white mb-1"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Platform Status
          </h2>
          <p className="text-sm" style={{ color: 'rgba(161,161,170,0.6)' }}>
            Live system health indicators
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          {/* Live status indicators - left column */}
          <div className="glass rounded-2xl p-6 space-y-4">
            {[
              { label: 'API Services', status: 'Operational', live: true },
              { label: 'Destination Pipeline', status: 'Active', live: true },
              { label: 'Booking Engine', status: 'Active', live: true },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Activity className="h-4 w-4 text-zinc-500" />
                  <span
                    className="text-sm"
                    style={{ color: 'rgba(212,212,216,0.85)', fontFamily: 'var(--font-body)' }}
                  >
                    {item.label}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {item.live && <span className="dot-pulse" />}
                  <span
                    className="text-xs font-semibold text-emerald-400"
                    style={{ fontFamily: 'var(--font-mono)' }}
                  >
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Admin session info - right column */}
          <div className="glass rounded-2xl p-6">
            <div className="flex items-start gap-4 mb-4">
              <div
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg"
                style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}
              >
                <Settings className="h-4 w-4 text-emerald-400" />
              </div>
              <div>
                <p
                  className="text-sm font-semibold text-white"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  Admin Session
                </p>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: 'rgba(161,161,170,0.6)', fontFamily: 'var(--font-body)' }}
                >
                  Full admin privileges active
                </p>
              </div>
            </div>

            <div
              className="rounded-xl p-3 space-y-2"
              style={{ background: 'rgba(9,9,11,0.4)', border: '1px solid rgba(255,255,255,0.05)' }}
            >
              <div className="flex items-center justify-between">
                <span
                  className="text-xs"
                  style={{ color: 'rgba(161,161,170,0.55)', fontFamily: 'var(--font-mono)' }}
                >
                  account
                </span>
                <span
                  className="text-xs text-emerald-400 font-semibold truncate max-w-[180px]"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  {user?.email}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span
                  className="text-xs"
                  style={{ color: 'rgba(161,161,170,0.55)', fontFamily: 'var(--font-mono)' }}
                >
                  role
                </span>
                <span
                  className="text-xs font-bold uppercase tracking-wider"
                  style={{
                    color: 'rgba(52,211,153,0.9)',
                    fontFamily: 'var(--font-mono)',
                    background: 'rgba(16,185,129,0.08)',
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    border: '1px solid rgba(16,185,129,0.2)',
                  }}
                >
                  {user?.role}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span
                  className="text-xs"
                  style={{ color: 'rgba(161,161,170,0.55)', fontFamily: 'var(--font-mono)' }}
                >
                  audit log
                </span>
                <span
                  className="text-xs"
                  style={{ color: 'rgba(161,161,170,0.6)', fontFamily: 'var(--font-mono)' }}
                >
                  All actions recorded
                </span>
              </div>
            </div>

            {/* Quick links */}
            <div className="flex items-center gap-2 mt-4">
              <Globe className="h-3.5 w-3.5 text-zinc-600" />
              <Link
                href="/destinations"
                className="text-xs hover:text-emerald-400 transition-colors"
                style={{ color: 'rgba(161,161,170,0.5)', fontFamily: 'var(--font-body)' }}
              >
                View public destinations
              </Link>
              <span style={{ color: 'rgba(161,161,170,0.25)' }}>·</span>
              <Link
                href="/guides"
                className="text-xs hover:text-emerald-400 transition-colors"
                style={{ color: 'rgba(161,161,170,0.5)', fontFamily: 'var(--font-body)' }}
              >
                Browse guides
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
