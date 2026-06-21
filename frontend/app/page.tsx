'use client';

/**
 * page.tsx — TerraQuest Landing Page
 *
 * Implements the new premium design system with custom HSL colors,
 * glassmorphism card panels, interactive AI Itinerary form widget,
 * features advantages grid, curated travel destinations catalog,
 * trust credentials metrics, and call-to-actions.
 * Dark theme adapted to blend with the global layout header and footer.
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Compass, 
  Calendar, 
  Sparkles, 
  MapPin, 
  Users, 
  ArrowRight, 
  Star, 
  Award,
  ShieldCheck,
  TrendingUp,
  HelpCircle
} from 'lucide-react';
import api from '@/lib/api';

interface Destination {
  _id: string;
  name: string;
  country: string;
  state?: string;
}

export default function LandingPage() {
  const router = useRouter();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [selectedDestId, setSelectedDestId] = useState('');
  const [selectedDuration, setSelectedDuration] = useState('5');
  const [selectedTravelers, setSelectedTravelers] = useState('1');
  const [loadingDestinations, setLoadingDestinations] = useState(true);

  // Load destinations for the interactive hero builder
  useEffect(() => {
    async function loadDestinations() {
      try {
        const res = await api.get('/destinations?limit=100');
        if (res.data.success) {
          const list = res.data.destinations;
          setDestinations(list);
          if (list.length > 0) {
            setSelectedDestId(list[0]._id);
          }
        }
      } catch (err) {
        console.error('Failed to load destinations:', err);
      } finally {
        setLoadingDestinations(false);
      }
    }
    loadDestinations();
  }, []);

  const handleStartPlanning = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDestId) return;
    
    // Construct default budget based on days (e.g. 3000 INR per day)
    const days = Number(selectedDuration) || 5;
    const defaultBudget = days * 3000;
    
    // Redirect to the AI Planner with search parameters prefilled
    router.push(
      `/ai-planner?destinationId=${selectedDestId}&duration=${selectedDuration}&budget=${defaultBudget}`
    );
  };

  const getSelectedDestName = () => {
    const dest = destinations.find(d => d._id === selectedDestId);
    return dest ? dest.name : 'Your Choice';
  };

  // Mock static showcase items for the curated gallery (matching user mockup structure)
  const galleryItems = [
    {
      title: 'Patagonia Peaks',
      country: 'Argentina',
      rating: '4.9',
      price: '₹95,000',
      duration: '7 Days',
      tag: 'Hiking',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuArsMmpPZq3JSKKfVvUpIvh-bUzvKqaV1va-sZpX1WvrNgnLSXRc5frs2RluKbKOQTvUKjJZfeo4uGw_oAihNSbXIG4O8FvnXRZKFjOKWpWDImQYIjEn1MgZOpv8AXO7DYvYfRpP6Rr8ve1I6tCb2UoRXJh_ig45SIj4c4Vn5vGn12CSTH8u1m_2YK9_a-SQPArWS8xbam-jW54xY_lQU6RWEuoXIRiiR1T7IbLg09ydnWVi-V_Tq-duf58WakbS7j8H1NiVQT43Ww'
    },
    {
      title: 'Amalfi Coastal Escape',
      country: 'Italy',
      rating: '4.7',
      price: '₹1,95,000',
      duration: '5 Days',
      tag: 'Culinary',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCk_0Rny78trQJWPGM903gjpF7xsVihxYAWR3PdqYrHKSegXQnZICCr6MGIGLt10-FnBGiL47yZ1ElGaWAeT3hdAa6NxREfbHU6ncFppUeAFXOsPY-cBCyNjShpXSEdvPL_Ql3p5qr_EVYqBINhTrgGqr3zSjInkBq-KJkMPFA5d7MqBuPOHgH4CT9KESVnwfyXnUe82DeKs4NIHtsEbSo4jnUuHcS8s1APLhKqSP7Kgsu_7W0daNzAf-1C4DO1YFr9UqE_gwVxcCo'
    },
    {
      title: 'Kyoto Heritage Tour',
      country: 'Japan',
      rating: '5.0',
      price: '₹2,45,000',
      duration: '10 Days',
      tag: 'Culture',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDyDidtZ4fQLShXw41rEGNTGXDehA1mH0xVs1uC10kcAUmYZI78CdCZfQJaRqFfeDoCVojuhFAjQMAb8Uk3htCcr373wzdpe_Ie81spjjCC3Nhv33DOyaFNsdzNf00qqG63P-nn7_g8wehss1swJ_rpAsjeaualPUZ780JcWBohy67zdCDR48gwgZTJZ5Mc0C7t1N5x4HUdYOopnamrTBOQQyOWqXaV18uKwI73DC61-4Xqi9AmEf45EuD3Uh9iDRDIsN2kcOgffbM'
    }
  ];

  return (
    <div className="relative isolate overflow-hidden bg-slate-950 flex-grow flex flex-col justify-start">
      {/* Background radial glowing effects */}
      <div
        className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
        aria-hidden="true"
      >
        <div
          className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-teal-500/20 to-indigo-600/10 opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
        />
      </div>

      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        {/* Background Image Layer */}
        <div className="absolute inset-0 z-0">
          <div 
            className="bg-cover bg-center w-full h-full opacity-20 filter saturate-50 contrast-125" 
            style={{ 
              backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuDOc3KUGkZmzCee4dMqqgfUz94vxan2S61My_ME-LZQKMCifxvBVfVii1SAZsDiRpYrXrc1VIfRzeAk3SUK7b0y-G7RMnQ8Al8IUMkbGu2UyepnhXV7IQ9M3X-ILiRc1IriB64wWeKooGJnFe1GCm6vIT0_Zv463vno_w8HtFFbfxwDQ119Dntn-XnfxLaKpkK3p-lITylCWOQQ_flnhAaUlINhar5sGpwgwiIQ8-Xih0Gd0W1pEb31jV9x4mDsmFsrhNKUt1-Y-l4')` 
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/20 via-slate-950/70 to-slate-950 z-0" />
        </div>

        <div className="relative z-10 max-w-7xl w-full px-4 sm:px-6 lg:px-8 mx-auto flex flex-col lg:flex-row items-center gap-12">
          
          {/* Hero Content Left */}
          <div className="w-full lg:w-1/2 flex flex-col gap-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/60 border border-white/10 backdrop-blur-md w-fit mx-auto lg:mx-0 shadow-md">
              <Sparkles className="h-4 w-4 text-teal-400" />
              <span className="text-[10px] font-semibold text-teal-300 tracking-widest uppercase">Next-Gen Expeditions</span>
            </div>
            
            <h1 className="text-4xl font-extrabold text-white sm:text-5xl lg:text-6xl leading-tight tracking-tight">
              Discover the Extraordinary.<br />
              <span className="text-gradient">Master the Journey.</span>
            </h1>
            
            <p className="text-base sm:text-lg leading-relaxed text-slate-400 max-w-xl mx-auto lg:mx-0">
              TerraQuest blends cutting-edge AI planning with the raw expertise of local guides. Craft impeccable itineraries, monitor budgets, and explore the world with absolute precision.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mt-4 justify-center lg:justify-start">
              <Link
                href="/destinations"
                className="btn-primary px-8 py-4 rounded-xl font-medium text-sm text-white flex items-center justify-center gap-2 hover:-translate-y-1 transition-all duration-300 shadow-lg shadow-teal-900/20"
              >
                <span>Start Exploring</span>
                <ArrowRight className="h-4 w-4 text-teal-300" />
              </Link>
              <Link
                href="/become-guide"
                className="glass-panel px-8 py-4 rounded-xl font-medium text-sm text-slate-300 hover:bg-slate-900/60 hover:text-white transition-all flex items-center justify-center gap-2"
              >
                <Award className="h-4 w-4 text-amber-400" />
                <span>Become a Guide</span>
              </Link>
            </div>
          </div>

          {/* Hero Interactive Widget Right */}
          <div className="w-full lg:w-1/2 mt-8 lg:mt-0 max-w-md lg:max-w-none mx-auto">
            <div className="glass-panel-active rounded-2xl p-6 relative overflow-hidden transform lg:rotate-1 hover:rotate-0 transition-transform duration-500">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400 ring-1 ring-teal-500/20">
                    <Sparkles className="h-5 w-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">AI Itinerary Builder</h3>
                    <p className="text-[10px] text-slate-400">Powered by TerraQuest Engine</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleStartPlanning} className="space-y-4">
                {/* Destination Dropdown */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <MapPin className="h-3 w-3 text-slate-500" />
                    <span>Where to next?</span>
                  </label>
                  {loadingDestinations ? (
                    <div className="h-10 w-full bg-slate-950/60 animate-pulse rounded-xl border border-white/5" />
                  ) : (
                    <select
                      value={selectedDestId}
                      onChange={(e) => setSelectedDestId(e.target.value)}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-3 text-xs text-slate-200 outline-none focus:border-teal-500 transition-colors"
                      required
                    >
                      {destinations.length === 0 && <option value="">No destinations available</option>}
                      {destinations.map((d) => (
                        <option key={d._id} value={d._id}>
                          {d.name} ({d.state ? `${d.state}, ` : ''}{d.country})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="flex gap-4">
                  {/* Duration Selector */}
                  <div className="flex-1 space-y-1.5">
                    <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <Calendar className="h-3 w-3 text-slate-500" />
                      <span>Duration</span>
                    </label>
                    <select
                      value={selectedDuration}
                      onChange={(e) => setSelectedDuration(e.target.value)}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-3 text-xs text-slate-200 outline-none focus:border-teal-500 transition-colors"
                    >
                      <option value="3">3 Days</option>
                      <option value="5">5 Days</option>
                      <option value="7">7 Days</option>
                      <option value="10">10 Days</option>
                      <option value="14">14 Days</option>
                    </select>
                  </div>

                  {/* Travelers Selector */}
                  <div className="flex-1 space-y-1.5">
                    <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <Users className="h-3 w-3 text-slate-500" />
                      <span>Travelers</span>
                    </label>
                    <select
                      value={selectedTravelers}
                      onChange={(e) => setSelectedTravelers(e.target.value)}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-3 text-xs text-slate-200 outline-none focus:border-teal-500 transition-colors"
                    >
                      <option value="1">1 Person</option>
                      <option value="2">2 People</option>
                      <option value="4">4 People</option>
                      <option value="6">6+ People</option>
                    </select>
                  </div>
                </div>

                {/* Status Indicator Panel */}
                <div className="mt-6 bg-teal-950/20 border border-teal-500/10 rounded-xl p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4.5 w-4.5 text-teal-400 flex-shrink-0" />
                    <div>
                      <span className="block text-[8px] font-bold uppercase tracking-widest text-teal-400">Ready to build</span>
                      <span className="text-xs font-bold text-white">
                        {selectedDuration} Days in {getSelectedDestName()}
                      </span>
                    </div>
                  </div>
                  <button 
                    type="submit"
                    className="text-xs font-extrabold text-teal-400 hover:text-teal-300 transition-colors flex items-center gap-0.5"
                  >
                    <span>Build Now</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </form>
            </div>
          </div>

        </div>
      </section>

      {/* Advantage Features Grid */}
      <section className="py-20 border-t border-white/5 bg-slate-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-[10px] font-bold text-teal-400 uppercase tracking-widest">Why TerraQuest</span>
            <h2 className="text-3xl font-extrabold text-white mt-2">The TerraQuest Advantage</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* AI-Powered Precision */}
            <div className="glass-panel p-8 rounded-2xl flex flex-col items-center text-center group hover:glass-panel-active transition-all duration-300">
              <div className="w-32 h-32 mb-6 overflow-hidden rounded-xl bg-slate-950 border border-white/5 shadow-inner">
                <img 
                  alt="AI Precision" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBeM4wALmBUzOag-BSJk0wkjk1oDHFShqMCnp1gngUNdfrEDLNYJ4zZAvy0J9jleHx9z68ffFleH6HzIA4IA_lnyiIm9s6BW1seYVYA-SHXhRLoaMWzPSysDMu5EJR9CiVHpscNgu-Bot_epMfKOBCHP-O6JRn3aKt-JaZGUQ1WDUNCqN1P3VAVozJ1KBc_H7cUjawz09XTf8w09CRh-nEMI341sOr7um81dJU5gi228GAil89pRzm0DEuAdilFGvnB5SSfF7Pa6Wk"
                />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-teal-300 transition-colors">AI-Powered Precision</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Craft impeccable itineraries tailored to your unique travel style and constraints automatically.
              </p>
            </div>

            {/* Local Expertise */}
            <div className="glass-panel p-8 rounded-2xl flex flex-col items-center text-center group hover:glass-panel-active transition-all duration-300">
              <div className="w-32 h-32 mb-6 overflow-hidden rounded-xl bg-slate-950 border border-white/5 shadow-inner">
                <img 
                  alt="Local Guides" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDgZ7MDNWpkcs9UKxKcaMHlDF5eS6XJFD0X5d_lFERjBDxnJr9GQZcBrw-rP7PuuAmtECmsy96Rqa-6IRHqtE2kivkTMl5QOoBIOurAAS8LZXtygsYbbxSw6-8vwEcoNtddZ3IxzA3hJ2K15SFcMjckjtiPQdyuOkGFHpRlyw7k0RWWM70WEo9iPBL8NWm-ulnp0j-NkBTl6QbEUS06SQwOnW0KKcH1c-8r4ZB4FytvGT3YCR0oxudSzhToGQvUMXfdGtjte1IhZ08"
                />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-teal-300 transition-colors">Local Expertise</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Unlock hidden places with vetted guides who live and breathe the local culture.
              </p>
            </div>

            {/* Budget Mastery */}
            <div className="glass-panel p-8 rounded-2xl flex flex-col items-center text-center group hover:glass-panel-active transition-all duration-300">
              <div className="w-32 h-32 mb-6 overflow-hidden rounded-xl bg-slate-950 border border-white/5 shadow-inner">
                <img 
                  alt="Budget Mastery" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBLvK4idfa8yKBS82Xes5lzSmqd1gH1DR76hiKe6pJsVJbVfFX_RQfAPR2qKOi9LQDmS5FD03K59D2AKvtiBM6qLUdEZH311wpp0eh0faZFnC408Az3BHZm9S4dLSmgfho-bHMZ28GgH1pTJ9ASmVQMmSA5ayUqQ46hsXpTXolrtqk9JIThlcboQorAFuOmRQlZDQ6w5H_Su_blgVbXnVBKHHJF8fO55aLrE-iXzG-bIaE-Xowo5v3T9ByiGtDIpJcnJaXuaRUm1Zk"
                />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-teal-300 transition-colors">Budget Mastery</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Real-time expense logs and denormalized budget summaries to track every rupee dynamically.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Curated Destinations Catalog Showcase */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-end mb-12 gap-4">
            <div>
              <span className="text-[10px] font-bold text-teal-400 uppercase tracking-widest">Global Reach</span>
              <h2 className="text-3xl font-extrabold text-white mt-2">Curated Destinations</h2>
            </div>
            <Link 
              href="/destinations" 
              className="text-teal-400 hover:text-teal-300 font-semibold text-sm flex items-center gap-1 hover:underline"
            >
              <span>View all locations</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {galleryItems.map((item, idx) => (
              <article 
                key={idx} 
                onClick={() => router.push('/destinations')}
                className="glass-panel rounded-2xl overflow-hidden flex flex-col group cursor-pointer h-[420px] transition-all duration-300 hover:glass-panel-active"
              >
                <div className="relative h-[240px] w-full overflow-hidden">
                  <div 
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-[1.03]" 
                    style={{ backgroundImage: `url('${item.image}')` }}
                  />
                  <div className="absolute inset-0 image-gradient-overlay" />
                  {idx === 0 && (
                    <div className="absolute top-4 left-4">
                      <span className="bg-teal-500/25 backdrop-blur-md text-teal-300 border border-teal-500/30 px-3 py-1 rounded-full text-[9px] font-bold tracking-wider uppercase">
                        Popular
                      </span>
                    </div>
                  )}
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h3 className="text-lg font-bold group-hover:text-teal-300 transition-colors">{item.title}</h3>
                    <p className="text-xs text-slate-300 flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3 text-teal-400" />
                      <span>{item.country}</span>
                    </p>
                  </div>
                </div>

                <div className="p-5 flex flex-col flex-grow bg-slate-900/10">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-1 text-amber-400">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="text-sm font-bold text-white">{item.rating}</span>
                    </div>
                    <span className="text-base font-extrabold text-teal-400">{item.price}</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-auto">
                    <span className="px-2.5 py-1 bg-slate-900 border border-white/5 text-[9px] font-semibold text-slate-300 rounded-lg">
                      {item.tag}
                    </span>
                    <span className="px-2.5 py-1 bg-slate-900 border border-white/5 text-[9px] font-semibold text-slate-300 rounded-lg">
                      {item.duration}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Statistics / Proof Banner */}
      <section className="py-20 bg-slate-900 border-y border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-500/5 to-indigo-500/5 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="flex flex-col gap-2">
            <span className="text-4xl sm:text-5xl font-extrabold text-teal-400">10k+</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Travelers Impacted</span>
          </div>
          <div className="flex flex-col gap-2 border-y md:border-y-0 md:border-x border-white/5 py-8 md:py-0">
            <span className="text-4xl sm:text-5xl font-extrabold text-teal-400">500+</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Expert Guides</span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-4xl sm:text-5xl font-extrabold text-teal-400">98%</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Satisfaction Rate</span>
          </div>
        </div>
      </section>

      {/* CTA Final section */}
      <section className="py-24 relative overflow-hidden">
        <div 
          className="absolute inset-0 z-0 opacity-5 grayscale scale-110" 
          style={{ 
            backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuDOc3KUGkZmzCee4dMqqgfUz94vxan2S61My_ME-LZQKMCifxvBVfVii1SAZsDiRpYrXrc1VIfRzeAk3SUK7b0y-G7RMnQ8Al8IUMkbGu2UyepnhXV7IQ9M3X-ILiRc1IriB64wWeKooGJnFe1GCm6vIT0_Zv463vno_w8HtFFbfxwDQ119Dntn-XnfxLaKpkK3p-lITylCWOQQ_flnhAaUlINhar5sGpwgwiIQ8-Xih0Gd0W1pEb31jV9x4mDsmFsrhNKUt1-Y-l4')`, 
            backgroundSize: 'cover', 
            backgroundPosition: 'center' 
          }} 
        />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-6">Ready to Master Your Journey?</h2>
          <p className="text-slate-400 text-base sm:text-lg mb-10 max-w-2xl mx-auto">
            Join thousands of modern explorers using TerraQuest to craft stories worth telling. Your next extraordinary expedition begins with a single click.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="btn-primary px-8 py-4 rounded-xl font-bold text-sm text-white shadow-xl hover:scale-105 transition-transform duration-300"
            >
              Start Your Journey
            </Link>
            <Link
              href="/become-guide"
              className="glass-panel px-8 py-4 rounded-xl font-bold text-sm text-slate-300 hover:bg-slate-900/80 hover:text-white transition-colors"
            >
              Become a Guide
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
