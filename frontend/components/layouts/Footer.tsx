'use client';

/**
 * Footer.tsx — Rich 3-Column Footer
 *
 * Design Taste Frontend: rich footer, not minimal.
 * Antigravity: glassmorphic top border with gradient fade.
 * Hidden on /guide/*, /admin/*, /login, /register.
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MapPin } from 'lucide-react';

// Inline SVG social icons (avoids lucide-react version dependency)
const TwitterIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);

const GithubIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
);

const navGroups = [
  {
    label: 'Explore',
    links: [
      { href: '/destinations', label: 'Destinations' },
      { href: '/guides',       label: 'Local Guides' },
      { href: '/ai-planner',   label: 'AI Planner'   },
      { href: '/trips',        label: 'My Trips'     },
    ],
  },
  {
    label: 'Platform',
    links: [
      { href: '/become-guide', label: 'Become a Guide' },
      { href: '/register',     label: 'Create Account' },
      { href: '/login',        label: 'Sign In'        },
    ],
  },
];

export default function Footer() {
  const pathname = usePathname();

  if (
    pathname.startsWith('/guide/') ||
    pathname.startsWith('/admin/') ||
    pathname === '/login' ||
    pathname === '/register'
  ) {
    return null;
  }

  return (
    <footer
      className="relative w-full border-t border-white/[0.06] bg-[#09090b]"
      style={{ fontFamily: 'var(--font-outfit, Outfit)' }}
    >
      {/* Gradient top border line */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(16,185,129,0.4) 40%, rgba(16,185,129,0.4) 60%, transparent)',
        }}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* ── Brand column ── */}
          <div className="md:col-span-2 flex flex-col gap-5">
            <Link href="/" className="flex items-center gap-2.5 group w-fit">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center
                           bg-emerald-500/10 border border-emerald-500/20
                           group-hover:bg-emerald-500/20 transition-all duration-300"
              >
                <MapPin className="h-4.5 w-4.5 text-emerald-400" />
              </div>
              <span
                className="text-xl font-bold tracking-tight text-zinc-100"
                style={{ letterSpacing: '-0.03em' }}
              >
                TerraQuest
              </span>
            </Link>

            <p className="text-sm text-zinc-500 leading-relaxed max-w-xs"
               style={{ fontFamily: 'var(--font-dm-sans, DM Sans)' }}>
              AI-powered travel intelligence for modern explorers.
              Discover India's most extraordinary destinations with verified local guides.
            </p>

            {/* Social links */}
            <div className="flex items-center gap-2">
              {[
                { Icon: TwitterIcon,   href: '#', label: 'Twitter'   },
                { Icon: InstagramIcon, href: '#', label: 'Instagram' },
                { Icon: GithubIcon,    href: '#', label: 'GitHub'    },
              ].map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="h-8 w-8 rounded-lg border border-white/10 flex items-center justify-center
                             text-zinc-500 hover:text-emerald-400 hover:border-emerald-500/30
                             hover:bg-emerald-500/5 transition-all duration-200"
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          {/* ── Nav link columns ── */}
          {navGroups.map((group) => (
            <div key={group.label} className="flex flex-col gap-4">
              <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">
                {group.label}
              </p>
              <ul className="flex flex-col gap-2.5">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-zinc-400 hover:text-emerald-400 transition-colors duration-200
                                 relative group flex items-center gap-1"
                      style={{ fontFamily: 'var(--font-dm-sans, DM Sans)' }}
                    >
                      <span>{link.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ── Bottom bar ── */}
        <div className="mt-12 pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-zinc-600"
             style={{ fontFamily: 'var(--font-dm-sans, DM Sans)' }}>
            &copy; {new Date().getFullYear()} TerraQuest. All rights reserved.
          </p>
          <div className="flex items-center gap-1.5">
            <div className="dot-pulse" />
            <span className="text-[11px] text-zinc-600 font-mono">Systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
