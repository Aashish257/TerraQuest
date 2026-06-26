// This file renders the page screen for [id] in the browser.
'use client';

/**
 * [id]/page.tsx — Destination Detail Screen
 *
 * Displays details for a single selected destination.
 * Shows description, activities tags, travel season, budget range, and images.
 * Provides a call-to-action linking directly to the AI Travel Planner.
 * Integrates an interactive reviews panel for reading and posting ratings/comments.
 */

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Destination } from '@/components/shared/DestinationCard';
import { useAuthStore } from '@/store/authStore';
import {
  Compass,
  MapPin,
  Calendar,
  Sparkles,
  ArrowLeft,
  Loader2,
  AlertCircle,
  TrendingUp,
  Star,
} from 'lucide-react';

interface DestinationDetailProps {
  params: {
    id: string;
  };
}

interface Review {
  _id: string;
  userId: {
    _id: string;
    name: string;
    avatar?: string;
  };
  targetId: string;
  targetType: 'destination' | 'guide';
  rating: number;
  comment: string;
  createdAt: string;
}

// Image mappings for the seeded Indian destinations
const DESTINATION_IMAGE_MAPPINGS: Record<string, string> = {
  'Goa': 'https://images.unsplash.com/photo-1506461883276-594a12b11cc3?auto=format&fit=crop&w=1200&q=80',
  'Manali': 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80',
  'Ladakh': 'https://images.unsplash.com/photo-1596700445887-321287c88b03?auto=format&fit=crop&w=1200&q=80',
  'Jaipur': 'https://images.unsplash.com/photo-1477584322811-591f423e20de?auto=format&fit=crop&w=1200&q=80',
  'Coorg': 'https://images.unsplash.com/photo-1590001155093-a3c66ab0c3ff?auto=format&fit=crop&w=1200&q=80',
  'Munnar': 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=1200&q=80',
  'Pondicherry': 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80',
  'Rishikesh': 'https://images.unsplash.com/photo-1598977123418-45f04b01f4ac?auto=format&fit=crop&w=1200&q=80',
  'Udaipur': 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80',
  'Meghalaya': 'https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?auto=format&fit=crop&w=1200&q=80',
};

export default function DestinationDetailPage({ params }: DestinationDetailProps) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  
  const [destination, setDestination] = useState<Destination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Reviews states
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isReviewsLoading, setIsReviewsLoading] = useState(true);
  
  // Review form states
  const [formRating, setFormRating] = useState(5);
  const [formComment, setFormComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const imageUrl = destination && (destination.images && destination.images.length > 0
    ? destination.images[0]
    : DESTINATION_IMAGE_MAPPINGS[destination.name] || '');

  const fetchDetail = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.get(`/destinations/${params.id}`);
      if (res.data.success) {
        setDestination(res.data.destination);
      }
    } catch (err: any) {
      console.error('Error fetching destination details:', err);
      const msg = err.response?.data?.message || 'Could not retrieve destination details.';
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  }, [params.id]);

  const fetchReviews = useCallback(async () => {
    setIsReviewsLoading(true);
    try {
      const res = await api.get(`/reviews?targetId=${params.id}&targetType=destination`);
      if (res.data.success) {
        setReviews(res.data.reviews);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setIsReviewsLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchDetail();
    fetchReviews();
  }, [fetchDetail, fetchReviews]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formComment.trim().length < 10) {
      setSubmitError('Comment must be at least 10 characters.');
      return;
    }
    setIsSubmittingReview(true);
    setSubmitError(null);
    setSubmitSuccess(false);
    try {
      const res = await api.post('/reviews', {
        targetId: params.id,
        targetType: 'destination',
        rating: formRating,
        comment: formComment,
      });
      if (res.data.success) {
        setSubmitSuccess(true);
        setFormComment('');
        setFormRating(5);
        fetchReviews(); // Refresh review list
      }
    } catch (err: any) {
      console.error('Error submitting review:', err);
      setSubmitError(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-grow flex flex-col justify-center items-center py-20 bg-slate-950">
        <Loader2 className="h-10 w-10 text-teal-500 animate-spin" />
        <p className="mt-4 text-sm text-slate-500">Loading details...</p>
      </div>
    );
  }

  if (errorMsg || !destination) {
    return (
      <div className="flex-grow flex flex-col justify-center items-center py-20 bg-slate-950 text-center px-4">
        <AlertCircle className="h-12 w-12 text-rose-500" />
        <h3 className="mt-4 text-lg font-bold text-white">Destination Not Found</h3>
        <p className="mt-2 text-sm text-slate-400 max-w-sm">{errorMsg || 'The requested destination details could not be found.'}</p>
        <Link
          href="/destinations"
          className="mt-6 flex items-center space-x-1.5 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Explore</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 w-full flex-grow flex flex-col justify-start">
      
      {/* Back navigation */}
      <div className="mb-6">
        <Link
          href="/destinations"
          className="inline-flex items-center space-x-1.5 text-sm font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Explore</span>
        </Link>
      </div>

      {/* Main Grid: Detail and Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Detail Panel */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Header information */}
          <div>
            <div className="flex items-center space-x-2">
              <span className="flex items-center space-x-1 text-xs font-bold text-teal-400 uppercase tracking-wider">
                <MapPin className="h-3.5 w-3.5" />
                <span>
                  {destination.state ? `${destination.state}, ` : ''}
                  {destination.country}
                </span>
              </span>
              {destination.featured && (
                <span className="flex items-center space-x-1 rounded-full bg-teal-500/10 border border-teal-500/20 px-2 py-0.5 text-[10px] font-bold text-teal-400">
                  <Sparkles className="h-2.5 w-2.5" />
                  <span>Featured</span>
                </span>
              )}
            </div>

            <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              {destination.name}
            </h1>
          </div>

          {/* Large image cover */}
          <div className="relative h-96 w-full rounded-2xl border border-white/5 bg-gradient-to-br from-slate-900 to-indigo-950/40 flex items-center justify-center overflow-hidden shadow-2xl">
            {imageUrl ? (
              <img 
                src={imageUrl} 
                alt={destination.name} 
                className="w-full h-full object-cover opacity-80" 
              />
            ) : (
              <Compass className="h-20 w-20 text-slate-800" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-transparent opacity-90" />
          </div>

          {/* Description */}
          <div className="bg-slate-900/20 border border-white/5 p-6 rounded-2xl backdrop-blur-md">
            <h2 className="text-xl font-bold text-white mb-4">About this Spot</h2>
            <p className="text-slate-300 leading-relaxed text-sm whitespace-pre-line">
              {destination.description}
            </p>
          </div>

          {/* Activities List */}
          <div className="bg-slate-900/20 border border-white/5 p-6 rounded-2xl backdrop-blur-md">
            <h2 className="text-xl font-bold text-white mb-4">Activities & Experiences</h2>
            <div className="flex flex-wrap gap-2">
              {destination.activities.map((act, idx) => (
                <span
                  key={idx}
                  className="rounded-full bg-teal-500/10 border border-teal-500/25 px-4 py-1.5 text-xs font-semibold text-teal-400"
                >
                  {act}
                </span>
              ))}
            </div>
          </div>

          {/* Reviews Panel */}
          <div className="bg-slate-900/20 border border-white/5 p-6 rounded-2xl backdrop-blur-md space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <h2 className="text-xl font-bold text-white">Reviews & Feedback</h2>
              <span className="text-xs text-slate-400 font-semibold bg-slate-800 border border-white/5 px-2.5 py-1 rounded-full">
                {reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'}
              </span>
            </div>

            {/* List Reviews */}
            {isReviewsLoading ? (
              <div className="flex justify-center items-center py-6">
                <Loader2 className="h-6 w-6 text-teal-500 animate-spin" />
              </div>
            ) : reviews.length === 0 ? (
              <p className="text-slate-400 text-sm py-4 text-center">No reviews yet. Be the first to share your experience!</p>
            ) : (
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {reviews.map((rev) => (
                  <div key={rev._id} className="border border-white/5 bg-slate-950/40 p-4 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-r from-teal-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white">
                          {rev.userId.name.charAt(0)}
                        </div>
                        <div>
                          <span className="text-sm font-bold text-slate-200 block">{rev.userId.name}</span>
                          <span className="text-[10px] text-slate-500">
                            {new Date(rev.createdAt).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>

                      {/* Stars */}
                      <div className="flex items-center space-x-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3.5 w-3.5 ${
                              i < rev.rating
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-slate-700'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-slate-300 text-xs leading-relaxed pl-10">
                      {rev.comment}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Post Review Form */}
            <div className="border-t border-white/5 pt-6">
              <h3 className="text-lg font-bold text-white mb-4">Leave a Review</h3>
              {isAuthenticated ? (
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  {submitError && (
                    <div className="flex items-center space-x-2 rounded-lg bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-400">
                      <AlertCircle className="h-4 w-4 flex-shrink-0" />
                      <span>{submitError}</span>
                    </div>
                  )}

                  {submitSuccess && (
                    <div className="flex items-center space-x-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-400">
                      <Sparkles className="h-4 w-4 flex-shrink-0" />
                      <span>Thank you! Your review has been submitted successfully.</span>
                    </div>
                  )}

                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-semibold text-slate-300">Rating:</span>
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: 5 }).map((_, i) => {
                        const starVal = i + 1;
                        return (
                          <button
                            key={i}
                            type="button"
                            onClick={() => {
                              setFormRating(starVal);
                              setSubmitSuccess(false);
                            }}
                            className="hover:scale-110 transition-transform"
                          >
                            <Star
                              className={`h-6 w-6 ${
                                starVal <= formRating
                                  ? 'text-amber-400 fill-amber-400'
                                  : 'text-slate-700 hover:text-amber-400/55'
                              }`}
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="comment" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Review Comment (Min 10 characters)
                    </label>
                    <textarea
                      id="comment"
                      value={formComment}
                      onChange={(e) => {
                        setFormComment(e.target.value);
                        setSubmitSuccess(false);
                      }}
                      rows={3}
                      placeholder="Share your thoughts about this destination..."
                      className="w-full rounded-xl border border-white/5 bg-slate-950/60 p-3 text-sm text-slate-200 placeholder-slate-600 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isSubmittingReview}
                      className="flex items-center justify-center space-x-2 rounded-lg bg-teal-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-teal-400 disabled:opacity-50 transition-all font-bold"
                    >
                      {isSubmittingReview ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <span>Submit Review</span>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="rounded-xl border border-dashed border-white/10 bg-slate-950/20 p-6 text-center">
                  <p className="text-sm text-slate-400">You must be logged in to share a review.</p>
                  <Link
                    href="/login"
                    className="mt-3 inline-block rounded-lg bg-slate-800 border border-white/5 px-4 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors"
                  >
                    Log In
                  </Link>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Sidebar Info & Action Panel */}
        <div className="space-y-6">
          
          {/* Quick Facts Card */}
          <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-6 shadow-2xl backdrop-blur-md">
            <h3 className="text-lg font-bold text-white mb-6">Quick Travel Facts</h3>
            
            <div className="space-y-6">
              
              {/* Season */}
              <div className="flex items-start space-x-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20">
                  <Calendar className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Best Season</span>
                  <span className="text-sm font-semibold text-slate-200 mt-0.5 block">
                    {destination.bestTimeToVisit || 'All year round'}
                  </span>
                </div>
              </div>

              {/* Budget */}
              <div className="flex items-start space-x-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Est. Budget Range</span>
                  <span className="text-sm font-semibold text-slate-200 mt-0.5 block">
                    {destination.budgetRange || 'Flexible'}
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* AI Planner Promotion CTA Card */}
          <div className="rounded-2xl border border-teal-500/15 bg-gradient-to-br from-slate-900 to-indigo-950/20 p-6 shadow-2xl backdrop-blur-md text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/25">
              <Sparkles className="h-5 w-5" />
            </div>
            
            <h3 className="mt-4 text-lg font-bold text-white">Generate AI Itinerary</h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-400">
              Instantly draft a structured daily schedule, accommodation ideas, and budget breakdown for {destination.name} using GPT.
            </p>

            <Link
              href={`/ai-planner?destinationId=${destination._id}&destinationName=${encodeURIComponent(destination.name)}`}
              className="mt-6 flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-teal-500 to-indigo-600 py-2.5 text-sm font-semibold text-white hover:from-teal-400 hover:to-indigo-500 shadow-lg shadow-teal-500/10 transition-all"
            >
              <span>Build Plan with AI</span>
            </Link>
          </div>

        </div>

      </div>

    </div>
  );
}
