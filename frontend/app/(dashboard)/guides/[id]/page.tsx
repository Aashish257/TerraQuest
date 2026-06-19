'use client';

/**
 * [id]/page.tsx — Guide Detail Profile Screen
 *
 * Displays detailed information about a selected local guide.
 * Shows bio, location, languages, years of experience, and expertise tags.
 * Integrates an interactive reviews panel for reading and posting ratings/comments.
 */

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import {
  Compass,
  MapPin,
  Calendar,
  Sparkles,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Star,
  Globe,
  Award,
  Mail,
  MessageSquare,
} from 'lucide-react';

interface GuideDetailProps {
  params: {
    id: string;
  };
}

interface Guide {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
    bio?: string;
  };
  experience: number;
  languages: string[];
  expertise: string[];
  location: string;
  bio: string;
  rating: number;
  totalReviews: number;
  createdAt: string;
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

export default function GuideDetailPage({ params }: GuideDetailProps) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  const [guide, setGuide] = useState<Guide | null>(null);
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

  const fetchDetail = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.get(`/guides/${params.id}`);
      if (res.data.success) {
        setGuide(res.data.guide);
      }
    } catch (err: any) {
      console.error('Error fetching guide details:', err);
      const msg = err.response?.data?.message || 'Could not retrieve guide profile details.';
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  }, [params.id]);

  const fetchReviews = useCallback(async () => {
    setIsReviewsLoading(true);
    try {
      const res = await api.get(`/reviews?targetId=${params.id}&targetType=guide`);
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
        targetType: 'guide',
        rating: formRating,
        comment: formComment,
      });
      if (res.data.success) {
        setSubmitSuccess(true);
        setFormComment('');
        setFormRating(5);
        fetchReviews(); // Refresh reviews list
        fetchDetail();  // Refresh guide details for aggregated rating
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
        <p className="mt-4 text-sm text-slate-500">Loading guide profile...</p>
      </div>
    );
  }

  if (errorMsg || !guide) {
    return (
      <div className="flex-grow flex flex-col justify-center items-center py-20 bg-slate-950 text-center px-4">
        <AlertCircle className="h-12 w-12 text-rose-500" />
        <h3 className="mt-4 text-lg font-bold text-white">Profile Not Found</h3>
        <p className="mt-2 text-sm text-slate-400 max-w-sm">{errorMsg || 'The requested guide profile could not be found.'}</p>
        <Link
          href="/guides"
          className="mt-6 flex items-center space-x-1.5 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Guides</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 w-full flex-grow flex flex-col justify-start">
      
      {/* Back navigation */}
      <div className="mb-6">
        <Link
          href="/guides"
          className="inline-flex items-center space-x-1.5 text-sm font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Guides</span>
        </Link>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Guide Information & Contact */}
        <div className="space-y-6">
          
          {/* Guide Header Card */}
          <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-6 shadow-2xl backdrop-blur-md text-center">
            
            {/* Avatar block */}
            <div className="mx-auto h-24 w-24 rounded-full bg-gradient-to-br from-teal-500 to-indigo-600 flex items-center justify-center text-4xl font-bold text-white shadow-lg mb-4">
              {guide.userId.name.charAt(0)}
            </div>

            <h1 className="text-2xl font-bold text-white tracking-tight">{guide.userId.name}</h1>
            
            <div className="flex items-center justify-center space-x-1 mt-1 text-sm text-slate-400">
              <MapPin className="h-4 w-4 text-teal-500" />
              <span>{guide.location}</span>
            </div>

            {/* Rating stats */}
            <div className="flex items-center justify-center space-x-1.5 mt-3">
              <div className="flex items-center space-x-1 rounded-full bg-amber-500/10 border border-amber-500/20 px-3 py-1 text-sm font-bold text-amber-400">
                <Star className="h-4 w-4 fill-amber-400" />
                <span>{guide.rating > 0 ? guide.rating.toFixed(1) : 'New'}</span>
              </div>
              <span className="text-xs text-slate-500">
                ({guide.totalReviews} {guide.totalReviews === 1 ? 'review' : 'reviews'})
              </span>
            </div>

            {/* Contact details */}
            <div className="mt-6 pt-6 border-t border-white/5 space-y-3.5 text-left">
              <div className="flex items-center space-x-3 text-slate-300">
                <Mail className="h-4 w-4 text-teal-400" />
                <span className="text-xs font-semibold select-all">{guide.userId.email}</span>
              </div>
              <div className="flex items-center space-x-3 text-slate-300">
                <Calendar className="h-4 w-4 text-indigo-400" />
                <span className="text-xs font-semibold">Registered since {new Date(guide.createdAt).getFullYear()}</span>
              </div>
            </div>

            {/* Direct Contact CTA */}
            <a
              href={`mailto:${guide.userId.email}?subject=TerraQuest Travel Inquiry`}
              className="mt-6 flex w-full items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-teal-500 to-indigo-600 py-2.5 text-sm font-semibold text-white hover:from-teal-400 hover:to-indigo-500 shadow-lg shadow-teal-500/10 transition-all"
            >
              <Mail className="h-4 w-4" />
              <span>Hire Guide</span>
            </a>
          </div>

          {/* Quick Facts Panel */}
          <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-6 shadow-2xl backdrop-blur-md">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-white/5 pb-2">Credentials</h3>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20">
                  <Award className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Experience</span>
                  <span className="text-xs font-semibold text-slate-300 mt-0.5 block">{guide.experience} Years Active</span>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Globe className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Languages spoken</span>
                  <span className="text-xs font-semibold text-slate-300 mt-0.5 block">{guide.languages.join(', ')}</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Bio, Expertise & Reviews */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Biography */}
          <div className="bg-slate-900/20 border border-white/5 p-6 rounded-2xl backdrop-blur-md">
            <h2 className="text-xl font-bold text-white mb-4">About Me</h2>
            <p className="text-slate-300 leading-relaxed text-sm whitespace-pre-line">
              {guide.bio || `Hello! My name is ${guide.userId.name}. I am a professional local guide specialized in revealing the cultural secrets and natural wonders of ${guide.location}. Contact me to design a custom off-beat tour.`}
            </p>
          </div>

          {/* Area of Expertise */}
          <div className="bg-slate-900/20 border border-white/5 p-6 rounded-2xl backdrop-blur-md">
            <h2 className="text-xl font-bold text-white mb-4">Areas of Expertise</h2>
            <div className="flex flex-wrap gap-2">
              {guide.expertise.map((exp, idx) => (
                <span
                  key={idx}
                  className="rounded-full bg-indigo-500/10 border border-indigo-500/25 px-4 py-1.5 text-xs font-semibold text-indigo-400"
                >
                  {exp}
                </span>
              ))}
            </div>
          </div>

          {/* Reviews Panel */}
          <div className="bg-slate-900/20 border border-white/5 p-6 rounded-2xl backdrop-blur-md space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <h2 className="text-xl font-bold text-white">Client Reviews & Endorsements</h2>
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
              <p className="text-slate-400 text-sm py-4 text-center">No reviews yet for {guide.userId.name}. Be the first to share your tour experience!</p>
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
              <h3 className="text-lg font-bold text-white mb-4">Rate this Guide</h3>
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
                      <span>Thank you! Your feedback has been recorded successfully.</span>
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
                      Tour Review Comment (Min 10 characters)
                    </label>
                    <textarea
                      id="comment"
                      value={formComment}
                      onChange={(e) => {
                        setFormComment(e.target.value);
                        setSubmitSuccess(false);
                      }}
                      rows={3}
                      placeholder="Describe your tour experience with this guide..."
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
                  <p className="text-sm text-slate-400">You must be logged in to rate a guide.</p>
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

      </div>

    </div>
  );
}
