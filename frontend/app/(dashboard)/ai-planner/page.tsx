'use client';

/**
 * page.tsx — AI Travel Planner Wizard
 *
 * Implements a wizard selector: destination search, budget bounds,
 * duration limits (1-30 days), and multi-select interest tags.
 * Displays history logs of user's saved plans, dynamic loaders,
 * and parses/renders Markdown text output into responsive cards.
 */

import { useEffect, useState, useCallback, Suspense } from 'react';
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
  TrendingUp,
  Bookmark,
  Share2,
  ArrowRight,
  BookOpen
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
  { value: 'Adventure', label: 'Adventure 🏄' },
  { value: 'Food', label: 'Food 🍔' },
  { value: 'Culture', label: 'Culture 🏛️' },
  { value: 'Nature', label: 'Nature 🌲' },
  { value: 'Nightlife', label: 'Nightlife 🍻' },
  { value: 'Spiritual', label: 'Spiritual 🧘' },
];

function parseBoldText(text: string) {
  const parts = text.split('**');
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="text-white font-extrabold bg-teal-500/10 px-1 rounded">
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
    <div className="space-y-4 text-slate-300 text-sm leading-relaxed font-sans">
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        // Main titles #
        if (trimmed.startsWith('# ')) {
          return (
            <h1 key={idx} className="text-2xl font-extrabold text-white mt-8 mb-4 flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-teal-400" />
              <span>{trimmed.replace('# ', '')}</span>
            </h1>
          );
        }
        // Section titles ##
        if (trimmed.startsWith('## ')) {
          return (
            <h2 key={idx} className="text-lg font-bold text-teal-400 mt-6 mb-3 border-b border-white/5 pb-1 uppercase tracking-wider">
              {trimmed.replace('## ', '')}
            </h2>
          );
        }
        // Day/Subsection titles ###
        if (trimmed.startsWith('### ')) {
          return (
            <h3 key={idx} className="text-sm font-bold text-indigo-400 mt-5 mb-2.5 flex items-center space-x-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
              <span>{trimmed.replace('### ', '')}</span>
            </h3>
          );
        }
        // List items - or *
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          const text = trimmed.substring(2);
          return (
            <div key={idx} className="flex items-start space-x-2.5 pl-4 py-0.5">
              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-teal-500/60 flex-shrink-0" />
              <p className="text-slate-300">{parseBoldText(text)}</p>
            </div>
          );
        }
        // Blank line
        if (!trimmed) return null;
        
        // Normal paragraph
        return (
          <p key={idx} className="pl-1">
            {parseBoldText(trimmed)}
          </p>
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

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Load destinations & history plans
  const fetchInitialData = useCallback(async () => {
    try {
      // 1. Fetch Destinations
      const destRes = await api.get('/destinations?limit=100');
      if (destRes.data.success) {
        setDestinations(destRes.data.destinations);
        // If there's a preselected destination query param, set it
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
      // 2. Fetch Plans history
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
    try {
      const res = await api.post('/ai/generate', {
        destinationId,
        budget: numBudget,
        duration,
        interests: selectedInterests,
      });

      if (res.data.success) {
        const newPlan = res.data.data;
        // Prepend to plans history
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
      <div className="flex-grow flex flex-col justify-center items-center py-20 bg-slate-950">
        <Loader2 className="h-10 w-10 text-teal-500 animate-spin" />
        <p className="mt-4 text-sm text-slate-500">Checking auth credentials...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 w-full flex-grow flex flex-col justify-start">
      
      {/* Header Panel */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl flex items-center space-x-2">
          <Sparkles className="h-8 w-8 text-teal-400 animate-pulse" />
          <span>AI Itinerary Planner</span>
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Generate custom day-by-day itineraries tailored to your budget and travel DNA.
        </p>
      </div>

      {/* Main Grid Layout */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start flex-grow">
        
        {/* Left Column: Form Wizard + History list */}
        <div className="space-y-8 lg:col-span-1">
          {/* Wizard Card */}
          <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-6 shadow-2xl backdrop-blur-md">
            <h3 className="text-base font-bold text-white mb-4 flex items-center space-x-2">
              <Compass className="h-4.5 w-4.5 text-teal-400" />
              <span>Itinerary Generator Wizard</span>
            </h3>

            {errorMsg && (
              <div className="mb-4 flex items-center space-x-2 rounded-lg bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-400">
                <AlertCircle className="h-4.5 w-4.5 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleGenerate} className="space-y-4">
              {/* Destination Dropdown */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Select Destination
                </label>
                {destLoading ? (
                  <div className="h-9 w-full bg-slate-950/60 animate-pulse rounded border border-white/5" />
                ) : (
                  <select
                    value={destinationId}
                    onChange={(e) => setDestinationId(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-200 outline-none focus:border-teal-500 transition-colors"
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
                <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  <span>Itinerary Duration</span>
                  <span className="text-teal-400 font-extrabold">{duration} Days</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="15"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full accent-teal-500 cursor-pointer"
                />
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold px-0.5 mt-0.5">
                  <span>1 Day</span>
                  <span>7 Days</span>
                  <span>15 Days</span>
                </div>
              </div>

              {/* Planned Budget */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Planned Budget (INR)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs text-slate-500">₹</span>
                  <input
                    type="number"
                    min="1000"
                    step="500"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 pl-6 pr-3 py-2 text-xs text-white outline-none focus:border-teal-500 transition-colors"
                    placeholder="15000"
                    required
                  />
                </div>
              </div>

              {/* Traveler Interests Tags list */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Select Travel Interests
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {INTERESTS_OPTIONS.map((opt) => {
                    const isSelected = selectedInterests.includes(opt.value);
                    return (
                      <button
                        type="button"
                        key={opt.value}
                        onClick={() => toggleInterest(opt.value)}
                        className={`text-left text-xs font-semibold rounded-lg border p-2.5 transition-all flex items-center justify-between ${
                          isSelected
                            ? 'border-teal-500 bg-teal-500/10 text-teal-400 shadow-md'
                            : 'border-white/5 bg-slate-950/60 text-slate-400 hover:border-white/10 hover:text-slate-200'
                        }`}
                      >
                        <span>{opt.label.split(' ')[0]}</span>
                        <span>{opt.label.split(' ')[1]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                disabled={isGenerating}
                className="mt-6 w-full rounded-lg bg-gradient-to-r from-teal-500 to-indigo-600 py-3 text-xs font-bold text-white shadow-lg shadow-teal-500/10 hover:from-teal-400 hover:to-indigo-500 disabled:opacity-50 transition-all hover:scale-[1.01] flex items-center justify-center space-x-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                    <span>Analyzing DNA & Generating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 text-teal-300" />
                    <span>Create AI Plan</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* History Panel */}
          <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-6 shadow-2xl backdrop-blur-md flex flex-col justify-start">
            <h3 className="text-base font-bold text-white mb-4 flex items-center space-x-2">
              <BookOpen className="h-4.5 w-4.5 text-indigo-400" />
              <span>Itinerary History</span>
            </h3>

            {plansLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-14 bg-slate-950/60 animate-pulse rounded border border-white/5" />
                ))}
              </div>
            ) : plans.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6 font-semibold">No previously saved plans.</p>
            ) : (
              <div className="space-y-3.5 max-h-80 overflow-y-auto pr-1">
                {plans.map((item) => {
                  const isSelected = selectedPlan?._id === item._id;
                  return (
                    <button
                      key={item._id}
                      onClick={() => setSelectedPlan(item)}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-teal-500/40 bg-teal-500/5 text-white'
                          : 'border-white/5 bg-slate-950/40 text-slate-400 hover:bg-slate-900/60 hover:text-slate-200'
                      }`}
                    >
                      <div className="max-w-[85%]">
                        <h4 className="text-xs font-bold truncate">
                          {item.duration} Days in {
                            typeof item.destinationId === 'object' && item.destinationId
                              ? (item.destinationId as any).name
                              : destinations.find((d) => d._id === (item.destinationId as any))?.name || 'India'
                          }
                        </h4>
                        <p className="text-[10px] text-slate-500 mt-1 font-semibold">
                          Budget: ₹{item.budget.toLocaleString('en-IN')} | {item.interests.slice(0, 2).join(', ')}
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-600" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: AI Plan display panel */}
        <div className="lg:col-span-2 h-full flex flex-col">
          <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-6 sm:p-8 shadow-2xl backdrop-blur-md flex-grow flex flex-col justify-start min-h-[500px]">
            {isGenerating ? (
              /* Loading Screen */
              <div className="flex-grow flex flex-col justify-center items-center py-20 text-center">
                <Loader2 className="h-12 w-12 text-teal-400 animate-spin" />
                <h4 className="mt-4 text-base font-bold text-white">Synthesizing Spot Coordinates</h4>
                <p className="mt-2 text-xs text-slate-400 max-w-xs leading-relaxed">
                  Our Indian travel expert agent is budgeting category splits, maps, stays, and activities for your DNA.
                </p>
              </div>
            ) : selectedPlan ? (
              /* Plan Active Display */
              <div className="flex flex-col h-full justify-between">
                <div>
                  {/* Top quick metadata banner */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-white/5 pb-4 mb-6">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Day-by-Day Schedule</span>
                      <h2 className="text-xl font-bold text-white mt-1">
                        Explore Plan for {
                          typeof selectedPlan.destinationId === 'object' && selectedPlan.destinationId
                            ? (selectedPlan.destinationId as any).name
                            : destinations.find((d) => d._id === (selectedPlan.destinationId as any))?.name || 'India'
                        }
                      </h2>
                    </div>

                    <div className="mt-4 sm:mt-0 flex space-x-2">
                      <button
                        onClick={handleCreateTripPrefilled}
                        className="rounded-lg bg-teal-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-teal-400 transition-colors flex items-center space-x-1.5 shadow-md shadow-teal-500/10"
                      >
                        <span>Convert to Trip</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Core MD renderer content */}
                  <div className="overflow-y-auto max-h-[550px] pr-2">
                    <MarkdownRenderer content={selectedPlan.generatedPlan} />
                  </div>
                </div>

                {/* Footer metrics info */}
                <div className="mt-8 border-t border-white/5 pt-4 flex flex-wrap gap-4 text-xs font-semibold text-slate-400">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4 text-indigo-400" />
                    <span>Duration: {selectedPlan.duration} Days</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <DollarSign className="h-4 w-4 text-teal-400" />
                    <span>Budget: ₹{selectedPlan.budget.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Bookmark className="h-4 w-4 text-amber-400" />
                    <span>Interests: {selectedPlan.interests.join(', ')}</span>
                  </div>
                </div>
              </div>
            ) : (
              /* Placeholder screen */
              <div className="flex-grow flex flex-col justify-center items-center py-20 text-center">
                <div className="rounded-2xl bg-teal-500/5 p-4 border border-teal-500/10 text-teal-400 mb-4 animate-bounce">
                  <Sparkles className="h-10 w-10" />
                </div>
                <h4 className="text-lg font-bold text-white">Your AI travel plan awaits</h4>
                <p className="mt-2 text-sm text-slate-400 max-w-sm leading-relaxed">
                  Configure the destination, budget, duration, and interests on the left to generate a personalized day-by-day travel plan instantly.
                </p>
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
      <div className="flex-grow flex flex-col justify-center items-center py-20 bg-slate-950">
        <Loader2 className="h-10 w-10 text-teal-500 animate-spin" />
        <p className="mt-4 text-sm text-slate-500">Loading planner layout...</p>
      </div>
    }>
      <AIPlannerContent />
    </Suspense>
  );
}
