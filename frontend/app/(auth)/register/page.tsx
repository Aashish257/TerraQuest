'use client';

/**
 * register/page.tsx — Register Form Component
 *
 * Implements react-hook-form + zod validation.
 * Supports toggle selection for 'traveler' or 'guide' role.
 * Triggers backend POST /auth/register request.
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
  const [showPassword, setShowPassword] = useState(false);
  const [glowOffset, setGlowOffset] = useState({ x: 0, y: 0 });

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

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const moveX = (e.clientX - window.innerWidth / 2) / 50;
      const moveY = (e.clientY - window.innerHeight / 2) / 50;
      setGlowOffset({ x: moveX, y: moveY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

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
    <div className="bg-slate-950 text-slate-100 min-h-screen flex flex-col font-body-md overflow-x-hidden relative w-full justify-center">
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
        .font-body-lg { font-family: 'Inter', sans-serif; }
        .text-body-lg { font-size: 16px; line-height: 1.6; font-weight: 400; }
        .font-display-lg { font-family: 'Manrope', sans-serif; }
        .text-display-lg { font-size: 36px; line-height: 1.1; letter-spacing: -0.02em; font-weight: 800; }

        .glass-panel-register {
            background: rgba(15, 23, 42, 0.4);
            backdrop-filter: blur(24px);
            -webkit-backdrop-filter: blur(24px);
            border: 1px solid rgba(255, 255, 255, 0.08);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
        }

        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
            vertical-align: middle;
        }

        .input-glass {
            background: rgba(15, 23, 42, 0.6);
            border: 1px solid rgba(255, 255, 255, 0.08);
            color: #f1f5f9;
            transition: all 0.2s ease-in-out;
        }

        .input-glass:focus {
            background: rgba(15, 23, 42, 0.8);
            border-color: #0d4f4d;
            box-shadow: 0 0 0 4px rgba(13, 79, 77, 0.2);
        }

        .expedition-glow {
            position: absolute;
            width: 600px;
            height: 600px;
            background: radial-gradient(circle, rgba(13, 79, 77, 0.15) 0%, rgba(13, 79, 77, 0) 70%);
            z-index: -1;
            filter: blur(60px);
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

      {/* Atmospheric Background Layer */}
      <div className="fixed inset-0 z-[-1] overflow-hidden">
        <div className="absolute inset-0 bg-slate-950 opacity-90" />
        <div 
          className="absolute top-[-10%] left-[-10%] expedition-glow transition-transform duration-100 ease-out" 
          style={{ transform: `translate(${glowOffset.x}px, ${glowOffset.y}px)` }}
        />
        <div 
          className="absolute bottom-[-10%] right-[-10%] expedition-glow transition-transform duration-100 ease-out" 
          style={{ 
            background: 'radial-gradient(circle, rgba(163, 106, 79, 0.15) 0%, rgba(163, 106, 79, 0) 70%)',
            transform: `translate(${-glowOffset.x}px, ${-glowOffset.y}px)`
          }}
        />
        {/* Background Image Reference */}
        <div 
          className="absolute inset-0 opacity-20 mix-blend-overlay" 
          style={{ 
            backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuApBKflWuCxxUzsBi571Cs73lsQ69bEZu4qVqP34dufHroyPxx5uZfTlZzNaOs6NJEij9C-Dz6tQByhpOWA3gzWiQp8myoRFsILQr2OlD4gipYfhTmQ8u6JK4vEZvvNsa1Vd7dLe7bUuuLUbAE1kUZR7ZsHFKYcVbz63W-BVpzEiWLvBO1RrK-xyGO7hX5m5PBQcCcddEjSp9RjrWjNcoxwMNLQYdU6xVhznSSl5A9IDxc4e05dlW7kcBOJlvpE-S42l8YEva5i-mU')", 
            backgroundSize: 'cover', 
            backgroundPosition: 'center' 
          }}
        />
      </div>

      {/* Main Registration Canvas */}
      <main className="flex-grow flex items-center justify-center p-4 md:p-6 min-h-screen z-10">
        <div className="w-full max-w-xl">
          {/* Branding Header */}
          <div className="text-center mb-4">
            <h1 className="font-display-lg text-display-lg text-teal-400 mb-1 font-bold">TerraQuest</h1>
            <p className="text-xs text-slate-300 max-w-md mx-auto">
              Begin your professional expedition. Connect with the world&apos;s most remote wonders.
            </p>
          </div>

          {/* Central Glassmorphic Card */}
          <section className="glass-panel-register rounded-xl p-5 md:p-8 transition-all duration-500 hover:shadow-xl shadow-2xl">
            
            {/* Global Error Banner */}
            {errorMsg && (
              <div className="flex items-center space-x-2 rounded-xl bg-rose-500/10 border border-rose-500/20 p-2.5 text-xs text-rose-400 mb-4">
                <AlertCircle className="h-4 w-4 flex-shrink-0 text-rose-500" />
                <span className="font-medium">{errorMsg}</span>
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              {/* Role Toggle Section */}
              <div className="mb-4">
                <label className="font-label-caps text-label-caps text-slate-300 block mb-2 px-1">SELECT YOUR PATH</label>
                <div className="grid grid-cols-2 gap-4 p-1 bg-slate-950/60 border border-white/5 rounded-lg">
                  <button 
                    className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-all duration-300 ${
                      selectedRole === 'traveler'
                        ? 'bg-teal-500/20 border border-teal-500/30 text-teal-400 shadow-sm'
                        : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                    }`} 
                    type="button"
                    onClick={() => setValue('role', 'traveler')}
                  >
                    <span 
                      className="material-symbols-outlined text-[16px]" 
                      style={{ fontVariationSettings: selectedRole === 'traveler' ? "'FILL' 1" : "'FILL' 0" }}
                    >
                      explore
                    </span>
                    Traveler
                  </button>
                  <button 
                    className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-all duration-300 ${
                      selectedRole === 'guide'
                        ? 'bg-teal-500/20 border border-teal-500/30 text-teal-400 shadow-sm'
                        : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                    }`} 
                    type="button"
                    onClick={() => setValue('role', 'guide')}
                  >
                    <span 
                      className="material-symbols-outlined text-[16px]" 
                      style={{ fontVariationSettings: selectedRole === 'guide' ? "'FILL' 1" : "'FILL' 0" }}
                    >
                      map
                    </span>
                    Local Guide
                  </button>
                </div>
              </div>

              {/* Input Fields */}
              <div className="space-y-3">
                {/* Full Name */}
                <div className="group">
                  <label className="font-label-caps text-label-caps text-slate-300 block mb-1 px-1" htmlFor="full-name">
                    Full Name
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">person</span>
                    <input 
                      className={`w-full pl-12 pr-4 py-2.5 input-glass rounded-lg outline-none focus:border-teal-500 text-xs ${
                        errors.name ? 'border-rose-500/50' : ''
                      }`} 
                      id="full-name" 
                      placeholder="Alex Rivers" 
                      type="text"
                      required
                      {...register('name')}
                    />
                  </div>
                  {errors.name && (
                    <p className="text-[11px] text-rose-400 font-semibold ml-1">{errors.name.message}</p>
                  )}
                </div>

                {/* Email Address */}
                <div className="group">
                  <label className="font-label-caps text-label-caps text-slate-300 block mb-1 px-1" htmlFor="email">
                    Email Address
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">mail</span>
                    <input 
                      className={`w-full pl-12 pr-4 py-2.5 input-glass rounded-lg outline-none focus:border-teal-500 text-xs ${
                        errors.email ? 'border-rose-500/50' : ''
                      }`} 
                      id="email" 
                      placeholder="alex@expedition.com" 
                      type="email"
                      required
                      {...register('email')}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-[11px] text-rose-400 font-semibold ml-1">{errors.email.message}</p>
                  )}
                </div>

                {/* Password */}
                <div className="group">
                  <label className="font-label-caps text-label-caps text-slate-300 block mb-1 px-1" htmlFor="password">
                    Password
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">lock</span>
                    <input 
                      className={`w-full pl-12 pr-12 py-2.5 input-glass rounded-lg outline-none focus:border-teal-500 text-xs ${
                        errors.password ? 'border-rose-500/50' : ''
                      }`} 
                      id="password" 
                      placeholder="••••••••" 
                      type={showPassword ? 'text' : 'password'}
                      required
                      {...register('password')}
                    />
                    <button 
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-teal-400" 
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
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-start gap-2 px-1">
                <input 
                  className="mt-0.5 w-4 h-4 rounded border-white/10 text-teal-500 focus:ring-teal-500/20 bg-slate-950/60" 
                  id="terms" 
                  type="checkbox"
                  required
                />
                <label className="text-xs text-slate-400 leading-tight" htmlFor="terms">
                  I agree to the <a className="text-teal-400 font-semibold hover:underline" href="#">Terms of Service</a> and <a className="text-teal-400 font-semibold hover:underline" href="#">Privacy Policy</a>.
                </label>
              </div>

              {/* CTA Button */}
              <button 
                className="w-full bg-teal-600 hover:bg-teal-500 text-white py-3.5 rounded-xl font-semibold text-sm shadow-lg transform transition-all active:scale-95 duration-200 flex items-center justify-center gap-2 hover:shadow-teal-500/20" 
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </>
                )}
              </button>
            </form>

            {/* Social Sign In Divider */}
            <div className="mt-4 mb-4 flex items-center gap-3">
              <div className="flex-grow h-px bg-white/10"></div>
              <span className="font-label-caps text-label-caps text-slate-500">OR REGISTER WITH</span>
              <div className="flex-grow h-px bg-white/10"></div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button 
                type="button"
                className="flex items-center justify-center gap-2 py-2 rounded-lg bg-slate-900/60 hover:bg-slate-800/80 border border-white/5 transition-colors duration-200 text-xs font-medium text-slate-300"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="currentColor"></path>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="currentColor"></path>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="currentColor"></path>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="currentColor"></path>
                </svg>
                <span>Google</span>
              </button>
              <button 
                type="button"
                className="flex items-center justify-center gap-2 py-2 rounded-lg bg-slate-900/60 hover:bg-slate-800/80 border border-white/5 transition-colors duration-200 text-xs font-medium text-slate-300"
              >
                <svg className="w-4 h-4 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"></path>
                </svg>
                <span>Facebook</span>
              </button>
            </div>
          </section>

          {/* Footer Navigation */}
          <div className="mt-4 text-center space-y-3">
            <p className="text-xs text-slate-400">
              Already an explorer?{' '}
              <Link className="text-teal-400 font-bold hover:underline" href="/login">
                Log in here
              </Link>
            </p>
            <div className="flex justify-center gap-4 text-slate-500 font-label-caps text-[9px]">
              <a className="hover:text-teal-400 transition-colors" href="#">HELP CENTER</a>
              <a className="hover:text-teal-400 transition-colors" href="#">SAFETY TIPS</a>
              <a className="hover:text-teal-400 transition-colors" href="#">SUSTAINABILITY</a>
            </div>
          </div>
        </div>
      </main>
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
