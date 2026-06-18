'use client';

/**
 * [id]/page.tsx — Destination Detail Screen
 *
 * Displays details for a single selected destination.
 * Shows description, activities tags, travel season, budget range, and images.
 * Provides a call-to-action linking directly to the AI Travel Planner.
 */

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Destination } from '@/components/shared/DestinationCard';
import {
  Compass,
  MapPin,
  Calendar,
  Sparkles,
  ArrowLeft,
  Loader2,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';

interface DestinationDetailProps {
  params: {
    id: string;
  };
}

export default function DestinationDetailPage({ params }: DestinationDetailProps) {
  const router = useRouter();
  const [destination, setDestination] = useState<Destination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

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

          {/* Large image placeholder */}
          <div className="relative h-96 w-full rounded-2xl border border-white/5 bg-gradient-to-br from-slate-900 to-indigo-950/40 flex items-center justify-center overflow-hidden shadow-2xl">
            <Compass className="h-20 w-20 text-slate-800" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-80" />
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
