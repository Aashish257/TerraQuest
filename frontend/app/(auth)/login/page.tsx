'use client';

/**
 * login/page.tsx — Login Form Component
 *
 * Implements react-hook-form + zod validation.
 * Triggers backend POST /auth/login request.
 * Saves session variables in Zustand store on success, redirects to explore view.
 *
 * Design updated to match the premium dark-glassmorphic theme of the application.
 * Optimized to fit within the viewport without scrolling and includes an exit button.
 */

import { useState, Suspense, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import { AlertCircle, Loader2 } from 'lucide-react';

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
  const [showPassword, setShowPassword] = useState(false);
  const [isCardFocused, setIsCardFocused] = useState(false);
  const [bgTransform, setBgTransform] = useState('scale(1.1) translate(0px, 0px)');

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

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const moveX = (e.clientX - window.innerWidth / 2) * 0.005;
      const moveY = (e.clientY - window.innerHeight / 2) * 0.005;
      setBgTransform(`scale(1.1) translate(${moveX}px, ${moveY}px)`);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

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
    <div className="font-body-md text-slate-100 min-h-screen flex items-center justify-center p-4 relative w-full overflow-hidden bg-slate-950">
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Manrope:wght@600;700;800&family=JetBrains+Mono:wght@600&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');

        .font-headline-lg { font-family: 'Manrope', sans-serif; }
        .text-headline-lg { font-size: 28px; line-height: 1.2; font-weight: 700; }
        .font-headline-md { font-family: 'Manrope', sans-serif; }
        .text-headline-md { font-size: 22px; line-height: 1.3; font-weight: 600; }
        .font-label-caps { font-family: 'JetBrains Mono', monospace; }
        .text-label-caps { font-size: 11px; line-height: 1.0; letter-spacing: 0.1em; font-weight: 600; }
        .font-body-md { font-family: 'Inter', sans-serif; }
        .text-body-md { font-size: 15px; line-height: 1.5; font-weight: 400; }

        .glass-panel-login {
            background: rgba(15, 23, 42, 0.4);
            backdrop-filter: blur(24px);
            -webkit-backdrop-filter: blur(24px);
            border: 1px solid rgba(255, 255, 255, 0.08);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
        }

        .glow-button {
            position: relative;
            overflow: hidden;
            background: linear-gradient(135deg, #0d4f4d 0%, #003735 100%);
            transition: all 0.3s ease;
        }

        .glow-button::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%);
            transform: translate(-10%, -10%);
            transition: transform 0.5s ease;
            pointer-events: none;
        }

        .glow-button:hover::before {
            transform: translate(10%, 10%);
        }

        .input-glass {
            background: rgba(15, 23, 42, 0.6);
            border: 1px solid rgba(255, 255, 255, 0.08);
            color: #f1f5f9;
            transition: all 0.2s ease;
        }

        .input-glass:focus {
            background: rgba(15, 23, 42, 0.8);
            border-color: #0d4f4d;
            box-shadow: 0 0 0 2px rgba(13, 79, 77, 0.2);
            outline: none;
        }

        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
      `}} />

      {/* Exit Button */}
      <Link 
        href="/" 
        className="absolute top-4 right-4 z-20 flex items-center justify-center h-10 w-10 rounded-full bg-slate-900/60 hover:bg-slate-800/80 border border-white/10 text-slate-300 hover:text-white transition-colors duration-200 shadow-md backdrop-blur-md"
        title="Exit to home"
      >
        <span className="material-symbols-outlined text-[20px]">close</span>
      </Link>

      {/* Background Layer with Image and Blur */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <div 
          className="absolute inset-0 w-full h-full bg-cover bg-center scale-110 blur-sm brightness-50 transition-transform duration-100 ease-out"
          style={{ 
            backgroundImage: "url('https://lh3.googleusercontent.com/aida/AP1WRLuhnTLLnMoLqXNjwXP41Z1MsYNKO8p739_uJO6PRglUK6UHyJZfjTpZD4Wzp7KiLhL-ZpvYwxvbqA_p0NrUVzolTKe28uriFI3qDIsgjH9wSCJzQwYM06gcauTjVLvgoZrjvr0DoiJUQ1FHDEHYNa1EpLGv-rIQIxJmSCh5lrEgeG598YUHUZRCzQH6KMI3T5lpjz76-c5-09sR8gWfBXCLtgpruvj9x1_-W5xpW7p8c8ZyLZCaYnOHdiQ')",
            transform: bgTransform
          }}
        />
        <div className="absolute inset-0 bg-slate-950/60" />
      </div>

      {/* Main Content Container */}
      <main className="relative z-10 w-full max-w-[440px]">
        {/* Branding Header */}
        <div className="text-center mb-4 animate-in fade-in duration-700">
          <h1 className="font-headline-lg text-headline-lg text-white drop-shadow-md tracking-tight">
            TerraQuest
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Your portal to the world&apos;s hidden wonders.
          </p>
        </div>

        {/* Glassmorphic Login Card */}
        <section 
          className={`glass-panel-login rounded-2xl p-6 md:p-8 transition-shadow duration-300 ${
            isCardFocused 
              ? 'shadow-[0_25px_50px_rgba(0,0,0,0.6)]' 
              : 'shadow-[0_20px_40px_rgba(0,0,0,0.4)]'
          }`}
        >
          <div className="mb-4">
            <h2 className="font-headline-md text-headline-md text-teal-400 mb-1">Welcome Back</h2>
            <p className="text-xs text-slate-400">Please enter your details to sign in.</p>
          </div>

          {/* Global Error Banner */}
          {errorMsg && (
            <div className="flex items-center space-x-2 rounded-xl bg-rose-500/10 border border-rose-500/20 p-2.5 text-xs text-rose-400 mb-4">
              <AlertCircle className="h-4 w-4 flex-shrink-0 text-rose-500" />
              <span className="font-medium">{errorMsg}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            {/* Email Field */}
            <div className="space-y-1">
              <label className="font-label-caps text-label-caps text-slate-300 uppercase tracking-wider ml-1" htmlFor="email">
                Email Address
              </label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-400 transition-colors">
                  mail
                </span>
                <input 
                  className={`input-glass w-full py-2.5 pl-12 pr-4 rounded-xl text-xs placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 ${
                    errors.email ? 'border-rose-500/50' : ''
                  }`}
                  id="email" 
                  type="email"
                  placeholder="guide@terraquest.com" 
                  required
                  {...register('email')}
                  onFocus={() => setIsCardFocused(true)}
                  onBlur={() => setIsCardFocused(false)}
                />
              </div>
              {errors.email && (
                <p className="text-[11px] text-rose-400 font-semibold ml-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <div className="flex justify-between items-center px-1">
                <label className="font-label-caps text-label-caps text-slate-300 uppercase tracking-wider" htmlFor="password">
                  Password
                </label>
                <a className="text-[11px] font-medium text-teal-400 hover:text-teal-300 transition-colors" href="#">
                  Forgot Password?
                </a>
              </div>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-400 transition-colors">
                  lock
                </span>
                <input 
                  className={`input-glass w-full py-2.5 pl-12 pr-12 rounded-xl text-xs placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 ${
                    errors.password ? 'border-rose-500/50' : ''
                  }`}
                  id="password" 
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••" 
                  required
                  {...register('password')}
                  onFocus={() => setIsCardFocused(true)}
                  onBlur={() => setIsCardFocused(false)}
                />
                <button 
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-teal-400 transition-colors" 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
              {errors.password && (
                <p className="text-[11px] text-rose-400 font-semibold ml-1">{errors.password.message}</p>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center space-x-2 px-1">
              <input 
                className="w-4 h-4 rounded border-white/10 text-teal-500 focus:ring-teal-500/20 bg-slate-950/60" 
                id="remember" 
                type="checkbox"
              />
              <label className="text-xs text-slate-400 cursor-pointer" htmlFor="remember">
                Remember this expedition
              </label>
            </div>

            {/* Sign In Button */}
            <button 
              className="glow-button w-full py-3 px-4 rounded-xl text-white font-semibold text-sm shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2" 
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          {/* Social Logins */}
          <div className="mt-4">
            <div className="relative flex items-center mb-3">
              <div className="flex-grow border-t border-white/10"></div>
              <span className="flex-shrink mx-3 font-label-caps text-label-caps text-slate-500 uppercase">Or continue with</span>
              <div className="flex-grow border-t border-white/10"></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button 
                type="button"
                className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-white/5 transition-all text-xs font-medium text-slate-300"
              >
                <img 
                  alt="Google" 
                  className="w-4 h-4" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDgM3Kwpm4G5FX1IQNjlFFDgiTc9qw3YJ0kU_fcUvgcaPZAI4lKOjfQn5SYf0aDWOW6ICdwlvIzOE_u_rUKYSmQG2MNbpzHEq4vXw6bUHL689s8ZqX3dNIj0yT6ARUn3ehlkRlx6xexe-NBF1C1jKpSBK-L35wKQQDbUjuHoym-G-F5H_my1V8eocD3WzCFkJWOgyrcZfX9UnS8kQwj2JEw_TWgP-6TmfUxiHdMqO4fFcwx88NKPlQ8Byy5YGVBLgOtZTdi0N-cmMw"
                />
                <span>Google</span>
              </button>
              <button 
                type="button"
                className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-white/5 transition-all text-xs font-medium text-slate-300"
              >
                <span className="material-symbols-outlined text-[18px]">apps</span>
                <span>Apple</span>
              </button>
            </div>
          </div>

          {/* Footer Link */}
          <div className="mt-5 text-center">
            <p className="text-xs text-slate-400">
              Don&apos;t have an account? 
              <Link className="text-teal-400 font-bold hover:underline ml-1" href="/register">
                Sign up
              </Link>
            </p>

            {/* Admin access note */}
            <div className="flex items-center justify-center gap-1.5 pt-3 border-t border-white/5 mt-3">
              <span className="material-symbols-outlined text-[14px] text-slate-600">shield</span>
              <span className="text-[10px] text-slate-500">
                Admin?{' '}
                <Link href="/login?redirect=/admin/dashboard" className="text-slate-500 hover:text-slate-400 underline underline-offset-2 transition-colors">
                  Access Admin Panel
                </Link>
              </span>
            </div>
          </div>
        </section>
      </main>
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
