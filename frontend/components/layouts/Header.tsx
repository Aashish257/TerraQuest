'use client';

/**
 * Header.tsx — Floating Glassmorphic Navigation
 *
 * Antigravity Design Expert: floating pill nav, scroll-aware blur,
 * animated active indicator, magnetic hover on CTA.
 * Design Taste Frontend: no centered layout, no purple gradient.
 * Hidden on /guide/*, /admin/*, /login, /register routes.
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import {
  Compass, Calendar, Sparkles, LogOut, User,
  Menu, X, MapPin
} from 'lucide-react';

export default function Header() {
  const pathname = usePathname();
  const router   = useRouter();
  const { user, isAuthenticated, logout, initialize } = useAuthStore();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled]                 = useState(false);

  useEffect(() => { initialize(); }, [initialize]);

  // Scroll-aware header: increase blur + show border after 20px
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

  if (
    pathname.startsWith('/guide/') ||
    pathname.startsWith('/admin/') ||
    pathname === '/login' ||
    pathname === '/register'
  ) {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/');
    setIsMobileMenuOpen(false);
  };

  const travelerNav = [
    { href: '/destinations', label: 'Explore',      icon: Compass  },
    { href: '/trips',        label: 'My Trips',     icon: Calendar },
    { href: '/ai-planner',   label: 'AI Planner',   icon: Sparkles },
    { href: '/guides',       label: 'Local Guides', icon: User     },
  ];

  const navLinks = isAuthenticated && user
    ? user.role === 'traveler' ? travelerNav : travelerNav.slice(0, 3)
    : travelerNav.slice(0, 3);

  return (
    <>
      <header
        className={`
          sticky top-0 z-50 w-full
          transition-all duration-500
          ${scrolled
            ? 'bg-[rgba(9,9,11,0.88)] backdrop-blur-2xl border-b border-white/[0.07] shadow-[0_1px_40px_rgba(0,0,0,0.5)]'
            : 'bg-transparent border-b border-transparent'
          }
        `}
        style={{ fontFamily: 'var(--font-outfit, Outfit)' }}
      >
        <div className="mx-auto flex max-w-7xl h-16 items-center justify-between px-4 sm:px-6 lg:px-8">

          {/* ── Logo ── */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center
                            group-hover:bg-emerald-500/25 transition-all duration-300">
              <MapPin className="h-4 w-4 text-emerald-400 group-hover:scale-110 transition-transform duration-300" />
            </div>
            <span
              className="text-lg font-bold tracking-tight text-zinc-50
                         group-hover:text-emerald-300 transition-colors duration-300"
              style={{ fontFamily: 'var(--font-outfit, Outfit)', letterSpacing: '-0.03em' }}
            >
              TerraQuest
            </span>
          </Link>

          {/* ── Desktop Nav ── */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon     = link.icon;
              const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`
                    nav-link flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium
                    transition-all duration-200
                    ${isActive
                      ? 'text-emerald-400 bg-emerald-500/10 active'
                      : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/5'
                    }
                  `}
                >
                  <Icon className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* ── Auth CTAs (Desktop) ── */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/profile"
                  className="flex items-center gap-2 group"
                >
                  <div
                    className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-zinc-900
                               ring-1 ring-white/15 group-hover:ring-emerald-500/40 transition-all duration-300"
                    style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-zinc-300 group-hover:text-zinc-100 transition-colors">
                    {user.name.split(' ')[0]}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10
                             text-xs font-semibold text-zinc-400 hover:text-rose-400
                             hover:border-rose-500/30 hover:bg-rose-500/5 transition-all duration-200"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign out</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-1.5 text-sm font-semibold text-zinc-300
                             hover:text-zinc-100 transition-colors duration-200"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="btn btn-primary text-sm px-5 py-2"
                >
                  Get started
                </Link>
              </div>
            )}
          </div>

          {/* ── Mobile Menu Toggle ── */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-zinc-400 hover:text-zinc-100
                       hover:bg-white/5 transition-all duration-200"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen
              ? <X className="h-5 w-5" />
              : <Menu className="h-5 w-5" />
            }
          </button>
        </div>
      </header>

      {/* ── Mobile Menu Overlay ── */}
      <div
        className={`
          fixed inset-0 z-40 md:hidden
          transition-all duration-400
          ${isMobileMenuOpen ? 'visible' : 'invisible'}
        `}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-[#09090b]/80 backdrop-blur-sm
                      transition-opacity duration-300
                      ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setIsMobileMenuOpen(false)}
        />

        {/* Slide-in panel */}
        <nav
          className={`
            absolute top-0 right-0 h-full w-72
            bg-[#111113] border-l border-white/[0.07]
            shadow-2xl flex flex-col pt-20 px-5 pb-8 gap-2
            transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]
            ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}
          `}
          style={{ fontFamily: 'var(--font-outfit, Outfit)' }}
        >
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 px-2">
            Navigation
          </p>

          {navLinks.map((link, i) => {
            const Icon     = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                  transition-all duration-200
                  ${isActive
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'text-zinc-300 hover:bg-white/5 hover:text-zinc-100 border border-transparent'
                  }
                `}
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span>{link.label}</span>
              </Link>
            );
          })}

          <div className="mt-auto pt-6 border-t border-white/[0.07] flex flex-col gap-2">
            {isAuthenticated && user ? (
              <>
                <Link
                  href="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm
                             text-zinc-300 hover:bg-white/5 transition-all"
                >
                  <div
                    className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-zinc-900 shrink-0"
                    style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-zinc-100">{user.name}</p>
                    <p className="text-[11px] text-zinc-500 capitalize">{user.role}</p>
                  </div>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl
                             border border-rose-500/20 text-rose-400 text-sm font-semibold
                             hover:bg-rose-500/10 transition-all"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center py-2.5 rounded-xl border border-white/10
                             text-sm font-semibold text-zinc-300 hover:bg-white/5 transition-all"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="btn btn-primary w-full"
                >
                  Get started
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </>
  );
}
