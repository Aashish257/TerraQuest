'use client';

/**
 * register/page.tsx — Premium Register Page
 *
 * Skills applied:
 * - Antigravity Design Expert: liquid glass form card, floating orb background
 * - Design Taste Frontend: two-panel layout, role selector pills (not generic radio),
 *   full form state handling
 * - Scroll Experience: slide-up entrance animation
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
  AlertCircle, Loader2, Eye, EyeOff,
  MapPin, ArrowLeft, Compass, Award, Shield
} from 'lucide-react';

const registerSchema = z.object({
  name:     z.string().min(2, 'Name must be at least 2 characters').max(100),
  email:    z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role:     z.enum(['traveler', 'guide']),
});
type RegisterFormValues = z.infer<typeof registerSchema>;

function RegisterForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const loginStore   = useAuthStore((s) => s.login);

  const [errorMsg,     setErrorMsg]     = useState<string | null>(null);
  const [isLoading,    setIsLoading]    = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, setValue, watch, formState: { errors } } =
    useForm<RegisterFormValues>({
      resolver: zodResolver(registerSchema),
      defaultValues: { name: '', email: '', password: '', role: 'traveler' },
    });

  const selectedRole = watch('role');

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const response       = await api.post('/auth/register', data);
      const { token, user } = response.data;
      loginStore(user, token);
      const redirect = searchParams.get('redirect');
      if (redirect)                  router.push(redirect);
      else if (user.role === 'guide') router.push('/become-guide');
      else if (user.role === 'admin') router.push('/admin/dashboard');
      else                            router.push('/destinations');
    } catch (err: any) {
      setErrorMsg(
        err.response?.data?.message ??
        err.response?.data?.error ??
        'Registration failed. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-[100dvh] flex bg-[#09090b] relative overflow-hidden"
      style={{ fontFamily: 'var(--font-dm-sans, DM Sans)' }}
    >
      {/* Mesh gradient orbs */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-[-15%] right-[-10%] w-[600px] h-[600px] rounded-full
                        bg-emerald-500/[0.05] blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full
                        bg-amber-500/[0.04] blur-[100px]" />
      </div>

      {/* ── Left: Brand / hero panel (hidden on mobile) ── */}
      <div className="hidden lg:flex lg:w-[45%] flex-col justify-between p-12 relative">
        {/* Image */}
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="https://picsum.photos/seed/mountain-landscape/1200/900"
            alt="Mountain landscape"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#09090b]/40 to-[#09090b]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10">
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
        </div>

        <div className="relative z-10 flex flex-col gap-5">
          <blockquote
            className="text-2xl font-bold text-zinc-200 tracking-[-0.03em] leading-tight"
            style={{ fontFamily: 'var(--font-outfit, Outfit)' }}
          >
            &ldquo;Every journey starts with a single step.
            Make yours count.&rdquo;
          </blockquote>

          {/* Feature list */}
          <ul className="flex flex-col gap-3">
            {[
              { icon: Compass, text: 'AI-built itineraries in seconds' },
              { icon: Award,   text: 'Vetted local guides, real reviews' },
              { icon: Shield,  text: 'Budget tracking with live alerts'   },
            ].map(({ icon: Icon, text }, i) => (
              <li key={i} className="flex items-center gap-3 text-sm text-zinc-400">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20
                                flex items-center justify-center shrink-0">
                  <Icon className="h-3.5 w-3.5 text-emerald-400" />
                </div>
                {text}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── Right: Form ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 sm:px-8 lg:px-10 relative z-10">

        {/* Back */}
        <div className="w-full max-w-[420px] mb-6">
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

        {/* Card */}
        <div className="w-full max-w-[420px] glass-strong rounded-2xl p-8 animate-fade-up">

          <div className="mb-6">
            <h1
              className="text-2xl font-bold text-zinc-100 tracking-[-0.03em]"
              style={{ fontFamily: 'var(--font-outfit, Outfit)' }}
            >
              Create your account
            </h1>
            <p className="mt-1.5 text-sm text-zinc-500">
              Free forever for travellers. Join 12,400+ explorers.
            </p>
          </div>

          {/* Error */}
          {errorMsg && (
            <div className="flex items-center gap-2.5 p-3 rounded-xl border border-rose-500/20
                            bg-rose-500/5 mb-5">
              <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
              <p className="text-xs text-rose-400 font-medium">{errorMsg}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">

            {/* Role selector */}
            <div className="flex flex-col gap-1.5">
              <label
                className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest"
                style={{ fontFamily: 'var(--font-mono, JetBrains Mono)' }}
              >
                I am a
              </label>
              <div className="grid grid-cols-2 gap-2">
                {([
                  { value: 'traveler', label: 'Traveller', icon: Compass,
                    desc: 'Explore & plan trips' },
                  { value: 'guide',    label: 'Guide',     icon: Award,
                    desc: 'Share your expertise' },
                ] as const).map(({ value, label, icon: Icon, desc }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setValue('role', value)}
                    className={`
                      flex flex-col items-center gap-2 p-4 rounded-xl border text-center
                      transition-all duration-200 cursor-pointer
                      ${selectedRole === value
                        ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                        : 'border-white/[0.07] bg-[#0d0d10] text-zinc-500 hover:border-white/15 hover:text-zinc-300'
                      }
                    `}
                  >
                    <Icon className={`h-5 w-5 ${selectedRole === value ? 'text-emerald-400' : 'text-zinc-600'}`} />
                    <div>
                      <p className="text-xs font-bold">{label}</p>
                      <p className="text-[10px] opacity-70 mt-0.5">{desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="reg-name"
                className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest"
                style={{ fontFamily: 'var(--font-mono, JetBrains Mono)' }}
              >
                Full name
              </label>
              <input
                id="reg-name"
                type="text"
                autoComplete="name"
                placeholder="Arjun Mehta"
                {...register('name')}
                className={`input-field ${errors.name ? 'error' : ''}`}
              />
              {errors.name && (
                <p className="text-[11px] text-rose-400 font-semibold">{errors.name.message}</p>
              )}
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="reg-email"
                className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest"
                style={{ fontFamily: 'var(--font-mono, JetBrains Mono)' }}
              >
                Email address
              </label>
              <input
                id="reg-email"
                type="email"
                autoComplete="email"
                placeholder="arjun@example.com"
                {...register('email')}
                className={`input-field ${errors.email ? 'error' : ''}`}
              />
              {errors.email && (
                <p className="text-[11px] text-rose-400 font-semibold">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="reg-password"
                className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest"
                style={{ fontFamily: 'var(--font-mono, JetBrains Mono)' }}
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Min. 8 characters"
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

            {/* Submit */}
            <button
              type="submit"
              id="register-submit"
              disabled={isLoading}
              className="btn btn-primary w-full py-3.5 text-sm mt-2
                         disabled:opacity-60 disabled:pointer-events-none"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create account'
              )}
            </button>
          </form>

          {/* Sign in link */}
          <p className="mt-5 text-center text-sm text-zinc-500">
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-emerald-400 font-semibold hover:text-emerald-300 transition-colors"
            >
              Sign in
            </Link>
          </p>

          <p className="mt-4 text-center text-[10px] text-zinc-700 leading-relaxed">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[100dvh] items-center justify-center bg-[#09090b]">
          <div className="h-8 w-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
