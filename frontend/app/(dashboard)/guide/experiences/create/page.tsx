// This file renders the page screen for create in the browser.
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import { Compass, MapPin, Clock, List, FileText, Send, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Destination {
  _id: string;
  name: string;
  state: string;
  country: string;
}

export default function CreateExperiencePage() {
  const router = useRouter();
  const { user, isAuthenticated, initialize } = useAuthStore();
  
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [destinationId, setDestinationId] = useState('');
  const [name, setName] = useState('');
  const [duration, setDuration] = useState('');
  const [description, setDescription] = useState('');
  const [highlightsInput, setHighlightsInput] = useState('');
  
  const [isLoadingDestinations, setIsLoadingDestinations] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/guide/experiences/create');
      return;
    }
    
    if (user && user.role !== 'guide') {
      router.push('/become-guide');
      return;
    }

    const fetchDestinations = async () => {
      try {
        setIsLoadingDestinations(true);
        const res = await api.get('/destinations?limit=100');
        if (res.data.success) {
          setDestinations(res.data.destinations || []);
        }
      } catch (err: any) {
        console.error('Failed to load destinations:', err);
      } finally {
        setIsLoadingDestinations(false);
      }
    };

    fetchDestinations();
  }, [isAuthenticated, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    if (!destinationId) {
      setError('Please select a destination.');
      setIsSubmitting(false);
      return;
    }

    if (description.length < 20) {
      setError('Description must be at least 20 characters long.');
      setIsSubmitting(false);
      return;
    }

    const highlights = highlightsInput
      .split(',')
      .map((h) => h.trim())
      .filter((h) => h.length > 0);

    try {
      const res = await api.post('/experiences', {
        name,
        destinationId,
        duration,
        description,
        highlights,
      });

      if (res.data.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/guide/dashboard');
        }, 1500);
      } else {
        setError(res.data.message || 'Failed to add experience.');
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        'An error occurred. Please ensure all inputs are correct.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated || (user && user.role !== 'guide')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-950/20 via-slate-950 to-slate-950">
      <div className="mx-auto max-w-2xl">
        
        {/* Back Link */}
        <Link 
          href="/guide/dashboard" 
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-teal-400 transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Add an <span className="bg-gradient-to-r from-teal-400 to-indigo-400 bg-clip-text text-transparent">Experience Trail</span>
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Create a custom tour package or activity (e.g., sunset photography walk, village food tour) you can guide.
          </p>
        </div>

        {/* Form panel */}
        <div className="relative rounded-2xl border border-white/10 bg-slate-900/40 p-8 shadow-2xl backdrop-blur-xl">
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-300 text-sm font-semibold">
              🎉 Experience added successfully! Redirecting...
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Destination Selection */}
            <div>
              <label htmlFor="destination" className="block text-sm font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-teal-400" />
                Select Destination
              </label>
              {isLoadingDestinations ? (
                <div className="h-10 w-full animate-pulse rounded-lg bg-slate-950 border border-white/5 flex items-center px-4">
                  <span className="text-xs text-slate-500">Loading locations...</span>
                </div>
              ) : (
                <select
                  id="destination"
                  required
                  value={destinationId}
                  onChange={(e) => setDestinationId(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-slate-950 px-4 py-2.5 text-slate-200 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-all text-sm"
                >
                  <option value="" disabled>-- Choose a base destination --</option>
                  {destinations.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name} ({d.state})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Experience Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                <Compass className="h-4 w-4 text-teal-400" />
                Experience Name / Title
              </label>
              <input
                type="text"
                id="name"
                required
                minLength={3}
                maxLength={100}
                placeholder="e.g., Old Manali Café Crawl & Heritage Walk"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-slate-950 px-4 py-2.5 text-slate-200 placeholder-slate-500 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-all text-sm"
              />
            </div>

            {/* Duration & Highlights */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="duration" className="block text-sm font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-teal-400" />
                  Duration (e.g., 4 hours, 2 days)
                </label>
                <input
                  type="text"
                  id="duration"
                  required
                  placeholder="e.g., 4 hours"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-slate-950 px-4 py-2.5 text-slate-200 placeholder-slate-500 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-all text-sm"
                />
              </div>

              <div>
                <label htmlFor="highlights" className="block text-sm font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                  <List className="h-4 w-4 text-teal-400" />
                  Highlights (comma separated)
                </label>
                <input
                  type="text"
                  id="highlights"
                  placeholder="e.g., Hidden spots, Free local tea, Photo session"
                  value={highlightsInput}
                  onChange={(e) => setHighlightsInput(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-slate-950 px-4 py-2.5 text-slate-200 placeholder-slate-500 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-all text-sm"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-teal-400" />
                Description (Min 20 characters)
              </label>
              <textarea
                id="description"
                rows={5}
                required
                minLength={20}
                maxLength={2000}
                placeholder="Explain the experience details, the physical difficulty level, what clothing to wear, what is included in the cost, etc..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-slate-950 px-4 py-3 text-slate-200 placeholder-slate-500 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-all text-sm resize-none"
              />
              <span className="block text-right text-xs text-slate-500 mt-1">
                {description.length}/2000 characters
              </span>
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                id="experience-submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-indigo-600 px-4 py-3.5 font-bold text-white shadow-lg shadow-teal-500/15 hover:from-teal-400 hover:to-indigo-500 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Create Experience Listing</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
