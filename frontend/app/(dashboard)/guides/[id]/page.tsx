'use client';

/**
 * /guides/[id]/page.tsx — Guide Profile Detail Page
 *
 * Shows a full guide profile including:
 *  - Avatar, name, location, bio, experience, languages, expertise
 *  - Star rating + total reviews summary
 *  - All reviews with star display, comment, reviewer name, date
 *  - Inline review submission form (authenticated travelers only)
 *  - "Request This Guide" button → opens trip-selector modal (same as list page)
 *
 * APIs used:
 *  GET  /api/guides/:id                          — guide profile
 *  GET  /api/reviews?targetId=:id&targetType=guide — guide reviews
 *  POST /api/reviews                             — submit review { targetId, targetType, rating, comment }
 *  GET  /api/trips                               — traveler's trips (for request modal)
 *  POST /api/guide-requests                      — send booking request
 */

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import {
  Star,
  MapPin,
  Languages,
  Briefcase,
  ChevronLeft,
  Send,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  ChevronDown,
  Calendar,
  MessageSquare,
  User,
  Award,
  Shield,
} from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────────────
interface GuideProfile {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  bio: string;
  location: string;
  languages: string[];
  expertise: string[];
  experience: number;
  rating: number;
  totalReviews: number;
  createdAt: string;
}

interface Review {
  _id: string;
  userId: {
    _id: string;
    name: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
}

interface Trip {
  _id: string;
  title: string;
  startDate: string;
  destinationId?: { name: string };
}

// ─── Star Display ────────────────────────────────────────────────────────────
function StarDisplay({ rating, max = 5, size = 'sm' }: { rating: number; max?: number; size?: 'sm' | 'lg' }) {
  const cls = size === 'lg' ? 'h-6 w-6' : 'h-3.5 w-3.5';
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          className={`${cls} ${i < Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-700'}`}
        />
      ))}
    </div>
  );
}

// ─── Star Picker ─────────────────────────────────────────────────────────────
function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          onMouseEnter={() => setHovered(s)}
          onMouseLeave={() => setHovered(0)}
          className="transition-transform hover:scale-110"
        >
          <Star
            className={`h-7 w-7 transition-colors ${
              s <= (hovered || value) ? 'fill-amber-400 text-amber-400' : 'text-slate-600'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

// ─── Request Modal ───────────────────────────────────────────────────────────
function RequestModal({
  guide,
  trips,
  onClose,
  onSuccess,
}: {
  guide: GuideProfile;
  trips: Trip[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [selectedTrip, setSelectedTrip] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTrip) { setError('Please select a trip.'); return; }
    if (!message.trim()) { setError('Please write a message for the guide.'); return; }
    setIsSubmitting(true);
    setError(null);
    try {
      await api.post('/guide-requests', {
        guideId: guide._id,
        tripId: selectedTrip,
        message: message.trim(),
      });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to send request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 shadow-2xl">
        <div className="flex items-start justify-between p-5 border-b border-white/10">
          <div>
            <h3 className="text-lg font-bold text-white">Send Booking Request</h3>
            <p className="text-sm text-slate-400 mt-0.5">
              To <span className="text-teal-400 font-semibold">{guide.userId?.name}</span>
            </p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Select Trip <span className="text-rose-400">*</span>
            </label>
            {trips.length === 0 ? (
              <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-amber-400">
                No trips yet.{' '}
                <a href="/trips" className="underline hover:text-amber-300">Create a trip first</a>.
              </div>
            ) : (
              <div className="relative">
                <select
                  value={selectedTrip}
                  onChange={(e) => setSelectedTrip(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2.5 text-sm text-white appearance-none focus:outline-none focus:ring-2 focus:ring-teal-500 pr-8"
                >
                  <option value="">Choose a trip…</option>
                  {trips.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.title}{t.destinationId ? ` — ${t.destinationId.name}` : ''}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Message <span className="text-rose-400">*</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={500}
              rows={3}
              placeholder="Tell the guide about your plans, requirements, dates…"
              className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2.5 text-sm text-white placeholder-slate-500 resize-none focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <p className="text-right text-xs text-slate-600 mt-1">{message.length}/500</p>
          </div>
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-rose-500/10 border border-rose-500/20 px-3 py-2.5 text-xs text-rose-400">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-white/10 bg-slate-800 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-700 transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || trips.length === 0}
              className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-teal-500 to-indigo-600 py-2.5 text-sm font-semibold text-white hover:from-teal-400 hover:to-indigo-500 disabled:opacity-50 transition-all"
            >
              {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</> : <><Send className="h-4 w-4" /> Send Request</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Review Card ─────────────────────────────────────────────────────────────
function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="rounded-xl border border-white/8 bg-slate-900/40 p-4">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-teal-500 text-white text-xs font-bold flex-shrink-0">
            {review.userId?.name?.charAt(0) || '?'}
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{review.userId?.name || 'Traveler'}</p>
            <p className="text-xs text-slate-500">
              {new Date(review.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>
        <StarDisplay rating={review.rating} />
      </div>
      <p className="text-sm text-slate-400 leading-relaxed">{review.comment}</p>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function GuideDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated, initialize } = useAuthStore();
  const guideId = params.id as string;

  const [guide, setGuide] = useState<GuideProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);

  // Review form state
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);

  useEffect(() => { initialize(); }, [initialize]);

  useEffect(() => {
    fetchGuide();
    fetchReviews();
    if (isAuthenticated) fetchTrips();
  }, [guideId, isAuthenticated]);

  // Check if current user already submitted a review
  useEffect(() => {
    if (user && reviews.length > 0) {
      setAlreadyReviewed(reviews.some((r) => r.userId?._id === user._id));
    }
  }, [reviews, user]);

  const fetchGuide = async () => {
    try {
      setIsLoading(true);
      const res = await api.get(`/guides/${guideId}`);
      if (res.data.success) setGuide(res.data.guide);
    } catch {
      setError('Guide not found or could not be loaded.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      setReviewsLoading(true);
      const res = await api.get(`/reviews?targetId=${guideId}&targetType=guide`);
      if (res.data.success) setReviews(res.data.reviews || []);
    } catch {
      // non-critical
    } finally {
      setReviewsLoading(false);
    }
  };

  const fetchTrips = async () => {
    try {
      const res = await api.get('/trips');
      if (res.data.success) setTrips(res.data.trips || []);
    } catch { /* non-critical */ }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (reviewRating === 0) { setReviewError('Please select a star rating.'); return; }
    if (reviewComment.trim().length < 10) { setReviewError('Comment must be at least 10 characters.'); return; }
    setReviewSubmitting(true);
    setReviewError(null);
    try {
      await api.post('/reviews', {
        targetId: guideId,
        targetType: 'guide',
        rating: reviewRating,
        comment: reviewComment.trim(),
      });
      setReviewSuccess(true);
      setReviewRating(0);
      setReviewComment('');
      setAlreadyReviewed(true);
      fetchReviews(); // refresh reviews list
      fetchGuide();   // refresh rating
    } catch (err: any) {
      setReviewError(err.response?.data?.message || err.response?.data?.error || 'Failed to submit review.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  // ── Loading ─────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500/30 border-t-indigo-400" />
          <p className="text-sm text-slate-500">Loading guide profile…</p>
        </div>
      </div>
    );
  }

  if (error || !guide) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center bg-slate-950 gap-4">
        <AlertCircle className="h-12 w-12 text-rose-500/50" />
        <p className="text-lg font-bold text-white">{error || 'Guide not found'}</p>
        <Link href="/guides" className="text-sm text-indigo-400 hover:underline">← Back to Local Guides</Link>
      </div>
    );
  }

  const ratingDistribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => Math.round(r.rating) === star).length,
  }));

  return (
    <div className="w-full flex-grow flex flex-col bg-slate-950">

      {/* ─── Back nav ─────────────────────────────────────────────────── */}
      <div className="border-b border-white/5 px-4 sm:px-6 lg:px-8 py-3">
        <Link
          href="/guides"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          All Local Guides
        </Link>
      </div>

      <div className="mx-auto max-w-5xl w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* ─── Profile Card ─────────────────────────────────────────────── */}
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/80 to-slate-900/40 overflow-hidden backdrop-blur-sm">
          {/* Decorative top bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-teal-500 to-indigo-500" />

          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-start gap-6">

              {/* Avatar */}
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-400 to-teal-500 text-white text-4xl font-bold flex-shrink-0 ring-4 ring-white/10">
                {guide.userId?.name?.charAt(0) || '?'}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                      {guide.userId?.name}
                    </h1>
                    {guide.location && (
                      <p className="flex items-center gap-1.5 text-sm text-slate-400 mt-1">
                        <MapPin className="h-3.5 w-3.5 text-teal-500/70" />
                        {guide.location}
                      </p>
                    )}
                  </div>

                  {/* Request button */}
                  {isAuthenticated && user?.role === 'traveler' && (
                    <button
                      onClick={() => requestSent ? null : setShowRequestModal(true)}
                      disabled={requestSent}
                      className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all flex-shrink-0 ${
                        requestSent
                          ? 'bg-teal-500/10 border border-teal-500/20 text-teal-400 cursor-default'
                          : 'bg-gradient-to-r from-teal-500 to-indigo-600 text-white hover:from-teal-400 hover:to-indigo-500 shadow-lg shadow-teal-500/10'
                      }`}
                    >
                      {requestSent
                        ? <><CheckCircle className="h-4 w-4" /> Request Sent</>
                        : <><Send className="h-4 w-4" /> Request This Guide</>
                      }
                    </button>
                  )}
                  {!isAuthenticated && (
                    <Link
                      href="/login?redirect=/guides"
                      className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold bg-gradient-to-r from-teal-500 to-indigo-600 text-white hover:from-teal-400 hover:to-indigo-500 transition-all"
                    >
                      <Send className="h-4 w-4" /> Sign In to Request
                    </Link>
                  )}
                </div>

                {/* Rating summary */}
                <div className="flex items-center gap-3 mt-3">
                  <StarDisplay rating={guide.rating} size="lg" />
                  <span className="text-xl font-bold text-amber-300">{guide.rating > 0 ? guide.rating.toFixed(1) : '—'}</span>
                  <span className="text-sm text-slate-500">
                    {guide.totalReviews > 0
                      ? `${guide.totalReviews} review${guide.totalReviews !== 1 ? 's' : ''}`
                      : 'No reviews yet'}
                  </span>
                </div>

                {/* Stats row */}
                <div className="flex flex-wrap gap-4 mt-4">
                  {guide.experience > 0 && (
                    <div className="flex items-center gap-1.5 text-sm text-slate-300">
                      <Briefcase className="h-4 w-4 text-indigo-400" />
                      <span className="font-semibold">{guide.experience}</span>
                      <span className="text-slate-500">yrs experience</span>
                    </div>
                  )}
                  {guide.languages?.length > 0 && (
                    <div className="flex items-center gap-1.5 text-sm text-slate-300">
                      <Languages className="h-4 w-4 text-teal-400" />
                      <span>{guide.languages.join(', ')}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 text-sm text-slate-500">
                    <Calendar className="h-4 w-4" />
                    <span>Joined {new Date(guide.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bio */}
            {guide.bio && (
              <div className="mt-6 pt-5 border-t border-white/5">
                <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-2">About</p>
                <p className="text-slate-300 leading-relaxed">{guide.bio}</p>
              </div>
            )}

            {/* Expertise */}
            {guide.expertise?.length > 0 && (
              <div className="mt-5">
                <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-2">Expertise</p>
                <div className="flex flex-wrap gap-2">
                  {guide.expertise.map((e) => (
                    <span key={e} className="rounded-full bg-teal-500/10 border border-teal-500/20 px-3 py-1 text-xs font-semibold text-teal-400">
                      {e}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ─── Reviews Section ───────────────────────────────────────────── */}
        <div>
          <div className="flex items-center gap-2 mb-5">
            <MessageSquare className="h-5 w-5 text-indigo-400" />
            <h2 className="text-xl font-bold text-white">
              Reviews
              {reviews.length > 0 && <span className="ml-2 text-sm text-slate-500 font-normal">({reviews.length})</span>}
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left: rating breakdown */}
            <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-5 h-fit">
              <div className="text-center mb-4">
                <p className="text-5xl font-extrabold text-white">{guide.rating > 0 ? guide.rating.toFixed(1) : '—'}</p>
                <StarDisplay rating={guide.rating} size="lg" />
                <p className="text-xs text-slate-500 mt-1">{guide.totalReviews} review{guide.totalReviews !== 1 ? 's' : ''}</p>
              </div>
              <div className="space-y-2">
                {ratingDistribution.map(({ star, count }) => {
                  const pct = guide.totalReviews > 0 ? (count / guide.totalReviews) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center gap-2 text-xs">
                      <span className="text-slate-400 w-3 flex-shrink-0">{star}</span>
                      <Star className="h-3 w-3 text-amber-400 flex-shrink-0" />
                      <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-400 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-slate-500 w-4 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: reviews list + write form */}
            <div className="lg:col-span-2 space-y-4">

              {/* Write a review */}
              {isAuthenticated && user?.role === 'traveler' && !alreadyReviewed && !reviewSuccess && (
                <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-5">
                  <p className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                    <Star className="h-4 w-4 text-amber-400" />
                    Write a Review
                  </p>
                  <form onSubmit={handleReviewSubmit} className="space-y-3">
                    <div>
                      <label className="text-xs text-slate-400 mb-1.5 block">Your Rating <span className="text-rose-400">*</span></label>
                      <StarPicker value={reviewRating} onChange={setReviewRating} />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 mb-1.5 block">Comment <span className="text-rose-400">*</span> <span className="text-slate-600">(min 10 chars)</span></label>
                      <textarea
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        maxLength={1000}
                        rows={3}
                        placeholder="Share your experience with this guide…"
                        className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2.5 text-sm text-white placeholder-slate-500 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <p className="text-right text-xs text-slate-600">{reviewComment.length}/1000</p>
                    </div>
                    {reviewError && (
                      <div className="flex items-center gap-2 rounded-lg bg-rose-500/10 border border-rose-500/20 px-3 py-2 text-xs text-rose-400">
                        <AlertCircle className="h-4 w-4 flex-shrink-0" />
                        {reviewError}
                      </div>
                    )}
                    <button
                      type="submit"
                      disabled={reviewSubmitting}
                      className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:from-indigo-400 hover:to-teal-500 disabled:opacity-50 transition-all"
                    >
                      {reviewSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</> : <><Send className="h-4 w-4" /> Submit Review</>}
                    </button>
                  </form>
                </div>
              )}

              {/* Review success message */}
              {reviewSuccess && (
                <div className="flex items-center gap-3 rounded-xl border border-teal-500/20 bg-teal-500/5 p-4 text-sm text-teal-400">
                  <CheckCircle className="h-5 w-5 flex-shrink-0" />
                  Thanks for your review! It has been submitted successfully.
                </div>
              )}

              {/* Already reviewed */}
              {alreadyReviewed && !reviewSuccess && (
                <div className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-900/40 p-3 text-sm text-slate-400">
                  <Shield className="h-4 w-4 text-slate-600 flex-shrink-0" />
                  You have already reviewed this guide.
                </div>
              )}

              {/* Sign in nudge */}
              {!isAuthenticated && (
                <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4 text-sm text-indigo-300 flex items-center justify-between gap-3">
                  <p><span className="font-semibold">Sign in</span> to leave a review.</p>
                  <Link href="/login" className="flex-shrink-0 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors">
                    Sign In
                  </Link>
                </div>
              )}

              {/* Reviews */}
              {reviewsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500/30 border-t-indigo-400" />
                </div>
              ) : reviews.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 rounded-xl border border-dashed border-white/10 text-center">
                  <MessageSquare className="h-10 w-10 text-slate-700 mb-3" />
                  <p className="text-sm font-semibold text-white">No reviews yet</p>
                  <p className="text-xs text-slate-500 mt-1">Be the first to review this guide.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {reviews.map((review) => (
                    <ReviewCard key={review._id} review={review} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Request Modal ────────────────────────────────────────────── */}
      {showRequestModal && (
        <RequestModal
          guide={guide}
          trips={trips}
          onClose={() => setShowRequestModal(false)}
          onSuccess={() => {
            setShowRequestModal(false);
            setRequestSent(true);
            setRequestSuccess(true);
          }}
        />
      )}
    </div>
  );
}
