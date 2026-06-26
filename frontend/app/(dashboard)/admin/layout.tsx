// This file sets up the layout framework for all screens in the admin section.
'use client';

/**
 * Admin Panel Layout
 * Wraps all /admin/* pages with:
 *  - A sticky admin top-bar (TerraQuest logo + Admin badge + user name + logout)
 *  - A sidebar with admin-specific navigation
 * The global Header/Footer are hidden on these routes via pathname detection.
 */

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { LayoutDashboard, MapPin, Shield, MessageSquare, LogOut, Users } from 'lucide-react';

const ADMIN_NAV = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/destinations', label: 'Destinations', icon: MapPin },
  { href: '/admin/guide-requests', label: 'Guide Requests', icon: MessageSquare },
  { href: '/admin/users', label: 'Users', icon: Users },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-950">

      {/* ─── Admin Top Bar ────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 w-full border-b border-rose-500/20 bg-slate-950/90 backdrop-blur-md">
        <div className="flex h-14 items-center justify-between px-4 sm:px-6">
          
          {/* Logo + Admin badge */}
          <Link href="/admin/dashboard" className="flex items-center gap-2.5">
            <span className="text-lg font-extrabold bg-gradient-to-r from-teal-400 to-indigo-500 bg-clip-text text-transparent">
              TerraQuest
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-rose-500/10 border border-rose-500/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-rose-400">
              <Shield className="h-2.5 w-2.5" />
              Admin Panel
            </span>
          </Link>

          {/* User + Logout */}
          {user && (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 text-sm text-slate-300">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-rose-400 to-pink-600 text-white text-xs font-bold uppercase ring-2 ring-white/10">
                  {user.name.charAt(0)}
                </div>
                <span className="font-medium">{user.name.split(' ')[0]}</span>
                <span className="text-xs text-rose-400 font-semibold">(admin)</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-rose-400 transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ─── Body: Sidebar + Main ─────────────────────────────────────────── */}
      <div className="flex flex-1">

        {/* Sidebar (desktop) */}
        <aside className="hidden md:flex w-60 flex-col flex-shrink-0 border-r border-white/10 bg-slate-900/60 sticky top-14 h-[calc(100vh-3.5rem)] pt-6 pb-4 px-3">
          <div className="flex items-center gap-2 px-3 mb-4">
            <Shield className="h-3.5 w-3.5 text-rose-400" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-rose-400">
              Control Panel
            </p>
          </div>
          <nav className="flex flex-col gap-1 flex-1">
            {ADMIN_NAV.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-rose-500/15 text-rose-400 border border-rose-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Back to site link at the bottom */}
          <div className="border-t border-white/10 pt-3 mt-3">
            <Link
              href="/destinations"
              className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all"
            >
              <span className="text-xs">↗ Back to Public Site</span>
            </Link>
          </div>
        </aside>

        {/* Mobile Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden border-t border-white/10 bg-slate-950/95 backdrop-blur px-1 py-1.5">
          {ADMIN_NAV.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-1 flex-col items-center gap-0.5 py-1.5 text-[10px] font-medium transition-colors ${
                  isActive ? 'text-rose-400' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="truncate">{item.label.split(' ')[0]}</span>
              </Link>
            );
          })}
        </div>

        {/* Main Content */}
        <main className="flex-1 pb-20 md:pb-0 min-w-0">
          {children}
        </main>
      </div>

      {/* ─── Admin Footer ─────────────────────────────────────────────────── */}
      <footer className="hidden md:block border-t border-white/5 bg-slate-950 py-3 px-6">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <span className="text-xs text-slate-600 flex items-center gap-1">
            <Shield className="h-3 w-3 text-rose-500/50" />
            TerraQuest Admin Panel &copy; {new Date().getFullYear()} — Admin access only
          </span>
          <Link href="/destinations" className="text-xs text-slate-600 hover:text-teal-400 transition-colors">
            View Public Site ↗
          </Link>
        </div>
      </footer>
    </div>
  );
}
