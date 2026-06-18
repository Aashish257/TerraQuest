/**
 * DestinationCard.tsx — Shared Destination Card Component
 *
 * Renders a card for a travel destination.
 * Displays title, location tags, budget range, activities tags, and a link to the details view.
 * Aesthetic features: Glowing borders, hover scaling, and clean tags.
 */

import Link from 'next/link';
import { MapPin, Calendar, Sparkles, Compass } from 'lucide-react';

export interface Destination {
  _id: string;
  name: string;
  country: string;
  state?: string;
  description: string;
  bestTimeToVisit?: string;
  budgetRange?: string;
  activities: string[];
  images: string[];
  featured: boolean;
}

interface DestinationCardProps {
  destination: Destination;
}

export default function DestinationCard({ destination }: DestinationCardProps) {
  return (
    <div className="group relative rounded-2xl border border-white/5 bg-slate-900/40 overflow-hidden shadow-2xl backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-white/10 hover:bg-slate-900/60 flex flex-col h-full">
      {/* Decorative featured badge */}
      {destination.featured && (
        <div className="absolute top-3 right-3 z-10 flex items-center space-x-1 rounded-full bg-teal-500/95 px-2.5 py-1 text-xs font-bold text-slate-950 shadow-md">
          <Sparkles className="h-3 w-3" />
          <span>Featured</span>
        </div>
      )}

      {/* Image / Fallback placeholder */}
      <div className="relative h-48 w-full bg-gradient-to-br from-slate-900 to-indigo-950/40 flex items-center justify-center border-b border-white/5 overflow-hidden">
        <Compass className="h-12 w-12 text-slate-700 transition-transform duration-500 group-hover:scale-110 group-hover:text-teal-500/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent opacity-60" />
      </div>

      {/* Details body */}
      <div className="p-6 flex-grow flex flex-col justify-between">
        <div>
          {/* Location */}
          <div className="flex items-center space-x-1 text-xs font-semibold text-teal-400 uppercase tracking-wider">
            <MapPin className="h-3 w-3" />
            <span>
              {destination.state ? `${destination.state}, ` : ''}
              {destination.country}
            </span>
          </div>

          {/* Name */}
          <h3 className="mt-2 text-xl font-bold text-white group-hover:text-teal-300 transition-colors">
            {destination.name}
          </h3>

          {/* Description snippet */}
          <p className="mt-3 text-sm leading-relaxed text-slate-400 line-clamp-3">
            {destination.description}
          </p>
        </div>

        {/* Dynamic badge collections */}
        <div className="mt-6 space-y-4">
          {/* Activities list */}
          <div className="flex flex-wrap gap-1.5">
            {destination.activities.slice(0, 3).map((act, idx) => (
              <span
                key={idx}
                className="rounded-md bg-white/5 px-2 py-0.5 text-xs font-medium text-slate-300 border border-white/5"
              >
                {act}
              </span>
            ))}
            {destination.activities.length > 3 && (
              <span className="text-xs font-semibold text-slate-500 pl-1">
                +{destination.activities.length - 3} more
              </span>
            )}
          </div>

          {/* Budget Info & CTA */}
          <div className="flex items-center justify-between border-t border-white/5 pt-4">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Est. Budget</span>
              <span className="text-sm font-semibold text-slate-200">
                {destination.budgetRange ? destination.budgetRange.split(' per ')[0] : 'Varies'}
              </span>
            </div>
            
            <Link
              href={`/destinations/${destination._id}`}
              className="rounded-lg bg-white/5 border border-white/10 px-3.5 py-1.5 text-xs font-semibold text-slate-200 hover:bg-teal-500 hover:text-slate-950 hover:border-teal-400 transition-all"
            >
              View Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
