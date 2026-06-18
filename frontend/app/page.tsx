'use client';

/**
 * page.tsx — TerraQuest Landing Page
 *
 * Provides a high-fidelity introduction to the application.
 * Highlights: AI planning, hidden places, and budget tracking features.
 * Rich aesthetics: Sleek dark backgrounds, glowing gradient colors, hover animations.
 */

import Link from 'next/link';
import { Compass, Calendar, Sparkles, Shield, MapPin, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  const features = [
    {
      title: 'AI Travel Planner',
      description: 'Get instant, tailored day-by-day itineraries based on your budget, travel duration, and personal interests.',
      icon: Sparkles,
      color: 'from-teal-400 to-cyan-500',
    },
    {
      title: 'Budget & Expenses Tracker',
      description: 'Log and monitor actual trip expenditures against your initial budget. View breakdown charts by category.',
      icon: Calendar,
      color: 'from-indigo-500 to-purple-600',
    },
    {
      title: 'Guide-Curated Hidden Places',
      description: 'Explore offbeat, guide-submitted secret spots across India. Bypass the crowded tourist traps.',
      icon: Compass,
      color: 'from-pink-500 to-rose-500',
    },
  ];

  const steps = [
    {
      step: '01',
      title: 'Pick a Destination',
      desc: 'Browse our collection of verified Indian travel hotspots or search by state/activities.',
    },
    {
      step: '02',
      title: 'Generate with AI',
      desc: 'Input your preferences (budget, duration, and DNA interests) to render a personalized itinerary.',
    },
    {
      step: '03',
      title: 'Track & Manage',
      desc: 'Form a trip schedule, invite members, log daily budget entries, and explore local secrets.',
    },
  ];

  return (
    <div className="relative isolate overflow-hidden bg-slate-950 flex-grow flex flex-col justify-center">
      {/* Background glowing gradients */}
      <div
        className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
        aria-hidden="true"
      >
        <div
          className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-teal-500 to-indigo-600 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
        />
      </div>

      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-4 pt-20 pb-16 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl max-w-4xl mx-auto leading-tight">
          Explore India Differently with{' '}
          <span className="bg-gradient-to-r from-teal-400 via-cyan-400 to-indigo-500 bg-clip-text text-transparent">
            AI-Powered Travel
          </span>
        </h1>
        
        <p className="mt-6 text-lg leading-8 text-slate-400 max-w-2xl mx-auto">
          Create customized itineraries, track your budget, and uncover offbeat secret spots recommended by local experts. Your next quest starts here.
        </p>

        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link
            href="/register"
            className="group flex items-center space-x-2 rounded-xl bg-gradient-to-r from-teal-500 to-indigo-600 px-6 py-3.5 text-base font-semibold text-white shadow-xl shadow-teal-500/10 hover:from-teal-400 hover:to-indigo-500 transition-all hover:scale-[1.03] hover:shadow-teal-500/20"
          >
            <span>Plan Your Trip</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          
          <Link
            href="/destinations"
            className="text-base font-semibold leading-6 text-slate-300 hover:text-white transition-colors"
          >
            Explore Destinations <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className="group relative rounded-2xl border border-white/5 bg-slate-900/60 p-8 shadow-2xl backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-white/10 hover:bg-slate-900/80"
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.color} text-white shadow-lg`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-xl font-bold text-white group-hover:text-teal-300 transition-colors">
                  {feature.title}
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-slate-400">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Process Steps */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 text-center border-t border-white/5 w-full">
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          How It Works
        </h2>
        <p className="mt-4 text-slate-400 max-w-xl mx-auto text-sm">
          Plan, track, and share your adventures in three simple steps.
        </p>

        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
          {steps.map((step, idx) => (
            <div key={idx} className="flex flex-col items-center p-6 bg-slate-900/20 rounded-xl border border-white/5">
              <span className="text-4xl font-extrabold text-teal-500/20">{step.step}</span>
              <h3 className="mt-4 text-lg font-bold text-white">{step.title}</h3>
              <p className="mt-2 text-xs text-slate-400 max-w-xs">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom glowing backdrop */}
      <div
        className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
        aria-hidden="true"
      >
        <div
          className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36rem] -translate-x-1/2 bg-gradient-to-tr from-indigo-500 to-teal-500 opacity-10 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
        />
      </div>
    </div>
  );
}
