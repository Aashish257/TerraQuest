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
                   border will-change-transform transition-shadow duration-500
                   hover:shadow-[0_20px_60px_rgba(0,0,0,0.7),0_0_0_1px_rgba(16,185,129,0.12)]"
        style={{
          background: 'radial-gradient(circle at var(--spot-x, 50%) var(--spot-y, 50%), rgba(16,185,129,0.03) 0%, transparent 60%), #0F1720',
          borderColor: '#27272A',
          boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
          transition: 'transform 0.4s cubic-bezier(0.16,1,0.3,1), box-shadow 0.4s ease',
        }}
      >
        {/* Featured badge */}
        {destination.featured && (
          <div className="absolute top-3.5 left-3.5 z-20 flex items-center gap-1
                          px-2.5 py-1 rounded-full
                          bg-amber-400/90 backdrop-blur-sm
                          shadow-lg"
               style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 600, color: '#111', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            <Star className="h-2.5 w-2.5 fill-current" />
            Featured
          </div>
        )}

        {/* ── Image ── */}
        <div className="relative h-56 w-full overflow-hidden flex-shrink-0" style={{ background: '#0A1118' }}>
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={destination.name}
              className="w-full h-full object-cover
                         group-hover:scale-[1.05]
                         transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]
                         opacity-75 group-hover:opacity-90"
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
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 600, color: '#d4d4d8', letterSpacing: '0.02em' }}
                  className="truncate">
              {destination.state ? `${destination.state}, ` : ''}{destination.country}
            </span>
          </div>
        </div>

        {/* ── Content body ── */}
        <div className="flex flex-col flex-grow gap-4" style={{ padding: '20px 20px 20px 20px' }}>

          {/* Name + description */}
          <div>
            <h3
              className="text-lg leading-tight group-hover:text-emerald-300 transition-colors duration-300"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 500, letterSpacing: '-0.015em', color: '#FFFFFF' }}
            >
              {destination.name}
            </h3>
            <p className="mt-2 text-sm leading-relaxed line-clamp-2"
               style={{ fontFamily: 'var(--font-body)', color: '#A1A1AA' }}>
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
              <span className="tag" style={{ color: '#52525B' }}>
                +{destination.activities.length - 3}
              </span>
            )}
          </div>

          {/* Budget + CTA */}
          <div className="mt-auto flex items-center justify-between pt-4"
               style={{ borderTop: '1px solid #27272A' }}>
            <div className="flex flex-col gap-0.5">
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 600, color: '#52525B', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Est. Budget
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 600, color: '#d4d4d8' }}>
                {destination.budgetRange
                  ? destination.budgetRange.split(' per ')[0]
                  : '—'
                }
              </span>
            </div>

            <Link
              href={`/destinations/${destination._id}`}
              className="flex items-center gap-1.5 px-3.5 py-1.5
                         text-xs font-semibold text-emerald-400
                         hover:bg-emerald-500/10 hover:text-emerald-300
                         hover:shadow-[0_0_16px_rgba(16,185,129,0.12)]
                         transition-all duration-300"
              style={{
                borderRadius: 'var(--radius-control)',
                border: '1px solid rgba(16,185,129,0.22)',
                background: 'rgba(16,185,129,0.04)',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
              }}
            >
              <span>Explore</span>
              <TrendingUp className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Hover emerald bottom accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px]
                        opacity-0 group-hover:opacity-100
                        transition-opacity duration-500"
             style={{ background: 'linear-gradient(90deg, transparent, rgba(16,185,129,0.5), transparent)' }} />
      </div>
    </div>
  );
}
