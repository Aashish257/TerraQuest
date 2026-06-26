// This file renders the page screen for create in the browser.
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import { Map, MapPin, Tag, Image as ImageIcon, FileText, Send, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Destination {
  _id: string;
  name: string;
  state: string;
  country: string;
}

export default function CreateHiddenPlacePage() {
  const router = useRouter();
  const { user, isAuthenticated, initialize } = useAuthStore();
  
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [destinationId, setDestinationId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Viewpoint');
  const [imageUrl, setImageUrl] = useState('');
  
  const [isLoadingDestinations, setIsLoadingDestinations] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/guide/hidden-places/create');
      return;
    }
    
    if (user && user.role !== 'guide') {
      router.push('/become-guide');
      return;
    }

    const fetchDestinations = async () => {
      try {
        setIsLoadingDestinations(true);
        // Fetch up to 100 destinations for dropdown selection
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

    // Set sample placeholder image if none provided
    const images = imageUrl.trim() ? [imageUrl.trim()] : ['https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800'];

    try {
      const res = await api.post('/hidden-places', {
        destinationId,
        title,
        description,
        category,
        images,
      });

      if (res.data.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/guide/dashboard');
        }, 1500);
      } else {
        setError(res.data.message || 'Failed to submit hidden place.');
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        'An error occurred while creating. Please verify all inputs.'
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
        
        {/* Back navigation */}
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
            Add a <span className="bg-gradient-to-r from-teal-400 to-indigo-400 bg-clip-text text-transparent">Hidden Place</span>
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Share a secret viewpoint, offbeat trail, or a local gem with travelers.
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
              🎉 Hidden Place contributed successfully! Redirecting...
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

            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                <Map className="h-4 w-4 text-teal-400" />
                Hidden Place Title
              </label>
              <input
                type="text"
                id="title"
                required
                minLength={3}
                maxLength={100}
                placeholder="e.g., Hidden Kaza Sunrise Point"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-slate-950 px-4 py-2.5 text-slate-200 placeholder-slate-500 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-all text-sm"
              />
            </div>

            {/* Category & Image URL */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="category" className="block text-sm font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                  <Tag className="h-4 w-4 text-teal-400" />
                  Category
                </label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-slate-950 px-4 py-2.5 text-slate-200 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-all text-sm"
                >
                  {['Viewpoint', 'Waterfall', 'Cave', 'Valley', 'Temple', 'Trek Trail', 'Cafe', 'Forest', 'Lake'].map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="imageUrl" className="block text-sm font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                  <ImageIcon className="h-4 w-4 text-teal-400" />
                  Image URL (Optional)
                </label>
                <input
                  type="url"
                  id="imageUrl"
                  placeholder="https://example.com/landscape.jpg"
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
                Description & Travel Tips (Min 20 characters)
              </label>
              <textarea
                id="description"
                rows={5}
                required
                minLength={20}
                maxLength={2000}
                placeholder="Provide a detailed description of the spot, how to reach it, the best season to go, and any local safety guidelines..."
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
                id="hidden-place-submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-indigo-600 px-4 py-3.5 font-bold text-white shadow-lg shadow-teal-500/15 hover:from-teal-400 hover:to-indigo-500 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Contribute Hidden Place</span>
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
