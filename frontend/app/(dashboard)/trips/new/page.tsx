// This file renders the page screen for new in the browser.
'use client';

/**
 * new/page.tsx — Create Trip Form Screen
 *
 * Implements react-hook-form + zod resolver for input validation.
 * Queries /api/destinations to construct a select dropdown.
 * Posts data to backend POST /trips, redirecting to the list view on success.
 */

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { ArrowLeft, Loader2, AlertCircle, Compass } from 'lucide-react';

interface SimpleDestination {
  _id: string;
  name: string;
  country: string;
  state?: string;
}

const tripFormSchema = z
  .object({
    title: z.string().min(2, { message: 'Title must be at least 2 characters' }),
    destinationId: z.string().min(1, { message: 'Please select a destination' }),
    tripType: z.enum(['solo', 'group']),
    startDate: z.string().min(1, { message: 'Start date is required' }),
    endDate: z.string().min(1, { message: 'End date is required' }),
    budget: z.number().min(0, { message: 'Budget cannot be negative' }),
  })
  .refine((data) => new Date(data.endDate) > new Date(data.startDate), {
    message: 'End date must be strictly after start date',
    path: ['endDate'],
  });

type TripFormValues = z.infer<typeof tripFormSchema>;

function CreateTripForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryDestinationId = searchParams.get('destinationId') || '';
  const queryBudget = searchParams.get('budget') || '';
  const queryDuration = searchParams.get('duration') || '';
  const queryTitle = searchParams.get('title') || '';

  const { isAuthenticated, initialize, isLoading: authLoading } = useAuthStore();
  const [destinations, setDestinations] = useState<SimpleDestination[]>([]);
  const [destLoading, setDestLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Initialize auth
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Load destinations for the dropdown
  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const res = await api.get('/destinations?limit=100');
        if (res.data.success) {
          setDestinations(res.data.destinations);
        }
      } catch (err) {
        console.error('Error fetching destinations for dropdown:', err);
      } finally {
        setDestLoading(false);
      }
    };
    if (isAuthenticated) {
      fetchDestinations();
    }
  }, [isAuthenticated]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<TripFormValues>({
    resolver: zodResolver(tripFormSchema),
    defaultValues: {
      title: '',
      destinationId: '',
      tripType: 'solo',
      startDate: '',
      endDate: '',
      budget: 10000,
    },
  });

  // Prefill fields from URL query params
  useEffect(() => {
    if (queryTitle) {
      setValue('title', queryTitle);
    }
    if (queryDestinationId) {
      setValue('destinationId', queryDestinationId);
    }
    if (queryBudget) {
      const parsedBudget = Number(queryBudget);
      if (!isNaN(parsedBudget) && parsedBudget > 0) {
        setValue('budget', parsedBudget);
      }
    }
    
    // Automatically prefill start date to today and calculate end date from duration
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    setValue('startDate', todayStr);

    if (queryDuration) {
      const numDays = Number(queryDuration);
      if (!isNaN(numDays) && numDays > 0) {
        const endDateObj = new Date();
        endDateObj.setDate(today.getDate() + numDays);
        const endDateStr = endDateObj.toISOString().split('T')[0];
        setValue('endDate', endDateStr);
      }
    }
  }, [queryTitle, queryDestinationId, queryBudget, queryDuration, setValue]);

  // Guard routing
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  const onSubmit = async (data: TripFormValues) => {
    setSubmitLoading(true);
    setErrorMsg(null);

    try {
      const res = await api.post('/trips', data);
      if (res.data.success) {
        router.push('/trips');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to create trip. Please try again.';
      setErrorMsg(msg);
    } finally {
      setSubmitLoading(false);
    }
  };

  if (authLoading || destLoading) {
    return (
      <div className="flex-grow flex flex-col justify-center items-center py-20 bg-slate-950">
        <Loader2 className="h-10 w-10 text-teal-500 animate-spin" />
        <p className="mt-4 text-sm text-slate-500">Loading form options...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 w-full flex-grow flex flex-col justify-start">
      
      {/* Back CTA */}
      <div className="mb-6">
        <Link
          href="/trips"
          className="inline-flex items-center space-x-1.5 text-sm font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Trips</span>
        </Link>
      </div>

      {/* Main Container Card */}
      <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-8 shadow-2xl backdrop-blur-md">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-white">Create a New Trip</h1>
          <p className="mt-2 text-sm text-slate-400">
            Set up your destination coordinates, duration limits, and base budgets.
          </p>
        </div>

        {/* Global Error Banner */}
        {errorMsg && (
          <div className="mb-6 flex items-center space-x-2 rounded-lg bg-rose-500/10 border border-rose-500/20 p-3.5 text-sm text-rose-400">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Manual Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            
            {/* Title */}
            <div className="sm:col-span-2">
              <label htmlFor="title" className="block text-sm font-medium text-slate-300">
                Trip Title
              </label>
              <input
                type="text"
                id="title"
                {...register('title')}
                className={`mt-1.5 block w-full rounded-lg bg-slate-950 border px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors ${
                  errors.title ? 'border-rose-500/50' : 'border-white/10'
                }`}
                placeholder="e.g. Goa Beach Vacation 2025"
              />
              {errors.title && (
                <p className="mt-1 text-xs text-rose-400">{errors.title.message}</p>
              )}
            </div>

            {/* Destination Selector */}
            <div className="sm:col-span-2">
              <label htmlFor="destinationId" className="block text-sm font-medium text-slate-300">
                Select Destination
              </label>
              <select
                id="destinationId"
                {...register('destinationId')}
                className={`mt-1.5 block w-full rounded-lg bg-slate-950 border px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors ${
                  errors.destinationId ? 'border-rose-500/50' : 'border-white/10'
                }`}
              >
                <option value="">-- Choose a Destination --</option>
                {destinations.map((dest) => (
                  <option key={dest._id} value={dest._id}>
                    {dest.name} ({dest.state ? `${dest.state}, ` : ''}{dest.country})
                  </option>
                ))}
              </select>
              {errors.destinationId && (
                <p className="mt-1 text-xs text-rose-400">{errors.destinationId.message}</p>
              )}
            </div>

            {/* Start Date */}
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-slate-300">
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                {...register('startDate')}
                className={`mt-1.5 block w-full rounded-lg bg-slate-950 border px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors ${
                  errors.startDate ? 'border-rose-500/50' : 'border-white/10'
                }`}
              />
              {errors.startDate && (
                <p className="mt-1 text-xs text-rose-400">{errors.startDate.message}</p>
              )}
            </div>

            {/* End Date */}
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-slate-300">
                End Date
              </label>
              <input
                type="date"
                id="endDate"
                {...register('endDate')}
                className={`mt-1.5 block w-full rounded-lg bg-slate-950 border px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors ${
                  errors.endDate ? 'border-rose-500/50' : 'border-white/10'
                }`}
              />
              {errors.endDate && (
                <p className="mt-1 text-xs text-rose-400">{errors.endDate.message}</p>
              )}
            </div>

            {/* Planned Budget */}
            <div>
              <label htmlFor="budget" className="block text-sm font-medium text-slate-300">
                Planned Budget (INR)
              </label>
              <input
                type="number"
                id="budget"
                {...register('budget', { valueAsNumber: true })}
                className={`mt-1.5 block w-full rounded-lg bg-slate-950 border px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors ${
                  errors.budget ? 'border-rose-500/50' : 'border-white/10'
                }`}
                placeholder="10000"
              />
              {errors.budget && (
                <p className="mt-1 text-xs text-rose-400">{errors.budget.message}</p>
              )}
            </div>

            {/* Trip Type Select */}
            <div>
              <label htmlFor="tripType" className="block text-sm font-medium text-slate-300">
                Trip Category
              </label>
              <select
                id="tripType"
                {...register('tripType')}
                className="mt-1.5 block w-full rounded-lg bg-slate-950 border border-white/10 px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
              >
                <option value="solo">Solo Trip</option>
                <option value="group">Group Trip</option>
              </select>
            </div>

          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitLoading}
            className="flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-teal-500 to-indigo-600 py-3 text-sm font-semibold text-white hover:from-teal-400 hover:to-indigo-500 disabled:opacity-50 transition-all hover:scale-[1.01]"
          >
            {submitLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>Creating Itinerary...</span>
              </>
            ) : (
              <span>Create Trip Plan</span>
            )}
          </button>
        </form>

      </div>
    </div>
  );
}

export default function CreateTripPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-grow flex flex-col justify-center items-center py-20 bg-slate-950">
          <Loader2 className="h-10 w-10 text-teal-500 animate-spin" />
          <p className="mt-4 text-sm text-slate-500">Loading form...</p>
        </div>
      }
    >
      <CreateTripForm />
    </Suspense>
  );
}
