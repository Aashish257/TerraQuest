// This file renders the page screen for guides in the browser.
'use client';

/**
 * /guides/page.tsx — Local Guides Directory
 *
 * Displays all available local guides with their profiles.
 * Authenticated travelers can send a booking request to any guide
 * by selecting one of their existing trips and adding a message.
 *
 * API:
 *  GET  /api/guides           — list all guides (public)
 *  GET  /api/trips            — fetch traveler's trips (to pick one for request)
 *  POST /api/guide-requests   — send booking request { guideId, tripId, message }
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import {
  User,
  MapPin,
  Star,
  Languages,
  Briefcase,
  Send,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  Search,
  ChevronDown,
  Users,
} from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────────────
interface Guide {
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
  rating?: number;
  totalReviews?: number;
}

interface Trip {
  _id: string;
  title: string;
  startDate: string;
  endDate: string;
  destinationId?: { name: string; state?: string };
}

// ─── Request Modal ───────────────────────────────────────────────────────────
function RequestModal({
  guide,
  trips,
  onClose,
  onSuccess,
}: {
  guide: Guide;
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
    if (!message.trim()) { setError('Please add a message for the guide.'); return; }
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
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to send request. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 shadow-2xl">

        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-white/10">
          <div>
            <h3 className="text-lg font-bold text-white">Request a Guide</h3>
            <p className="text-sm text-slate-400 mt-0.5">
              Sending to <span className="text-teal-400 font-semibold">{guide.userId?.name}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">

          {/* Guide summary */}
          <div className="flex items-center gap-3 rounded-xl bg-slate-800/50 border border-white/5 p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-indigo-500 text-white font-bold text-sm flex-shrink-0">
              {guide.userId?.name?.charAt(0) || '?'}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm text-white truncate">{guide.userId?.name}</p>
              <p className="text-xs text-slate-400 truncate flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {guide.location || 'India'}
              </p>
            </div>
          </div>

          {/* Trip selector */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Select Trip <span className="text-rose-400">*</span>
            </label>
            {trips.length === 0 ? (
              <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-amber-400">
                You have no trips yet.{' '}
                <a href="/trips" className="underline hover:text-amber-300">Create a trip first</a> to request a guide.
              </div>
            ) : (
              <div className="relative">
                <select
                  value={selectedTrip}
                  onChange={(e) => setSelectedTrip(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2.5 text-sm text-white appearance-none focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors pr-8"
                >
                  <option value="">Choose a trip…</option>
                  {trips.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.title}
                      {t.destinationId ? ` — ${t.destinationId.name}` : ''}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
              </div>
            )}
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Message to Guide <span className="text-rose-400">*</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={500}
              rows={3}
              placeholder="Tell the guide about your trip plans, requirements, or any questions…"
              className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2.5 text-sm text-white placeholder-slate-500 resize-none focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
            />
            <p className="text-right text-xs text-slate-600 mt-1">{message.length}/500</p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-rose-500/10 border border-rose-500/20 px-3 py-2.5 text-xs text-rose-400">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-white/10 bg-slate-800 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || trips.length === 0}
              className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-teal-500 to-indigo-600 py-2.5 text-sm font-semibold text-white hover:from-teal-400 hover:to-indigo-500 disabled:opacity-50 transition-all"
            >
              {isSubmitting ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</>
              ) : (
                <><Send className="h-4 w-4" /> Send Request</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Guide Card ──────────────────────────────────────────────────────────────
function GuideCard({
  guide,
  onRequest,
  sentRequests,
}: {
  guide: Guide;
  onRequest: (guide: Guide) => void;
  sentRequests: Set<string>;
}) {
  const alreadySent = sentRequests.has(guide._id);

  return (
    <div className="group rounded-2xl border border-white/10 bg-slate-900/50 p-5 backdrop-blur-sm hover:border-teal-500/30 hover:bg-slate-900/80 transition-all duration-200">

      {/* Top: Avatar + Name + Location */}
      <div className="flex items-start gap-4 mb-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-indigo-500 text-white text-xl font-bold flex-shrink-0 ring-2 ring-white/10 group-hover:ring-teal-500/30 transition-all">
          {guide.userId?.name?.charAt(0) || '?'}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-white text-base truncate">{guide.userId?.name}</h3>
          {guide.location && (
            <p className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
              <MapPin className="h-3 w-3 text-teal-500/70 flex-shrink-0" />
              {guide.location}
            </p>
          )}
          {/* Rating */}
          {guide.rating !== undefined && (
            <div className="flex items-center gap-1 mt-1">
              <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
              <span className="text-xs font-semibold text-amber-300">{guide.rating.toFixed(1)}</span>
              {guide.totalReviews !== undefined && (
                <span className="text-xs text-slate-500">({guide.totalReviews} reviews)</span>
              )}
            </div>
          )}
        </div>
        {/* Experience badge */}
        {guide.experience > 0 && (
          <div className="flex-shrink-0 rounded-full bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 text-[10px] font-bold text-indigo-400 uppercase tracking-wide">
            {guide.experience}y exp
          </div>
        )}
      </div>

      {/* Bio */}
      {guide.bio && (
        <p className="text-sm text-slate-400 leading-relaxed line-clamp-2 mb-4">
          {guide.bio}
        </p>
      )}

      {/* Tags row */}
      <div className="space-y-2 mb-4">
        {/* Expertise */}
        {guide.expertise?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {guide.expertise.slice(0, 4).map((e) => (
              <span key={e} className="rounded-full bg-teal-500/10 border border-teal-500/20 px-2 py-0.5 text-[10px] font-semibold text-teal-400">
                {e}
              </span>
            ))}
            {guide.expertise.length > 4 && (
              <span className="text-[10px] text-slate-600">+{guide.expertise.length - 4} more</span>
            )}
          </div>
        )}
        {/* Languages */}
        {guide.languages?.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <Languages className="h-3 w-3 text-slate-500 flex-shrink-0" />
            <span className="text-xs text-slate-500">{guide.languages.slice(0, 3).join(', ')}</span>
            {guide.languages.length > 3 && (
              <span className="text-[10px] text-slate-600">+{guide.languages.length - 3}</span>
            )}
          </div>
        )}
      </div>

      {/* CTA Buttons */}
      <div className="flex gap-2 mt-auto">
        <Link
          href={`/guides/${guide._id}`}
          className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-slate-800/60 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-700/60 hover:text-white transition-colors"
        >
          View Profile
        </Link>
        <button
          onClick={() => !alreadySent && onRequest(guide)}
          disabled={alreadySent}
          className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all ${
            alreadySent
              ? 'bg-teal-500/10 border border-teal-500/20 text-teal-400 cursor-default'
              : 'bg-gradient-to-r from-teal-500 to-indigo-600 text-white hover:from-teal-400 hover:to-indigo-500 shadow-lg shadow-teal-500/10'
          }`}
        >
          {alreadySent ? (
            <><CheckCircle className="h-4 w-4" /> Sent</>
          ) : (
            <><Send className="h-4 w-4" /> Request</>
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function LocalGuidesPage() {
  const router = useRouter();
  const { user, isAuthenticated, initialize } = useAuthStore();

  const [guides, setGuides] = useState<Guide[]>([]);
  const [filtered, setFiltered] = useState<Guide[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);
  const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => { initialize(); }, [initialize]);

  useEffect(() => {
    fetchGuides();
    if (isAuthenticated) fetchTrips();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!searchQuery.trim()) { setFiltered(guides); return; }
    const q = searchQuery.toLowerCase();
    setFiltered(guides.filter((g) =>
      g.userId?.name?.toLowerCase().includes(q) ||
      g.location?.toLowerCase().includes(q) ||
      g.expertise?.some((e) => e.toLowerCase().includes(q)) ||
      g.languages?.some((l) => l.toLowerCase().includes(q)) ||
      g.bio?.toLowerCase().includes(q)
    ));
  }, [searchQuery, guides]);

  const fetchGuides = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/guides?limit=50');
      if (res.data.success) setGuides(res.data.guides || []);
    } catch (err: any) {
      setError('Could not load guides. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTrips = async () => {
    try {
      const res = await api.get('/trips');
      if (res.data.success) setTrips(res.data.trips || []);
    } catch { /* non-critical */ }
  };

  const handleRequestSuccess = () => {
    if (selectedGuide) {
      setSentRequests((prev) => new Set([...Array.from(prev), selectedGuide._id]));
    }
    setSelectedGuide(null);
    setSuccessMsg('Request sent! The guide will respond from their dashboard.');
    setTimeout(() => setSuccessMsg(null), 5000);
  };

  return (
    <div className="w-full flex-grow flex flex-col">

      {/* ─── Hero ─────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-950/60 via-slate-950 to-teal-950/20 border-b border-white/5 px-4 sm:px-6 lg:px-8 py-12">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-indigo-500/5 blur-3xl" />
          <div className="absolute bottom-0 left-10 h-48 w-80 rounded-full bg-teal-500/5 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-7xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3">
            <Users className="h-3 w-3" />
            Local Experts
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            <span className="text-white">Find Your </span>
            <span className="bg-gradient-to-r from-indigo-400 to-teal-400 bg-clip-text text-transparent">
              Perfect Guide
            </span>
          </h1>
          <p className="mt-3 text-slate-400 max-w-lg">
            Connect with experienced local guides who know India&apos;s hidden trails, secret spots, and cultural gems — and book them for your next trip.
          </p>
          {!isLoading && (
            <p className="mt-2 text-xs text-slate-500">
              <span className="text-indigo-400 font-bold">{guides.length}</span> guides available
            </p>
          )}
        </div>
      </div>

      {/* ─── Content ──────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 w-full">

        {/* Success banner */}
        {successMsg && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-teal-500/20 bg-teal-500/5 p-4 text-sm text-teal-400">
            <CheckCircle className="h-5 w-5 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Auth nudge for unauthenticated users */}
        {!isAuthenticated && (
          <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4">
            <p className="text-sm text-indigo-300">
              <span className="font-semibold">Sign in</span> to send booking requests to guides.
            </p>
            <a
              href="/login"
              className="flex-shrink-0 rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors"
            >
              Sign In
            </a>
          </div>
        )}

        {/* Search */}
        <div className="relative mb-8">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, location, expertise, or language…"
            className="w-full rounded-xl border border-white/10 bg-slate-900/60 pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-colors backdrop-blur-sm"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 text-sm text-rose-400">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Loading */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500/30 border-t-indigo-400" />
            <p className="mt-4 text-sm text-slate-500">Loading guides…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 rounded-2xl border border-dashed border-white/10 bg-slate-900/20 text-center">
            <Users className="h-12 w-12 text-slate-700 mb-4" />
            <h3 className="text-lg font-bold text-white">
              {searchQuery ? 'No guides found' : 'No guides registered yet'}
            </h3>
            <p className="mt-2 text-sm text-slate-500 max-w-xs">
              {searchQuery
                ? 'Try different search terms — location, language, or expertise.'
                : 'Be the first to join as a local guide!'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-4 text-xs text-indigo-400 hover:text-indigo-300 underline"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <>
            <p className="text-xs text-slate-500 mb-4 font-medium">
              {searchQuery ? `${filtered.length} result${filtered.length !== 1 ? 's' : ''} for "${searchQuery}"` : `Showing all ${filtered.length} guides`}
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((guide) => (
                <GuideCard
                  key={guide._id}
                  guide={guide}
                  onRequest={(g) => {
                    if (!isAuthenticated) { router.push('/login?redirect=/guides'); return; }
                    setSelectedGuide(g);
                  }}
                  sentRequests={sentRequests}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* ─── Request Modal ────────────────────────────────────────────── */}
      {selectedGuide && (
        <RequestModal
          guide={selectedGuide}
          trips={trips}
          onClose={() => setSelectedGuide(null)}
          onSuccess={handleRequestSuccess}
        />
      )}
    </div>
  );
}
