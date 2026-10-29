'use client';

import { useEffect, useRef } from 'react';

/**
 * BackendKeepAlive
 *
 * Silently pings the Railway backend to prevent free/hobby tier instances
 * from spinning down due to inactivity.
 *
 * Features:
 * - Immediate wake-up ping upon website mount (cold start warm-up)
 * - Periodic heartbeat ping every 25 seconds while tab is active
 * - Immediate wake-up on tab visibility change (user switching back to tab)
 * - Immediate wake-up on window focus & online events
 * - Uses cache-busting timestamp to prevent CDN/browser caching
 * - Uses `mode: 'no-cors'` so browser never throws CORS or network errors
 * - Completely invisible: renders null with zero DOM footprint
 */
export default function BackendKeepAlive() {
  const lastPingRef = useRef<number>(0);

  useEffect(() => {
    // Resolve backend endpoints
    const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const baseUrl = rawApiUrl.replace(/\/api\/?$/, '').replace(/\/$/, '');
    const healthUrl = `${baseUrl}/health`;

    const sendPing = async () => {
      const now = Date.now();
      lastPingRef.current = now;

      try {
        // mode: 'no-cors' ensures Railway receives the HTTP GET request without CORS blocks
        await fetch(`${healthUrl}?_t=${now}`, {
          method: 'GET',
          mode: 'no-cors',
          cache: 'no-store',
          credentials: 'omit',
        });

        if (process.env.NODE_ENV === 'development') {
          console.debug('[BackendKeepAlive] Heartbeat ping sent to:', healthUrl);
        }
      } catch {
        // Fallback to API base if root health check fails
        try {
          await fetch(`${rawApiUrl}?_t=${now}`, {
            method: 'GET',
            mode: 'no-cors',
            cache: 'no-store',
            credentials: 'omit',
          });
        } catch {
          // Silently ignore to protect user experience
        }
      }
    };

    // 1. Initial wake-up ping after 500ms
    const initialTimer = setTimeout(() => {
      sendPing();
    }, 500);

    // 2. Heartbeat interval: ping every 25 seconds
    const interval = setInterval(() => {
      sendPing();
    }, 25000);

    // 3. Visibility change listener (user returns to inactive tab)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const timeSinceLastPing = Date.now() - lastPingRef.current;
        // If it's been more than 15s since last ping, ping immediately
        if (timeSinceLastPing > 15000) {
          sendPing();
        }
      }
    };

    // 4. Window focus listener
    const handleFocus = () => {
      const timeSinceLastPing = Date.now() - lastPingRef.current;
      if (timeSinceLastPing > 15000) {
        sendPing();
      }
    };

    // 5. Network online listener
    const handleOnline = () => {
      sendPing();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('online', handleOnline);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  return null;
}
