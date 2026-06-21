'use client';

/**
 * register/page.tsx — Register Form Component
 *
 * Implements react-hook-form + zod validation.
 * Supports toggle selection for 'traveler' or 'guide' role.
 * Triggers backend POST /auth/register request.
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
import { AlertCircle, Loader2 } from 'lucide-react';

const registerSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Name must be at least 2 characters' })
    .max(100, { message: 'Name cannot exceed 100 characters' }),
  email: z.string().email({ message: 'Please provide a valid email address' }),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters' }),
  role: z.enum(['traveler', 'guide']),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useAuthStore((state) => state.login);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'traveler',
    },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const response = await api.post('/auth/register', data);
      const { token, user } = response.data;
      
      // Save in Zustand and localStorage
      login(user, token);

      // Role-based redirect: guides complete profile, others explore
      const redirectTo = searchParams.get('redirect');
      if (redirectTo) {
        router.push(redirectTo);
      } else if (user.role === 'guide') {
        router.push('/become-guide');
      } else if (user.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/destinations');
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Registration failed. Please try again.';
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
            Create an Account
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Sign up to plan your next travel quest.
          </p>
        </div>

        {/* Global Error Banner */}
        {errorMsg && (
          <div className="flex items-center space-x-2 rounded-lg bg-rose-500/10 border border-rose-500/20 p-3.5 text-sm text-rose-400">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Register Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            
            {/* Name field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-300">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                {...register('name')}
                className={`mt-1.5 block w-full rounded-lg bg-slate-950 border px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors ${
                  errors.name ? 'border-rose-500/50' : 'border-white/10'
                }`}
                placeholder="John Doe"
              />
              {errors.name && (
                <p className="mt-1 text-xs text-rose-400">{errors.name.message}</p>
              )}
            </div>

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
                placeholder="Min. 8 characters"
              />
              {errors.password && (
                <p className="mt-1 text-xs text-rose-400">{errors.password.message}</p>
              )}
            </div>

            {/* Role selector */}
            <div>
              <span className="block text-sm font-medium text-slate-300">
                I want to travel as a:
              </span>
              <div className="mt-2 grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setValue('role', 'traveler')}
                  className={`rounded-lg py-2.5 text-sm font-semibold border transition-all ${
                    selectedRole === 'traveler'
                      ? 'border-teal-500 bg-teal-500/10 text-teal-400'
                      : 'border-white/10 bg-slate-950 text-slate-400 hover:bg-white/5'
                  }`}
                >
                  Traveler
                </button>
                
                <button
                  type="button"
                  onClick={() => setValue('role', 'guide')}
                  className={`rounded-lg py-2.5 text-sm font-semibold border transition-all ${
                    selectedRole === 'guide'
                      ? 'border-teal-500 bg-teal-500/10 text-teal-400'
                      : 'border-white/10 bg-slate-950 text-slate-400 hover:bg-white/5'
                  }`}
                >
                  Local Guide
                </button>
              </div>
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
                <span>Registering...</span>
              </>
            ) : (
              <span>Register</span>
            )}
          </button>
        </form>

        {/* Redirect toggle */}
        <div className="text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-teal-400 hover:text-teal-300">
            Sign in
          </Link>
        </div>

      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent" />
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}
