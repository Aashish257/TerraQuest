'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import { Compass, MapPin, Calendar, DollarSign, Activity, FileText, ImageIcon, Send, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CreateDestinationPage() {
  const router = useRouter();
  const { user, isAuthenticated, initialize } = useAuthStore();
  
  const [name, setName] = useState('');
  const [country, setCountry] = useState('India');
  const [state, setState] = useState('');
  const [description, setDescription] = useState('');
  const [bestTimeToVisit, setBestTimeToVisit] = useState('');
  const [budgetRange, setBudgetRange] = useState('');
  const [activitiesInput, setActivitiesInput] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/guide/destinations/create');
      return;
    }
    
    if (user && user.role !== 'guide') {
      router.push('/become-guide');
      return;
    }
  }, [isAuthenticated, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    if (description.length < 20) {
      setError('Description must be at least 20 characters long.');
      setIsSubmitting(false);
      return;
    }

    const activities = activitiesInput
      .split(',')
      .map((act) => act.trim())
      .filter((act) => act.length > 0);

    const images = imageUrl.trim() ? [imageUrl.trim()] : ['https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800'];

    try {
      const res = await api.post('/destinations/guide', {
        name,
        country,
        state,
        description,
        bestTimeToVisit,
        budgetRange,
        activities,
        images,
      });

      if (res.data.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/guide/dashboard');
        }, 1500);
      } else {
        setError(res.data.message || 'Failed to submit destination.');
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
        
        {/* Back link */}
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
            Contribute a <span className="bg-gradient-to-r from-teal-400 to-indigo-400 bg-clip-text text-transparent">Destination</span>
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Submit a new destination. Submissions default to pending status until approved by an admin.
          </p>
        </div>

        {/* Form Container */}
        <div className="relative rounded-2xl border border-white/10 bg-slate-900/40 p-8 shadow-2xl backdrop-blur-xl">
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-300 text-sm font-semibold">
              🎉 Destination contributed successfully! Awaiting admin moderation. Redirecting...
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                <Compass className="h-4 w-4 text-teal-400" />
                Destination Name
              </label>
              <input
                type="text"
                id="name"
                required
                minLength={2}
                maxLength={100}
                placeholder="e.g., Spiti Valley"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-slate-950 px-4 py-2.5 text-slate-200 placeholder-slate-500 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-all text-sm"
              />
            </div>

            {/* Country & State */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="country" className="block text-sm font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-teal-400" />
                  Country
                </label>
                <input
                  type="text"
                  id="country"
                  required
                  placeholder="India"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-slate-950 px-4 py-2.5 text-slate-200 placeholder-slate-500 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-all text-sm"
                />
              </div>

              <div>
                <label htmlFor="state" className="block text-sm font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-teal-400" />
                  State (Optional)
                </label>
                <input
                  type="text"
                  id="state"
                  placeholder="e.g., Himachal Pradesh"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-slate-950 px-4 py-2.5 text-slate-200 placeholder-slate-500 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-all text-sm"
                />
              </div>
            </div>

            {/* Best Time & Budget */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="bestTime" className="block text-sm font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-teal-400" />
                  Best Time to Visit
                </label>
                <input
                  type="text"
                  id="bestTime"
                  placeholder="e.g., May to September"
                  value={bestTimeToVisit}
                  onChange={(e) => setBestTimeToVisit(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-slate-950 px-4 py-2.5 text-slate-200 placeholder-slate-500 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-all text-sm"
                />
              </div>

              <div>
                <label htmlFor="budgetRange" className="block text-sm font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                  <DollarSign className="h-4 w-4 text-teal-400" />
                  Budget Range
                </label>
                <input
                  type="text"
                  id="budgetRange"
                  placeholder="e.g., ₹2,000 – ₹6,500 per day"
                  value={budgetRange}
                  onChange={(e) => setBudgetRange(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-slate-950 px-4 py-2.5 text-slate-200 placeholder-slate-500 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-all text-sm"
                />
              </div>
            </div>

            {/* Activities & Images */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="activities" className="block text-sm font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                  <Activity className="h-4 w-4 text-teal-400" />
                  Key Activities (comma separated)
                </label>
                <input
                  type="text"
                  id="activities"
                  placeholder="e.g., Trekking, Camping, Star Gazing"
                  value={activitiesInput}
                  onChange={(e) => setActivitiesInput(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-slate-950 px-4 py-2.5 text-slate-200 placeholder-slate-500 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-all text-sm"
                />
              </div>

              <div>
                <label htmlFor="imageUrl" className="block text-sm font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                  <ImageIcon className="h-4 w-4 text-teal-400" />
                  Featured Image URL (Optional)
                </label>
                <input
                  type="url"
                  id="imageUrl"
                  placeholder="https://example.com/dest.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
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
                placeholder="Write a description explaining what makes this destination unique, how to get there, key spots to visit..."
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
                id="destination-submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-indigo-600 px-4 py-3.5 font-bold text-white shadow-lg shadow-teal-500/15 hover:from-teal-400 hover:to-indigo-500 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Contribute New Destination</span>
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
