// This file renders the page screen for ai planner in the browser.
'use client';

/**
 * page.tsx — AI Travel Planner Wizard
 *
 * Implements a wizard selector: destination search, budget bounds,
 * duration limits (1-30 days), and multi-select interest tags.
 * Displays history logs of user's saved plans, dynamic loaders,
 * and parses/renders Markdown text output into responsive cards.
 */

import { useEffect, useState, useCallback, Suspense, useRef } from 'react';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import {
  Sparkles,
  Calendar,
  DollarSign,
  Compass,
  Loader2,
  AlertCircle,
  Clock,
  ChevronRight,
  Bookmark,
  ArrowRight,
  BookOpen,
  Mountain,
  Utensils,
  Landmark,
  Trees,
  Music,
  Flame,
  MapPin,
  Zap,
} from 'lucide-react';

interface Destination {
  _id: string;
  name: string;
  country: string;
  state?: string;
}

interface AIPlan {
  _id: string;
  destinationId: {
    _id: string;
    name: string;
    country: string;
  };
  budget: number;
  duration: number;
  interests: string[];
  generatedPlan: string;
  createdAt: string;
}

const INTERESTS_OPTIONS = [
  { value: 'Adventure', label: 'Adventure', icon: Mountain },
  { value: 'Food', label: 'Food', icon: Utensils },
  { value: 'Culture', label: 'Culture', icon: Landmark },
  { value: 'Nature', label: 'Nature', icon: Trees },
  { value: 'Nightlife', label: 'Nightlife', icon: Music },
  { value: 'Spiritual', label: 'Spiritual', icon: Flame },
];

function parseBoldText(text: string) {
  const parts = text.split('**');
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="text-white font-extrabold" style={{ background: 'rgba(16,185,129,0.1)', padding: '0 3px', borderRadius: '3px' }}>
        {part}
      </strong>
    ) : (
      part
    )
  );
}

function MarkdownRenderer({ content }: { content: string }) {
  const lines = content.split('\n');
  return (
    <div className="space-y-4 text-sm leading-relaxed" style={{ color: 'var(--color-text-2)', fontFamily: 'var(--font-body)' }}>
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        if (trimmed.startsWith('# ')) {
          return (
            <h1 key={idx} className="text-2xl font-bold mt-8 mb-4 flex items-center gap-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-1)' }}>
              <Sparkles className="h-5 w-5 flex-shrink-0" style={{ color: 'var(--color-accent)' }} />
              <span>{trimmed.replace('# ', '')}</span>
            </h1>
          );
        }
        if (trimmed.startsWith('## ')) {
          return (
            <h2 key={idx} className="text-base font-bold mt-6 mb-3 pb-1 uppercase tracking-wider" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-accent)', borderBottom: '1px solid var(--color-border)' }}>
              {trimmed.replace('## ', '')}
            </h2>
          );
        }
        if (trimmed.startsWith('### ')) {
          return (
            <h3 key={idx} className="text-sm font-bold mt-5 mb-2 flex items-center gap-2" style={{ fontFamily: 'var(--font-display)', color: '#818cf8' }}>
              <span className="h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ background: '#818cf8' }} />
              <span>{trimmed.replace('### ', '')}</span>
            </h3>
          );
        }
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          const text = trimmed.substring(2);
          return (
            <div key={idx} className="flex items-start gap-3 pl-4 py-0.5">
              <span className="mt-2 h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ background: 'rgba(16,185,129,0.6)' }} />
              <p style={{ color: 'var(--color-text-2)' }}>{parseBoldText(text)}</p>
            </div>
          );
        }
        if (!trimmed) return null;
        return (
          <p key={idx} className="pl-1">{parseBoldText(trimmed)}</p>
        );
      })}
    </div>
  );
}

function AIPlannerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedDestId = searchParams.get('destinationId');

  const { isAuthenticated, initialize, isLoading: authLoading } = useAuthStore();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [plans, setPlans] = useState<AIPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<AIPlan | null>(null);

  // Loaders
  const [destLoading, setDestLoading] = useState(true);
  const [plansLoading, setPlansLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  // Errors
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form Fields State
  const [destinationId, setDestinationId] = useState('');
  const [budget, setBudget] = useState('15000');
  const [duration, setDuration] = useState(5);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [isSlowWarning, setIsSlowWarning] = useState(false);
  const slowTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Get parameters from URL
  const preselectedDuration = searchParams.get('duration');
  const preselectedBudget = searchParams.get('budget');

  useEffect(() => {
    initialize();
    if (preselectedDestId) setDestinationId(preselectedDestId);
    if (preselectedDuration) setDuration(Number(preselectedDuration) || 5);
    if (preselectedBudget) setBudget(preselectedBudget);
  }, [initialize, preselectedDestId, preselectedDuration, preselectedBudget]);

  // Load destinations & history plans
  const fetchInitialData = useCallback(async () => {
    try {
      const destRes = await api.get('/destinations?limit=100');
      if (destRes.data.success) {
        setDestinations(destRes.data.destinations);
        if (preselectedDestId) {
          setDestinationId(preselectedDestId);
        } else if (destRes.data.destinations.length > 0) {
          setDestinationId(destRes.data.destinations[0]._id);
        }
      }
    } catch (err) {
      console.error('Error fetching destinations:', err);
    } finally {
      setDestLoading(false);
    }

    try {
      const plansRes = await api.get('/ai/plans');
      if (plansRes.data.success) {
        setPlans(plansRes.data.plans);
        if (plansRes.data.plans.length > 0) {
          setSelectedPlan(plansRes.data.plans[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching history plans:', err);
    } finally {
      setPlansLoading(false);
    }
  }, [preselectedDestId]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchInitialData();
    } else if (!authLoading) {
      router.push('/login');
    }
  }, [isAuthenticated, fetchInitialData, router, authLoading]);

  const toggleInterest = (val: string) => {
    if (selectedInterests.includes(val)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== val));
    } else {
      setSelectedInterests([...selectedInterests, val]);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!destinationId) {
      setErrorMsg('Please select a destination');
      return;
    }
    if (selectedInterests.length === 0) {
      setErrorMsg('Please choose at least one traveler interest');
      return;
    }
    const numBudget = Number(budget);
    if (isNaN(numBudget) || numBudget <= 0) {
      setErrorMsg('Budget must be a positive number');
      return;
    }

    setIsGenerating(true);
    setIsSlowWarning(false);
    slowTimerRef.current = setTimeout(() => setIsSlowWarning(true), 12000);
    try {
      const res = await api.post('/ai/generate', {
        destinationId,
        budget: numBudget,
        duration,
        interests: selectedInterests,
      });

      if (res.data.success) {
        const newPlan = res.data.data;
        setPlans((prev) => [newPlan, ...prev]);
        setSelectedPlan(newPlan);
      }
    } catch (err: any) {
      console.error('Error generating AI plan:', err);
      if (err.response?.status === 503) {
        setErrorMsg('AI Service is temporarily overloaded. Falling back to cached guides.');
      } else {
        setErrorMsg(err.response?.data?.message || 'Failed to generate travel plan. Please try again.');
      }
    } finally {
      setIsGenerating(false);
      setIsSlowWarning(false);
      if (slowTimerRef.current) clearTimeout(slowTimerRef.current);
    }
  };

  // Convert AI plan to editable Trip Form prefills
  const handleCreateTripPrefilled = () => {
    if (!selectedPlan) return;
    const isDestObj = typeof selectedPlan.destinationId === 'object' && selectedPlan.destinationId !== null;
    const destId = isDestObj ? (selectedPlan.destinationId as any)._id : selectedPlan.destinationId;
    const destName = isDestObj
      ? (selectedPlan.destinationId as any).name
      : destinations.find((d) => d._id === (selectedPlan.destinationId as any))?.name || 'India';

    router.push(
      `/trips/new?destinationId=${destId}&budget=${selectedPlan.budget}&duration=${selectedPlan.duration}&title=AI Plan: ${destName} Explore`
    );
  };

  if (authLoading) {
    return (
      <div className="flex-grow flex flex-col justify-center items-center py-20">
        <div className="glass rounded-2xl px-8 py-6 flex flex-col items-center gap-4">
          <div className="relative">
            <div className="absolute -inset-3 rounded-full animate-pulse" style={{ background: 'rgba(16,185,129,0.15)' }} />
            <Loader2 className="relative h-10 w-10 animate-spin" style={{ color: 'var(--color-accent)' }} />
          </div>
          <p className="text-sm font-semibold" style={{ color: 'var(--color-text-3)' }}>Checking auth credentials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 w-full flex-grow flex flex-col justify-start">

      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
              <Sparkles className="h-5 w-5" style={{ color: 'var(--color-accent)' }} />
            </div>
            <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-1)' }}>
              AI Itinerary Planner
            </h1>
          </div>
          <p className="text-sm" style={{ color: 'var(--color-text-3)', fontFamily: 'var(--font-body)' }}>
            Generate custom day-by-day itineraries tailored to your budget and travel DNA.
          </p>
        </div>
        <Link
          href="/trips"
          className="btn btn-ghost text-sm hidden sm:inline-flex"
        >
          <MapPin className="h-4 w-4" />
          My Trips
        </Link>
      </div>

      {/* Main Grid Layout */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start flex-grow">

        {/* Left Column: Form Wizard + History list */}
        <div className="space-y-6 lg:col-span-1">

          {/* Wizard Card */}
          <div className="glass-strong rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <Compass className="h-4 w-4" style={{ color: 'var(--color-accent)' }} />
              <h3 className="text-sm font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-1)' }}>
                Itinerary Generator
              </h3>
            </div>

            {/* Error message */}
            {errorMsg && (
              <div className="mb-4 flex items-start gap-2 rounded-xl p-3 text-xs"
                style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)', color: '#fb7185' }}>
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleGenerate} className="space-y-5">

              {/* Destination Dropdown */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-3)' }}>
                  Destination
                </label>
                {destLoading ? (
                  <div className="skeleton h-10 w-full rounded-xl" />
                ) : (
                  <select
                    value={destinationId}
                    onChange={(e) => setDestinationId(e.target.value)}
                    className="input-field text-sm"
                    style={{ fontFamily: 'var(--font-body)' }}
                    required
                  >
                    <option value="">-- Choose Target Spot --</option>
                    {destinations.map((dest) => (
                      <option key={dest._id} value={dest._id}>
                        {dest.name} ({dest.state ? `${dest.state}, ` : ''}{dest.country})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Duration Slider */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-3)' }}>
                    Duration
                  </label>
                  <span className="font-mono text-sm font-bold" style={{ color: 'var(--color-accent)' }}>{duration} Days</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="15"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full cursor-pointer"
                  style={{ accentColor: 'var(--color-accent)' }}
                />
                <div className="flex items-center justify-between mt-1 px-0.5">
                  <span className="font-mono text-xs" style={{ color: 'var(--color-text-3)' }}>1</span>
                  <span className="font-mono text-xs" style={{ color: 'var(--color-text-3)' }}>7</span>
                  <span className="font-mono text-xs" style={{ color: 'var(--color-text-3)' }}>15</span>
                </div>
              </div>

              {/* Budget */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-3)' }}>
                  Budget (INR)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-mono" style={{ color: 'var(--color-text-3)' }}>₹</span>
                  <input
                    type="number"
                    min="1000"
                    step="500"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="input-field pl-7 font-mono text-sm"
                    placeholder="15000"
                    required
                  />
                </div>
              </div>

              {/* Travel Interests */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--color-text-3)' }}>
                  Travel Interests
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {INTERESTS_OPTIONS.map((opt) => {
                    const isSelected = selectedInterests.includes(opt.value);
                    const Icon = opt.icon;
                    return (
                      <button
                        type="button"
                        key={opt.value}
                        onClick={() => toggleInterest(opt.value)}
                        className="flex items-center gap-2 rounded-xl p-2.5 text-xs font-semibold text-left transition-all duration-200"
                        style={{
                          border: isSelected ? '1px solid rgba(16,185,129,0.4)' : '1px solid var(--color-border)',
                          background: isSelected ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.02)',
                          color: isSelected ? 'var(--color-accent)' : 'var(--color-text-3)',
                          transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                        }}
                      >
                        <Icon className="h-3.5 w-3.5 flex-shrink-0" />
                        <span>{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Generate Button */}
              <button
                type="submit"
                disabled={isGenerating}
                className="btn btn-primary w-full mt-2"
                style={{ opacity: isGenerating ? 0.7 : 1 }}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Generating Plan...</span>
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    <span>Generate AI Plan</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* History Panel */}
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="h-4 w-4" style={{ color: '#818cf8' }} />
              <h3 className="text-sm font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-1)' }}>
                Plan History
              </h3>
              {plans.length > 0 && (
                <span className="ml-auto font-mono text-xs px-2 py-0.5 rounded-md"
                  style={{ background: 'rgba(129,140,248,0.1)', color: '#818cf8', border: '1px solid rgba(129,140,248,0.2)' }}>
                  {plans.length}
                </span>
              )}
            </div>

            {plansLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="skeleton h-14 rounded-xl" />
                ))}
              </div>
            ) : plans.length === 0 ? (
              <div className="py-8 text-center">
                <Bookmark className="h-8 w-8 mx-auto mb-2" style={{ color: 'var(--color-text-3)' }} />
                <p className="text-xs font-semibold" style={{ color: 'var(--color-text-3)' }}>No saved plans yet</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {plans.map((item) => {
                  const isSelected = selectedPlan?._id === item._id;
                  return (
                    <button
                      key={item._id}
                      onClick={() => setSelectedPlan(item)}
                      className="w-full text-left p-3 rounded-xl transition-all flex items-center justify-between gap-2"
                      style={{
                        border: isSelected ? '1px solid rgba(16,185,129,0.35)' : '1px solid var(--color-border)',
                        background: isSelected ? 'rgba(16,185,129,0.06)' : 'transparent',
                      }}
                    >
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold truncate" style={{ color: isSelected ? 'var(--color-text-1)' : 'var(--color-text-2)' }}>
                          {item.duration} Days in{' '}
                          {typeof item.destinationId === 'object' && item.destinationId
                            ? (item.destinationId as any).name
                            : destinations.find((d) => d._id === (item.destinationId as any))?.name || 'India'}
                        </h4>
                        <p className="text-xs mt-0.5 font-mono" style={{ color: 'var(--color-text-3)' }}>
                          ₹{item.budget.toLocaleString('en-IN')} · {item.interests.slice(0, 2).join(', ')}
                        </p>
                      </div>
                      <ChevronRight className="h-3.5 w-3.5 flex-shrink-0" style={{ color: isSelected ? 'var(--color-accent)' : 'var(--color-text-3)' }} />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: AI Plan display panel */}
        <div className="lg:col-span-2 h-full flex flex-col">
          <div className="glass-strong rounded-2xl p-6 sm:p-8 flex-grow flex flex-col min-h-[520px]">

            {/* Terminal-style top bar */}
            <div className="flex items-center gap-2 mb-5 pb-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
              <div className="flex gap-1.5">
                <span className="h-3 w-3 rounded-full" style={{ background: '#f87171' }} />
                <span className="h-3 w-3 rounded-full" style={{ background: '#fbbf24' }} />
                <span className="h-3 w-3 rounded-full" style={{ background: 'var(--color-accent)' }} />
              </div>
              <span className="ml-2 text-xs font-mono" style={{ color: 'var(--color-text-3)' }}>terraquest-ai-planner</span>
              {selectedPlan && (
                <span className="ml-auto flex items-center gap-1.5 text-xs font-mono px-2 py-0.5 rounded-md"
                  style={{ background: 'rgba(16,185,129,0.08)', color: 'var(--color-accent)', border: '1px solid rgba(16,185,129,0.2)' }}>
                  <span className="dot-pulse" />
                  live
                </span>
              )}
            </div>

            {isGenerating ? (
              /* Generating State */
              <div className="flex-grow flex flex-col justify-center items-center py-16 text-center">
                <div className="relative mb-6">
                  <div className="h-20 w-20 rounded-full mx-auto animate-spin"
                    style={{ border: '3px solid rgba(16,185,129,0.2)', borderTopColor: 'var(--color-accent)' }} />
                  <Sparkles className="absolute inset-0 m-auto h-7 w-7" style={{ color: 'var(--color-accent)' }} />
                </div>
                <h4 className="text-lg font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-1)' }}>
                  Crafting Your Itinerary
                </h4>
                <p className="mt-2 text-sm max-w-xs leading-relaxed" style={{ color: 'var(--color-text-3)' }}>
                  Mapping stays, activities and budget splits tailored for your trip.
                </p>

                {/* Step indicators */}
                <div className="mt-8 flex flex-col gap-3 text-left w-full max-w-xs">
                  {[
                    'Analyzing destination data',
                    'Building day-by-day schedule',
                    'Optimizing for your budget',
                  ].map((step, i) => (
                    <div key={i} className="flex items-center gap-3 text-xs">
                      <div className="h-2 w-2 rounded-full flex-shrink-0"
                        style={{ background: i === 0 ? 'var(--color-accent)' : 'rgba(255,255,255,0.08)', animation: i === 0 ? 'dot-pulse 2s ease-in-out infinite' : 'none' }} />
                      <span style={{ color: i === 0 ? 'var(--color-text-2)' : 'var(--color-text-3)' }}>{step}</span>
                    </div>
                  ))}
                </div>

                {isSlowWarning && (
                  <div className="mt-6 flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs max-w-xs"
                    style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', color: '#fbbf24' }}>
                    <Clock className="h-4 w-4 flex-shrink-0" />
                    <span>AI is taking longer than usual. Still working...</span>
                  </div>
                )}
              </div>

            ) : selectedPlan ? (
              /* Plan Display */
              <div className="flex flex-col h-full">
                <div>
                  {/* Plan metadata header */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-3)', fontFamily: 'var(--font-mono)' }}>
                        Day-by-Day Schedule
                      </span>
                      <h2 className="text-xl font-bold mt-1" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-1)' }}>
                        Explore Plan for{' '}
                        {typeof selectedPlan.destinationId === 'object' && selectedPlan.destinationId
                          ? (selectedPlan.destinationId as any).name
                          : destinations.find((d) => d._id === (selectedPlan.destinationId as any))?.name || 'India'}
                      </h2>
                    </div>
                    <button
                      onClick={handleCreateTripPrefilled}
                      className="btn btn-primary text-sm shrink-0"
                    >
                      <span>Convert to Trip</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Markdown content */}
                  <div className="overflow-y-auto pr-2" style={{ maxHeight: '440px' }}>
                    <MarkdownRenderer content={selectedPlan.generatedPlan} />
                  </div>
                </div>

                {/* Footer metrics */}
                <div className="mt-auto pt-4" style={{ borderTop: '1px solid var(--color-border)' }}>
                  <div className="flex flex-wrap gap-4">
                    {[
                      { icon: Clock, label: `${selectedPlan.duration} Days`, color: '#818cf8' },
                      { icon: DollarSign, label: `₹${selectedPlan.budget.toLocaleString('en-IN')}`, color: 'var(--color-accent)' },
                      { icon: Bookmark, label: selectedPlan.interests.join(', '), color: '#fbbf24' },
                    ].map(({ icon: Icon, label, color }, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: 'var(--color-text-3)', fontFamily: 'var(--font-mono)' }}>
                        <Icon className="h-4 w-4 flex-shrink-0" style={{ color }} />
                        <span>{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            ) : (
              /* Empty placeholder */
              <div className="flex-grow flex flex-col justify-center items-center py-16 text-center">
                <div className="p-5 rounded-2xl mb-5 animate-float"
                  style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.12)' }}>
                  <Sparkles className="h-12 w-12" style={{ color: 'var(--color-accent)' }} />
                </div>
                <h4 className="text-xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-1)' }}>
                  Your AI travel plan awaits
                </h4>
                <p className="mt-3 text-sm max-w-sm leading-relaxed" style={{ color: 'var(--color-text-3)' }}>
                  Configure destination, budget, duration and interests on the left to generate a personalized day-by-day itinerary.
                </p>
                <div className="mt-6 flex items-center gap-2 text-xs font-semibold" style={{ color: 'var(--color-text-3)' }}>
                  <div className="dot-pulse" />
                  <span>Ready to generate</span>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default function AIPlannerPage() {
  return (
    <Suspense fallback={
      <div className="flex-grow flex flex-col justify-center items-center py-20">
        <div className="glass rounded-2xl px-8 py-6 flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin" style={{ color: 'var(--color-accent)' }} />
          <p className="text-sm font-semibold" style={{ color: 'var(--color-text-3)' }}>Loading planner layout...</p>
        </div>
      </div>
    }>
      <AIPlannerContent />
    </Suspense>
  );
}
