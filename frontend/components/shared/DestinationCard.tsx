// This is a reusable UI component that displays the destination card on the website.
'use client';

/**
 * DestinationCard.tsx — Premium 3D Tilt Spotlight Card
 *
 * Skills applied:
 * - Antigravity Design Expert: CSS 3D perspective tilt, glassmorphism refraction
 * - Design Taste Frontend: spotlight border, no generic centered card
 * - 3D Web Experience: CSS transform-style: preserve-3d hover tilt
 * - Scroll Experience: stagger-ready (parent applies animation-delay via CSS)
 */

import Link from 'next/link';
import { MapPin, Calendar, TrendingUp, Compass, Star } from 'lucide-react';
import { useRef, useCallback } from 'react';

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

const DESTINATION_IMAGE_MAPPINGS: Record<string, string> = {
  'Goa':         'https://picsum.photos/seed/goa-beach-india/800/500',
  'Manali':      'https://picsum.photos/seed/manali-snow/800/500',
  'Ladakh':      'https://picsum.photos/seed/ladakh-mountains/800/500',
  'Jaipur':      'https://picsum.photos/seed/jaipur-palace/800/500',
  'Coorg':       'https://picsum.photos/seed/coorg-coffee/800/500',
  'Munnar':      'https://picsum.photos/seed/munnar-tea/800/500',
  'Pondicherry': 'https://picsum.photos/seed/pondicherry-beach/800/500',
  'Rishikesh':   'https://picsum.photos/seed/rishikesh-ganges/800/500',
  'Udaipur':     'https://picsum.photos/seed/udaipur-lake-palace/800/500',
  'Meghalaya':   'https://picsum.photos/seed/meghalaya-waterfalls/800/500',
};

interface DestinationCardProps {
  destination: Destination;
  index?: number;
}

export default function DestinationCard({ destination, index = 0 }: DestinationCardProps) {
  const cardRef   = useRef<HTMLDivElement>(null);
  const wrapRef   = useRef<HTMLDivElement>(null);

  const imageUrl = destination.images?.length > 0
    ? destination.images[0]
    : DESTINATION_IMAGE_MAPPINGS[destination.name]
      || `https://picsum.photos/seed/${encodeURIComponent(destination.name)}/800/500`;

  // 3D tilt on mouse move (CSS custom properties for GPU-accelerated transform)
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || !wrapRef.current) return;
    const rect   = wrapRef.current.getBoundingClientRect();
    const cx     = rect.left + rect.width / 2;
    const cy     = rect.top  + rect.height / 2;
    const dx     = (e.clientX - cx) / (rect.width  / 2);
    const dy     = (e.clientY - cy) / (rect.height / 2);
    const rotY   =  dx * 6;
    const rotX   = -dy * 4;
    cardRef.current.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(8px)`;
    // Spotlight border follows cursor
    const pctX = ((e.clientX - rect.left) / rect.width)  * 100;
    const pctY = ((e.clientY - rect.top)  / rect.height) * 100;
    cardRef.current.style.setProperty('--spot-x', `${pctX}%`);
    cardRef.current.style.setProperty('--spot-y', `${pctY}%`);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
  }, []);

  return (
    <div
      ref={wrapRef}
      className="card-3d-wrapper h-full"
      style={{ '--anim-delay': `${index * 80}ms` } as React.CSSProperties}
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="group relative rounded-2xl overflow-hidden flex flex-col h-full
                   border border-white/[0.07] bg-[#111113]
                   shadow-[0_4px_24px_rgba(0,0,0,0.4)]
                   will-change-transform transition-shadow duration-500
                   hover:shadow-[0_20px_60px_rgba(0,0,0,0.6),0_0_0_1px_rgba(16,185,129,0.15)]"
        style={{
          transition: 'transform 0.4s cubic-bezier(0.16,1,0.3,1), box-shadow 0.4s ease',
          // Spotlight border via CSS paint trick
          background: 'radial-gradient(circle at var(--spot-x, 50%) var(--spot-y, 50%), rgba(16,185,129,0.04) 0%, transparent 60%), #111113',
        }}
      >
        {/* Featured badge */}
        {destination.featured && (
          <div className="absolute top-3.5 left-3.5 z-20 flex items-center gap-1
                          px-2.5 py-1 rounded-full
                          bg-amber-400/90 backdrop-blur-sm
                          text-[10px] font-bold text-zinc-900 tracking-wide uppercase
                          shadow-lg">
            <Star className="h-2.5 w-2.5 fill-current" />
            Featured
          </div>
        )}

        {/* ── Image ── */}
        <div className="relative h-52 w-full overflow-hidden bg-zinc-900 flex-shrink-0">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={destination.name}
              className="w-full h-full object-cover
                         group-hover:scale-[1.06]
                         transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]
                         opacity-80 group-hover:opacity-95"
              loading="lazy"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Compass className="h-12 w-12 text-zinc-700" />
            </div>
          )}

          {/* Gradient overlay — stronger at bottom */}
          <div className="absolute inset-0 img-fade-bottom pointer-events-none" />

          {/* Location overlay */}
          <div className="absolute bottom-3 left-4 right-4 flex items-center gap-1.5">
            <MapPin className="h-3 w-3 text-emerald-400 flex-shrink-0" />
            <span className="text-xs font-semibold text-zinc-200 truncate tracking-wide">
              {destination.state ? `${destination.state}, ` : ''}{destination.country}
            </span>
          </div>
        </div>

        {/* ── Content body ── */}
        <div className="flex flex-col flex-grow p-5 gap-4">

          {/* Name + description */}
          <div>
            <h3
              className="text-lg font-bold text-zinc-50 leading-tight
                         group-hover:text-emerald-300 transition-colors duration-300"
              style={{ fontFamily: 'var(--font-outfit, Outfit)', letterSpacing: '-0.02em' }}
            >
              {destination.name}
            </h3>
            <p className="mt-2 text-sm text-zinc-500 leading-relaxed line-clamp-2"
               style={{ fontFamily: 'var(--font-dm-sans, DM Sans)' }}>
              {destination.description}
            </p>
          </div>

          {/* Activity tags */}
          <div className="flex flex-wrap gap-1.5">
            {destination.activities.slice(0, 3).map((act, idx) => (
              <span
                key={idx}
                className="tag"
              >
                {act}
              </span>
            ))}
            {destination.activities.length > 3 && (
              <span className="tag text-zinc-600">
                +{destination.activities.length - 3}
              </span>
            )}
          </div>

          {/* Budget + CTA */}
          <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/[0.06]">
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest font-mono">
                Est. Budget
              </span>
              <span className="text-sm font-semibold text-zinc-200 font-mono">
                {destination.budgetRange
                  ? destination.budgetRange.split(' per ')[0]
                  : '—'
                }
              </span>
            </div>

            <Link
              href={`/destinations/${destination._id}`}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl
                         text-xs font-semibold text-emerald-400
                         border border-emerald-500/25 bg-emerald-500/5
                         hover:bg-emerald-500/15 hover:border-emerald-500/40
                         hover:text-emerald-300 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]
                         transition-all duration-300"
            >
              <span>Explore</span>
              <TrendingUp className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Hover emerald bottom line (Antigravity edge accent) */}
        <div className="absolute bottom-0 left-0 right-0 h-[1.5px]
                        bg-gradient-to-r from-transparent via-emerald-500/60 to-transparent
                        opacity-0 group-hover:opacity-100
                        transition-opacity duration-500" />
      </div>
    </div>
  );
}
