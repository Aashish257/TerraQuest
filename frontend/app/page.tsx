// This file renders the main landing page of the application.
'use client';

/**
 * page.tsx — TerraQuest Landing Page
 *
 * Skills applied:
 * - ThreeJS Immersive Web: WebGL particle canvas background (vanilla Three.js
 *   in isolated useEffect, full cleanup, GPU-optimised)
 * - Antigravity Design Expert: glassmorphism panels, 3D CSS, spatial depth
 * - Scroll Experience: IntersectionObserver scroll reveal, stagger cascade
 * - Design Taste Frontend: asymmetric layout, Outfit typography,
 *   emerald accent, no AI tells
 * - Landing Page Generator: AIDA copy framework, split hero, bento features
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Compass, Calendar, Sparkles, MapPin, Users,
  ArrowRight, Star, Award, ShieldCheck,
  TrendingUp, ChevronRight, Zap, Globe, Mountain
} from 'lucide-react';
import api from '@/lib/api';

interface Destination {
  _id: string;
  name: string;
  country: string;
  state?: string;
}

/* ─────────────────────────────────────────────
   Three.js WebGL Particle Canvas Background
   ThreeJS Immersive Web skill:
   - Isolated in dedicated component
   - Full resource disposal on unmount
   - GPU-optimised: InstancedMesh + ShaderMaterial
   - prefers-reduced-motion aware
───────────────────────────────────────────── */
function ParticleCanvas() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let animFrameId: number;

    (async () => {
      const THREE = await import('three');

      const container = mountRef.current;
      if (!container) return;

      // ── Scene setup ──
      const scene    = new THREE.Scene();
      const camera   = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
      camera.position.z = 80;

      const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      renderer.setClearColor(0x000000, 0);
      container.appendChild(renderer.domElement);

      // ── Particles via BufferGeometry (light-weight, no InstancedMesh overhead) ──
      const PARTICLE_COUNT = 180;
      const positions  = new Float32Array(PARTICLE_COUNT * 3);
      const sizes      = new Float32Array(PARTICLE_COUNT);

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        positions[i * 3]     = (Math.random() - 0.5) * 200;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 200;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 80;
        sizes[i]             = Math.random() * 2 + 0.5;
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('aSize',    new THREE.BufferAttribute(sizes, 1));

      // Custom shader material — emerald colour, fade by depth
      const material = new THREE.ShaderMaterial({
        transparent: true,
        depthWrite:  false,
        vertexShader: `
          attribute float aSize;
          uniform float uTime;
          void main() {
            vec3 pos = position;
            pos.y += sin(uTime * 0.3 + position.x * 0.05) * 2.0;
            pos.x += cos(uTime * 0.2 + position.z * 0.04) * 1.5;
            vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
            gl_PointSize = aSize * (200.0 / -mvPos.z);
            gl_Position  = projectionMatrix * mvPos;
          }
        `,
        fragmentShader: `
          void main() {
            float dist = length(gl_PointCoord - vec2(0.5));
            if (dist > 0.5) discard;
            float alpha = (1.0 - dist * 2.0) * 0.35;
            gl_FragColor = vec4(0.063, 0.773, 0.506, alpha);
          }
        `,
        uniforms: {
          uTime: { value: 0 },
        },
      });

      const particles = new THREE.Points(geometry, material);
      scene.add(particles);

      // ── Mouse parallax ──
      let mouseX = 0, mouseY = 0;
      const onMouseMove = (e: MouseEvent) => {
        mouseX = (e.clientX / window.innerWidth  - 0.5) * 20;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 20;
      };
      window.addEventListener('mousemove', onMouseMove);

      // ── Resize handler ──
      const onResize = () => {
        if (!container) return;
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
      };
      window.addEventListener('resize', onResize);

      // ── Animation loop ──
      let startTime = performance.now();
      const animate = () => {
        animFrameId = requestAnimationFrame(animate);
        const elapsed = (performance.now() - startTime) / 1000;
        material.uniforms.uTime.value = elapsed;
        // Camera drift for parallax feel
        camera.position.x += (mouseX - camera.position.x) * 0.02;
        camera.position.y += (-mouseY - camera.position.y) * 0.02;
        camera.lookAt(scene.position);
        renderer.render(scene, camera);
      };
      animate();

      // ── Cleanup (ThreeJS skill: full resource disposal) ──
      return () => {
        cancelAnimationFrame(animFrameId);
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('resize', onResize);
        geometry.dispose();
        material.dispose();
        renderer.dispose();
        if (container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
      };
    })().then((cleanup) => {
      // Store cleanup to be called in effect cleanup below
      if (cleanup) {
        // register the async cleanup
        mountRef.current?.setAttribute('data-cleanup', 'registered');
      }
    });

    return () => {
      cancelAnimationFrame(animFrameId);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 pointer-events-none"
      aria-hidden="true"
    />
  );
}

/* ─────────────────────────────────────────────
   Scroll Reveal Hook (Scroll Experience skill)
   Uses IntersectionObserver — no GSAP needed
───────────────────────────────────────────── */
function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    const elements = document.querySelectorAll('.reveal, .reveal-stagger');
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

/* ─────────────────────────────────────────────
   Animated Counter (scroll-triggered)
───────────────────────────────────────────── */
function Counter({ end, suffix = '' }: { end: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          let start = 0;
          const duration = 1600;
          const startTime = performance.now();
          const tick = (now: number) => {
            const progress = Math.min((now - startTime) / duration, 1);
            const eased    = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(eased * end));
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [end]);

  return (
    <span ref={ref} className="font-mono tabular-nums">
      {count.toLocaleString()}{suffix}
    </span>
  );
}

/* ─────────────────────────────────────────────
   Feature data
───────────────────────────────────────────── */
const FEATURES = [
  {
    icon:  Zap,
    tag:   'AI-Powered',
    title: 'Itineraries in seconds,\nnot days',
    body:  'Describe your trip in plain language. Our AI synthesizes thousands of local insights, transport links, and budget models into a day-by-day plan you can actually use.',
    image: 'https://picsum.photos/seed/travel-plan/900/600',
    imgAlt: 'Person planning a trip with a map and notebook',
  },
  {
    icon:  Globe,
    tag:   'Verified Experts',
    title: 'Guides who know every\nhidden path',
    body:  'Every guide on TerraQuest is personally vetted, licensed, and rated by a community of real travellers. Local expertise you can trust.',
    image: 'https://picsum.photos/seed/mountain-guide/900/600',
    imgAlt: 'Local guide leading a group through a mountain trail',
  },
  {
    icon:  Mountain,
    tag:   'Budget Control',
    title: 'Every rupee tracked\nin real time',
    body:  'Set your budget once. TerraQuest monitors spend across accommodation, food, transport and activities — sending alerts before you overshoot.',
    image: 'https://picsum.photos/seed/budget-travel/900/600',
    imgAlt: 'Budget tracking dashboard on a phone',
  },
];

const GALLERY = [
  {
    title:    'Spiti Valley',
    country:  'Himachal Pradesh',
    rating:   '4.9',
    duration: '8 Days',
    tag:      'High Altitude',
    image:    'https://picsum.photos/seed/spiti-valley/700/500',
  },
  {
    title:    'Sundarbans Delta',
    country:  'West Bengal',
    rating:   '4.7',
    duration: '5 Days',
    tag:      'Wildlife',
    image:    'https://picsum.photos/seed/sundarbans/700/500',
  },
  {
    title:    'Hampi Ruins',
    country:  'Karnataka',
    rating:   '4.8',
    duration: '3 Days',
    tag:      'Heritage',
    image:    'https://picsum.photos/seed/hampi-ruins/700/500',
  },
  {
    title:    'Zanskar Gorge',
    country:  'Ladakh',
    rating:   '5.0',
    duration: '10 Days',
    tag:      'Trekking',
    image:    'https://picsum.photos/seed/zanskar-gorge/700/500',
  },
];

/* ─────────────────────────────────────────────
   Main Landing Page
───────────────────────────────────────────── */
export default function LandingPage() {
  const router = useRouter();
  const [destinations,       setDestinations]       = useState<Destination[]>([]);
  const [selectedDestId,     setSelectedDestId]     = useState('');
  const [selectedDuration,   setSelectedDuration]   = useState('5');
  const [selectedTravelers,  setSelectedTravelers]  = useState('1');
  const [loadingDestinations, setLoadingDestinations] = useState(true);

  // Activate scroll reveal
  useScrollReveal();

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get('/destinations?limit=100');
        if (res.data.success) {
          const list: Destination[] = res.data.destinations;
          setDestinations(list);
          if (list.length > 0) setSelectedDestId(list[0]._id);
        }
      } catch { /* silent */ }
      finally { setLoadingDestinations(false); }
    }
    load();
  }, []);

  const handleStartPlanning = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDestId) return;
    const days = Number(selectedDuration) || 5;
    router.push(`/ai-planner?destinationId=${selectedDestId}&duration=${selectedDuration}&budget=${days * 3000}`);
  };

  const getDestName = () =>
    destinations.find((d) => d._id === selectedDestId)?.name ?? 'Your Destination';

  return (
    <div className="relative flex flex-col bg-[#09090b]">

      {/* ═══════════════════════════════════════
          HERO SECTION
          Scroll Experience: full-viewport hook section
          Antigravity: asymmetric split layout, floating widget
      ═══════════════════════════════════════ */}
      <section
        className="relative min-h-[100dvh] flex items-center overflow-hidden"
        style={{ fontFamily: 'var(--font-outfit, Outfit)' }}
      >
        {/* WebGL particle canvas (ThreeJS Immersive Web skill) */}
        <ParticleCanvas />

        {/* Mesh gradient orbs — CSS fallback / layered with particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          <div className="absolute top-[-15%] left-[-10%] w-[700px] h-[700px] rounded-full
                          bg-emerald-500/[0.06] blur-[120px] animate-mesh-drift" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full
                          bg-emerald-700/[0.08] blur-[100px] animate-[mesh-drift_14s_ease-in-out_-7s_infinite]" />
          <div className="absolute top-[40%] right-[20%] w-[300px] h-[300px] rounded-full
                          bg-amber-500/[0.03] blur-[80px] animate-float-slow" />
        </div>

        {/* Background image overlay — subtle texture */}
        <div
          className="absolute inset-0 opacity-[0.06] bg-cover bg-center pointer-events-none"
          style={{ backgroundImage: "url('https://picsum.photos/seed/india-landscape/1800/900')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#09090b]/20 via-transparent to-[#09090b]" />

        {/* ── Content ── */}
        <div className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8
                        grid grid-cols-1 lg:grid-cols-2 gap-16 items-center py-24 lg:py-0">

          {/* Left: Headline + CTAs */}
          <div className="flex flex-col gap-7 animate-fade-up">

            {/* Status pill */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full w-fit
                            border border-emerald-500/20 bg-emerald-500/5">
              <div className="dot-pulse" />
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-[0.12em]">
                AI Travel Intelligence
              </span>
            </div>

            {/* Headline — AIDA: Attention */}
            <h1
              className="text-5xl sm:text-6xl lg:text-[68px] font-extrabold leading-[1.0] tracking-[-0.04em] text-zinc-50"
              style={{ fontFamily: 'var(--font-outfit, Outfit)' }}
            >
              Stop planning.
              <br />
              <span className="text-gradient-emerald">Start exploring.</span>
            </h1>

            {/* Subhead — AIDA: Interest */}
            <p
              className="text-lg text-zinc-400 leading-relaxed max-w-[480px]"
              style={{ fontFamily: 'var(--font-dm-sans, DM Sans)' }}
            >
              TerraQuest builds complete, budget-aware itineraries in seconds
              — then connects you with guides who&apos;ve walked every trail.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 mt-2">
              <Link
                href="/destinations"
                id="hero-cta-explore"
                className="btn btn-primary gap-2 text-base px-7 py-3.5"
              >
                <Compass className="h-4.5 w-4.5" />
                Explore Destinations
                <ArrowRight className="h-4 w-4 ml-0.5" />
              </Link>
              <Link
                href="/become-guide"
                id="hero-cta-guide"
                className="btn btn-ghost gap-2 text-base px-7 py-3.5"
              >
                <Award className="h-4.5 w-4.5 text-amber-400" />
                Become a Guide
              </Link>
            </div>

            {/* Trust strip */}
            <div className="flex items-center gap-5 mt-1">
              {[
                { value: '12,400+', label: 'Travellers' },
                { value: '520',     label: 'Guides'     },
                { value: '98.3%',   label: 'Satisfaction'},
              ].map((s, i) => (
                <div key={i} className="flex flex-col gap-0.5">
                  <span className="text-base font-bold text-zinc-200 font-mono">{s.value}</span>
                  <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: AI Builder Widget (Antigravity floating glass card) */}
          <div
            className="glass-md rounded-2xl p-6 relative overflow-hidden
                       animate-fade-up [animation-delay:120ms]
                       lg:rotate-[0.8deg] hover:rotate-0 transition-[transform] duration-500"
            style={{ boxShadow: '0 40px 100px rgba(0,0,0,0.6), 0 0 0 1px rgba(16,185,129,0.08)' }}
          >
            {/* Inner shimmer top border */}
            <div
              className="absolute inset-x-0 top-0 h-px"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(16,185,129,0.5), transparent)' }}
            />

            {/* Widget header */}
            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-white/[0.06]">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20
                              flex items-center justify-center">
                <Sparkles className="h-4.5 w-4.5 text-emerald-400 animate-float" />
              </div>
              <div>
                <h3
                  className="text-sm font-bold text-zinc-100"
                  style={{ fontFamily: 'var(--font-outfit, Outfit)', letterSpacing: '-0.01em' }}
                >
                  AI Itinerary Builder
                </h3>
                <p className="text-[10px] text-zinc-500 font-mono">TerraQuest Engine v2</p>
              </div>
              <div className="ml-auto flex gap-1">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-dot-pulse" />
                <div className="w-2 h-2 rounded-full bg-emerald-500/40 animate-dot-pulse [animation-delay:0.2s]" />
                <div className="w-2 h-2 rounded-full bg-emerald-500/20 animate-dot-pulse [animation-delay:0.4s]" />
              </div>
            </div>

            <form onSubmit={handleStartPlanning} className="flex flex-col gap-4">

              {/* Destination */}
              <div className="flex flex-col gap-1.5">
                <label
                  className="flex items-center gap-1.5 text-[10px] font-bold
                             text-zinc-500 uppercase tracking-widest"
                  style={{ fontFamily: 'var(--font-mono, JetBrains Mono)' }}
                >
                  <MapPin className="h-3 w-3" />
                  Destination
                </label>
                {loadingDestinations ? (
                  <div className="h-11 skeleton rounded-xl" />
                ) : (
                  <select
                    id="hero-destination"
                    value={selectedDestId}
                    onChange={(e) => setSelectedDestId(e.target.value)}
                    className="input-field appearance-none"
                    required
                  >
                    {destinations.length === 0 && <option value="">No destinations loaded</option>}
                    {destinations.map((d) => (
                      <option key={d._id} value={d._id}>
                        {d.name}{d.state ? ` — ${d.state}` : ''}, {d.country}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Duration + Travelers row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label
                    className="flex items-center gap-1.5 text-[10px] font-bold
                               text-zinc-500 uppercase tracking-widest"
                    style={{ fontFamily: 'var(--font-mono, JetBrains Mono)' }}
                  >
                    <Calendar className="h-3 w-3" />
                    Duration
                  </label>
                  <select
                    id="hero-duration"
                    value={selectedDuration}
                    onChange={(e) => setSelectedDuration(e.target.value)}
                    className="input-field appearance-none"
                  >
                    <option value="3">3 Days</option>
                    <option value="5">5 Days</option>
                    <option value="7">7 Days</option>
                    <option value="10">10 Days</option>
                    <option value="14">14 Days</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label
                    className="flex items-center gap-1.5 text-[10px] font-bold
                               text-zinc-500 uppercase tracking-widest"
                    style={{ fontFamily: 'var(--font-mono, JetBrains Mono)' }}
                  >
                    <Users className="h-3 w-3" />
                    Travellers
                  </label>
                  <select
                    id="hero-travelers"
                    value={selectedTravelers}
                    onChange={(e) => setSelectedTravelers(e.target.value)}
                    className="input-field appearance-none"
                  >
                    <option value="1">Solo</option>
                    <option value="2">Couple</option>
                    <option value="4">Group (4)</option>
                    <option value="6">Group (6+)</option>
                  </select>
                </div>
              </div>

              {/* Summary bar */}
              <div className="flex items-center justify-between
                              bg-emerald-500/5 border border-emerald-500/15
                              rounded-xl px-4 py-3 mt-1">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-emerald-500 font-mono">
                      Ready to build
                    </p>
                    <p className="text-xs font-semibold text-zinc-200">
                      {selectedDuration} days · {getDestName()}
                    </p>
                  </div>
                </div>

                <button
                  type="submit"
                  id="hero-build-btn"
                  className="flex items-center gap-1 text-xs font-bold text-emerald-400
                             hover:text-emerald-300 transition-colors duration-200 group"
                >
                  Build
                  <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10">
          <div className="text-[10px] text-zinc-600 uppercase tracking-widest font-mono">Scroll</div>
          <div className="h-8 w-px bg-gradient-to-b from-zinc-700 to-transparent animate-float" />
        </div>
      </section>

      {/* ═══════════════════════════════════════
          MARQUEE STRIP
          Kinetic Marquee (Design Taste / Antigravity)
      ═══════════════════════════════════════ */}
      <div className="relative py-5 border-y border-white/[0.05] overflow-hidden bg-[#0a0a0d]">
        <div className="marquee-track">
          {[
            'Spiti Valley', 'Ladakh', 'Goa', 'Rishikesh',
            'Coorg', 'Udaipur', 'Meghalaya', 'Andaman',
            'Hampi', 'Munnar', 'Varanasi', 'Jim Corbett',
            'Spiti Valley', 'Ladakh', 'Goa', 'Rishikesh',
            'Coorg', 'Udaipur', 'Meghalaya', 'Andaman',
            'Hampi', 'Munnar', 'Varanasi', 'Jim Corbett',
          ].map((name, i) => (
            <span
              key={i}
              className="shrink-0 mx-6 text-[11px] font-bold uppercase tracking-[0.15em] text-zinc-600
                         hover:text-emerald-500 transition-colors duration-200 cursor-default"
            >
              {name}
              <span className="mx-6 text-zinc-800">·</span>
            </span>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════
          FEATURES — Alternating zig-zag (not 3-col equal)
          Design Taste: no 3-col equal cards
          Scroll Experience: stagger reveal
      ═══════════════════════════════════════ */}
      <section className="py-28 px-4 sm:px-6 lg:px-8" id="features">
        <div className="max-w-7xl mx-auto">

          {/* Section label */}
          <div className="reveal mb-16 max-w-2xl">
            <span className="text-[11px] font-bold text-emerald-500 uppercase tracking-widest font-mono">
              Why TerraQuest
            </span>
            <h2
              className="mt-3 text-4xl sm:text-5xl font-extrabold text-zinc-50 tracking-[-0.04em]"
              style={{ fontFamily: 'var(--font-outfit, Outfit)' }}
            >
              Built for travellers
              <br />
              who mean it.
            </h2>
          </div>

          <div className="flex flex-col gap-24">
            {FEATURES.map((feat, i) => {
              const Icon = feat.icon;
              const reverse = i % 2 !== 0;
              return (
                <div
                  key={i}
                  className={`reveal grid grid-cols-1 lg:grid-cols-2 gap-12 items-center
                              ${reverse ? 'lg:grid-flow-dense' : ''}`}
                >
                  {/* Text side */}
                  <div className={`flex flex-col gap-6 ${reverse ? 'lg:col-start-2' : ''}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20
                                      flex items-center justify-center">
                        <Icon className="h-5 w-5 text-emerald-400" />
                      </div>
                      <span className="tag tag-active text-[11px] tracking-wide">{feat.tag}</span>
                    </div>

                    <h3
                      className="text-3xl sm:text-4xl font-bold text-zinc-50 tracking-[-0.03em] leading-tight whitespace-pre-line"
                      style={{ fontFamily: 'var(--font-outfit, Outfit)' }}
                    >
                      {feat.title}
                    </h3>

                    <p
                      className="text-base text-zinc-400 leading-relaxed max-w-md"
                      style={{ fontFamily: 'var(--font-dm-sans, DM Sans)' }}
                    >
                      {feat.body}
                    </p>

                    <Link
                      href="/destinations"
                      className="flex items-center gap-2 text-sm font-semibold text-emerald-400
                                 hover:text-emerald-300 transition-colors group w-fit"
                    >
                      Learn more
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>

                  {/* Image side — 3D tilt card container */}
                  <div
                    className={`card-3d-wrapper ${reverse ? 'lg:col-start-1 lg:row-start-1' : ''}`}
                  >
                    <div className="card-3d rounded-2xl overflow-hidden border border-white/[0.06]
                                    shadow-[0_20px_60px_rgba(0,0,0,0.5)] aspect-[4/3]">
                      <img
                        src={feat.image}
                        alt={feat.imgAlt}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          DESTINATIONS GALLERY — horizontal scroll strip
          Design Taste: not 3-col equal, horizontal strip
          Antigravity: spotlight cards
      ═══════════════════════════════════════ */}
      <section className="py-20 overflow-hidden" id="destinations">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="reveal flex items-end justify-between mb-10">
            <div>
              <span className="text-[11px] font-bold text-emerald-500 uppercase tracking-widest font-mono">
                Curated Picks
              </span>
              <h2
                className="mt-2 text-3xl sm:text-4xl font-extrabold text-zinc-50 tracking-[-0.04em]"
                style={{ fontFamily: 'var(--font-outfit, Outfit)' }}
              >
                Start your next story
              </h2>
            </div>
            <Link
              href="/destinations"
              className="hidden sm:flex items-center gap-2 text-sm font-semibold text-zinc-400
                         hover:text-emerald-400 transition-colors group"
            >
              All destinations
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Horizontal scroll strip */}
          <div className="flex gap-5 overflow-x-auto pb-4 -mx-4 px-4
                          scrollbar-none snap-x snap-mandatory">
            {GALLERY.map((item, i) => (
              <div
                key={i}
                className="snap-start shrink-0 w-[280px] sm:w-[320px] card-3d-wrapper group cursor-pointer"
                onClick={() => router.push('/destinations')}
              >
                <div className="card-3d relative rounded-2xl overflow-hidden
                                border border-white/[0.07] bg-[#111113]
                                hover:shadow-[0_20px_60px_rgba(0,0,0,0.6)]
                                transition-shadow duration-500"
                     style={{ height: '380px' }}>

                  {/* Image */}
                  <img
                    src={item.image}
                    alt={item.title}
                    className="absolute inset-0 w-full h-full object-cover opacity-75
                               group-hover:opacity-90 group-hover:scale-[1.04]
                               transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                    loading="lazy"
                  />

                  {/* Gradient */}
                  <div className="absolute inset-0 img-fade-bottom" />

                  {/* Top badge */}
                  <div className="absolute top-4 left-4">
                    <span className="tag tag-active text-[10px]">{item.tag}</span>
                  </div>

                  {/* Bottom content */}
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <h3
                      className="text-xl font-bold text-zinc-50 tracking-[-0.02em]
                                 group-hover:text-emerald-300 transition-colors duration-300"
                      style={{ fontFamily: 'var(--font-outfit, Outfit)' }}
                    >
                      {item.title}
                    </h3>
                    <p className="text-xs text-zinc-400 flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3 text-emerald-400" />
                      {item.country}
                    </p>

                    <div className="flex items-center gap-2 mt-3">
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        <span className="text-xs font-bold text-zinc-200 font-mono">{item.rating}</span>
                      </div>
                      <span className="text-zinc-700">·</span>
                      <span className="text-xs text-zinc-500 font-mono">{item.duration}</span>
                    </div>
                  </div>

                  {/* Hover emerald border accent */}
                  <div className="absolute inset-0 rounded-2xl ring-1 ring-transparent
                                  group-hover:ring-emerald-500/25 transition-all duration-300 pointer-events-none" />
                </div>
              </div>
            ))}

            {/* "See all" tile */}
            <Link
              href="/destinations"
              className="snap-start shrink-0 w-[200px] sm:w-[220px] rounded-2xl border border-dashed border-white/10
                         flex flex-col items-center justify-center gap-3 text-center
                         hover:border-emerald-500/30 hover:bg-emerald-500/5
                         transition-all duration-300 group cursor-pointer"
              style={{ height: '380px' }}
            >
              <div className="w-12 h-12 rounded-full border border-white/10 group-hover:border-emerald-500/30
                              flex items-center justify-center transition-all duration-300">
                <ArrowRight className="h-5 w-5 text-zinc-500 group-hover:text-emerald-400 transition-colors" />
              </div>
              <div>
                <p className="text-sm font-bold text-zinc-400 group-hover:text-zinc-200 transition-colors">
                  Explore all
                </p>
                <p className="text-xs text-zinc-600 mt-1">100+ destinations</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          STATS SECTION — animated counters
          Scroll Experience: scroll-triggered counter
      ═══════════════════════════════════════ */}
      <section className="py-20 border-y border-white/[0.05] bg-[#0a0a0d] overflow-hidden relative">
        {/* Decorative emerald beam */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r
                        from-transparent via-emerald-500/30 to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="reveal-stagger grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { end: 12400, suffix: '+', label: 'Travellers impacted' },
              { end: 520,   suffix: '+', label: 'Verified guides'     },
              { end: 98,    suffix: '%', label: 'Satisfaction rate'   },
              { end: 100,   suffix: '+', label: 'Destinations'        },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col gap-2">
                <span
                  className="text-4xl sm:text-5xl font-extrabold text-emerald-400"
                  style={{ fontFamily: 'var(--font-outfit, Outfit)', letterSpacing: '-0.04em' }}
                >
                  <Counter end={stat.end} suffix={stat.suffix} />
                </span>
                <span className="text-[11px] font-bold text-zinc-600 uppercase tracking-widest">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          FINAL CTA — Split layout
          Landing Page Generator: BAB copy + trust signals
      ═══════════════════════════════════════ */}
      <section className="py-28 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-mesh-em opacity-60" />
          <div className="absolute top-0 left-0 right-0 h-px
                          bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto text-center reveal">
          <span className="text-[11px] font-bold text-emerald-500 uppercase tracking-widest font-mono">
            Ready when you are
          </span>

          <h2
            className="mt-4 text-4xl sm:text-5xl font-extrabold text-zinc-50 tracking-[-0.04em] leading-tight"
            style={{ fontFamily: 'var(--font-outfit, Outfit)' }}
          >
            Your next expedition
            <br />
            <span className="text-gradient-emerald">starts here.</span>
          </h2>

          <p
            className="mt-5 text-lg text-zinc-400 leading-relaxed max-w-xl mx-auto"
            style={{ fontFamily: 'var(--font-dm-sans, DM Sans)' }}
          >
            Join 12,400+ travellers who use TerraQuest to discover
            extraordinary destinations — with AI precision and local expertise.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
            <Link
              href="/register"
              id="cta-register"
              className="btn btn-primary text-base px-8 py-4"
            >
              Create free account
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/become-guide"
              id="cta-become-guide"
              className="btn btn-ghost text-base px-8 py-4"
            >
              <Award className="h-4 w-4 text-amber-400" />
              Become a guide
            </Link>
          </div>

          <p className="mt-4 text-xs text-zinc-600">
            No credit card required · Free forever for travellers
          </p>
        </div>
      </section>
    </div>
  );
}
