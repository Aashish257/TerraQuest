'use client';

/**
 * login/page.tsx — Premium Split-Screen Login
 *
 * Skills applied:
 * - Antigravity Design Expert: glassmorphic form panel with liquid glass refraction
 * - Design Taste Frontend: split-screen (not centered), directional fill button,
 *   no emojis, proper label-above-input form pattern
 * - Scroll Experience: slide-up entrance animation on form mount
 * - Tailwind Design System: consistent design tokens, spacing, color
 */

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import {
  AlertCircle, Loader2, Eye, EyeOff, MapPin,
  ArrowLeft, Shield
} from 'lucide-react';

/* ── Zod schema ── */
const loginSchema = z.object({
  email:    z.string().email({ message: 'Enter a valid email address' }),
  password: z.string().min(1, { message: 'Password is required' }),
});
type LoginFormValues = z.infer<typeof loginSchema>;

/* ── Destination image mosaic (left panel) ── */
const MOSAIC_IMAGES = [
  {
    src: 'https://picsum.photos/seed/taj-mahal/400/400',
    alt: 'Taj Mahal at sunrise',
    span: 'col-span-2 row-span-2',
  },
  {
    src: 'https://picsum.photos/seed/goa-beach/400/300',
    alt: 'Goa beach',
    span: 'col-span-1 row-span-1',
  },
  {
    src: 'https://picsum.photos/seed/manali-peak/400/300',
    alt: 'Manali mountains',
    span: 'col-span-1 row-span-1',
  },
  {
    src: 'https://picsum.photos/seed/ladakh-lake/400/600',
    alt: 'Ladakh landscape',
    span: 'col-span-1 row-span-2',
  },
  {
    src: 'https://picsum.photos/seed/jaipur-palace/400/300',
    alt: 'Jaipur palace',
    span: 'col-span-1 row-span-1',
  },
  {
    src: 'https://picsum.photos/seed/udaipur-lake/400/300',
    alt: 'Udaipur lake',
    span: 'col-span-1 row-span-1',
  },
];

function LoginForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const loginStore   = useAuthStore((s) => s.login);

  const [errorMsg,      setErrorMsg]      = useState<string | null>(null);
  const [isLoading,     setIsLoading]     = useState(false);
  const [showPassword,  setShowPassword]  = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const response       = await api.post('/auth/login', data);
      const { token, user } = response.data;
      loginStore(user, token);
      const redirect = searchParams.get('redirect');
      if (redirect)                  router.push(redirect);
      else if (user.role === 'guide') router.push('/guide/dashboard');
      else if (user.role === 'admin') router.push('/admin/dashboard');
      else                            router.push('/destinations');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message ?? 'Login failed. Check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-[100dvh] flex bg-[#09090b]"
      style={{ fontFamily: 'var(--font-dm-sans, DM Sans)' }}
    >

      {/* ── Left: Image mosaic panel ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Mosaic grid */}
        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-1.5 p-1.5">
          {MOSAIC_IMAGES.map((img, i) => (
            <div key={i} className={`${img.span} overflow-hidden rounded-xl`}>
              <img
                src={img.src}
                alt={img.alt}
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-[1.04]"
                loading="lazy"
              />
            </div>
          ))}
        </div>

        {/* Dark overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#09090b]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090b]/40 to-transparent" />

        {/* Brand badge overlaid */}
        <div className="absolute bottom-10 left-10 flex flex-col gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/25
                            flex items-center justify-center">
              <MapPin className="h-4.5 w-4.5 text-emerald-400" />
            </div>
            <span
              className="text-xl font-bold text-zinc-50"
              style={{ fontFamily: 'var(--font-outfit, Outfit)', letterSpacing: '-0.03em' }}
            >
              TerraQuest
            </span>
          </div>
          <p className="text-sm text-zinc-500 max-w-[240px] leading-relaxed">
            India&apos;s most extraordinary destinations, one click away.
          </p>
        </div>
      </div>

      {/* ── Right: Form panel ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 sm:px-8 lg:px-12">

        {/* Back to home */}
        <div className="w-full max-w-[420px] mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-zinc-600
                       hover:text-zinc-300 transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        </div>

        {/* Mobile brand */}
        <div className="lg:hidden flex items-center gap-2.5 mb-8 w-full max-w-[420px]">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20
                          flex items-center justify-center">
            <MapPin className="h-4 w-4 text-emerald-400" />
          </div>
          <span
            className="text-lg font-bold text-zinc-100"
            style={{ fontFamily: 'var(--font-outfit, Outfit)', letterSpacing: '-0.03em' }}
          >
            TerraQuest
          </span>
        </div>

        {/* Form card — liquid glass */}
        <div
          className="w-full max-w-[420px] glass-strong rounded-2xl p-8 animate-fade-up"
        >
          {/* Heading */}
          <div className="mb-7">
            <h1
              className="text-2xl font-bold text-zinc-100 tracking-[-0.03em]"
              style={{ fontFamily: 'var(--font-outfit, Outfit)' }}
            >
              Welcome back
            </h1>
            <p className="mt-1.5 text-sm text-zinc-500">
              Sign in to continue your journey.
            </p>
          </div>

          {/* Error banner */}
          {errorMsg && (
            <div className="flex items-center gap-2.5 p-3 rounded-xl border border-rose-500/20
                            bg-rose-500/5 mb-5">
              <AlertCircle className="h-4 w-4 text-rose-400 flex-shrink-0" />
              <p className="text-xs text-rose-400 font-medium">{errorMsg}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="login-email"
                className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest"
                style={{ fontFamily: 'var(--font-mono, JetBrains Mono)' }}
              >
                Email address
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                {...register('email')}
                className={`input-field ${errors.email ? 'error' : ''}`}
              />
              {errors.email && (
                <p className="text-[11px] text-rose-400 font-semibold">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="login-password"
                  className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest"
                  style={{ fontFamily: 'var(--font-mono, JetBrains Mono)' }}
                >
                  Password
                </label>
                <a
                  href="#"
                  className="text-[11px] text-emerald-500 hover:text-emerald-400 font-semibold transition-colors"
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  {...register('password')}
                  className={`input-field pr-11 ${errors.password ? 'error' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2
                             text-zinc-600 hover:text-zinc-300 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-[11px] text-rose-400 font-semibold">{errors.password.message}</p>
              )}
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-2">
              <input
                id="login-remember"
                type="checkbox"
                className="w-4 h-4 rounded border-white/10 bg-zinc-900 text-emerald-500
                           focus:ring-emerald-500/20 focus:ring-1 cursor-pointer"
              />
              <label htmlFor="login-remember" className="text-sm text-zinc-500 cursor-pointer">
                Remember this device
              </label>
            </div>

            {/* Submit — directional fill from bottom via .btn system */}
            <button
              type="submit"
              id="login-submit"
              disabled={isLoading}
              className="btn btn-primary w-full py-3.5 text-sm mt-1
                         disabled:opacity-60 disabled:pointer-events-none"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-5 flex items-center">
            <div className="flex-grow border-t border-white/[0.06]" />
            <span className="mx-3 text-[11px] font-bold text-zinc-700 uppercase tracking-wider"
                  style={{ fontFamily: 'var(--font-mono, JetBrains Mono)' }}>
              or
            </span>
            <div className="flex-grow border-t border-white/[0.06]" />
          </div>

          {/* Sign up link */}
          <p className="text-center text-sm text-zinc-500">
            Don&apos;t have an account?{' '}
            <Link
              href="/register"
              className="text-emerald-400 font-semibold hover:text-emerald-300 transition-colors"
            >
              Create one free
            </Link>
          </p>

          {/* Admin access */}
          <div className="mt-5 pt-4 border-t border-white/[0.05] flex items-center justify-center gap-1.5">
            <Shield className="h-3 w-3 text-zinc-700" />
            <span className="text-[10px] text-zinc-700">
              Admin?{' '}
              <Link
                href="/login?redirect=/admin/dashboard"
                className="text-zinc-600 hover:text-zinc-400 underline underline-offset-2 transition-colors"
              >
                Access Admin Panel
              </Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[100dvh] items-center justify-center bg-[#09090b]">
          <div className="h-8 w-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
