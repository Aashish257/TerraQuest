'use client';

/**
 * login/page.tsx — Login Form Component
 *
 * Implements react-hook-form + zod validation.
 * Triggers backend POST /auth/login request.
 * Saves session variables in Zustand store on success, redirects to explore view.
 */

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import { AlertCircle, Loader2, Shield } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email({ message: 'Please provide a valid email address' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useAuthStore((state) => state.login);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const response = await api.post('/auth/login', data);
      const { token, user } = response.data;
      
      // Save in Zustand and localStorage
      login(user, token);

      // Check for a ?redirect param first, then fall back to role-based defaults
      const redirectTo = searchParams.get('redirect');
      if (redirectTo) {
        router.push(redirectTo);
      } else if (user.role === 'guide') {
        router.push('/guide/dashboard');
      } else if (user.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/destinations');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-grow items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-slate-950">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-white/5 bg-slate-900/40 p-8 shadow-2xl backdrop-blur-md">
        
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-white">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Sign in to manage your itineraries and budgets.
          </p>
        </div>

        {/* Global Error Banner */}
        {errorMsg && (
          <div className="flex items-center space-x-2 rounded-lg bg-rose-500/10 border border-rose-500/20 p-3.5 text-sm text-rose-400">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            
            {/* Email field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300">
                Email address
              </label>
              <input
                id="email"
                type="email"
                {...register('email')}
                className={`mt-1.5 block w-full rounded-lg bg-slate-950 border px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors ${
                  errors.email ? 'border-rose-500/50' : 'border-white/10'
                }`}
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-rose-400">{errors.email.message}</p>
              )}
            </div>

            {/* Password field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300">
                Password
              </label>
              <input
                id="password"
                type="password"
                {...register('password')}
                className={`mt-1.5 block w-full rounded-lg bg-slate-950 border px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors ${
                  errors.password ? 'border-rose-500/50' : 'border-white/10'
                }`}
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="mt-1 text-xs text-rose-400">{errors.password.message}</p>
              )}
            </div>

          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-teal-500 to-indigo-600 py-2.5 text-sm font-semibold text-white hover:from-teal-400 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50 transition-all"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>Signing In...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        {/* Redirect toggle */}
        <div className="text-center text-sm text-slate-400">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-semibold text-teal-400 hover:text-teal-300">
            Sign up
          </Link>
        </div>

        {/* Admin access note */}
        <div className="flex items-center justify-center gap-1.5 pt-1">
          <Shield className="h-3 w-3 text-slate-600" />
          <span className="text-xs text-slate-600">
            Admin?{' '}
            <Link href="/login?redirect=/admin/dashboard" className="text-slate-500 hover:text-slate-400 underline underline-offset-2 transition-colors">
              Access Admin Panel
            </Link>
          </span>
        </div>

      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
