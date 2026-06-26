// This file renders the page screen for profile in the browser.
'use client';

/**
 * /profile — Smart redirect based on user role.
 * Guides → /guide/profile
 * Admins → /admin/dashboard
 * Travelers → /dashboard (or destinations)
 * Unauthenticated → /login
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function ProfileRedirectPage() {
  const router = useRouter();
  const { user, isAuthenticated, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login?redirect=/profile');
      return;
    }
    if (user?.role === 'guide') {
      router.replace('/guide/profile');
    } else if (user?.role === 'admin') {
      router.replace('/admin/dashboard');
    } else {
      router.replace('/destinations');
    }
  }, [isAuthenticated, user, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent" />
    </div>
  );
}
