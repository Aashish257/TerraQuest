'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import { Award, Globe, MapPin, Star, Sparkles, Check, ArrowRight } from 'lucide-react';

const EXPERTISE_OPTIONS = [
  'Adventure',
  'Trekking',
  'Photography',
  'Food',
  'Culture',
  'Heritage',
  'Wildlife',
  'Nature',
];

const LANGUAGE_OPTIONS = [
  'English',
  'Hindi',
  'Spanish',
  'French',
  'German',
  'Bengali',
  'Punjabi',
  'Tamil',
  'Telugu',
  'Marathi',
];

export default function BecomeGuidePage() {
  const router = useRouter();
  const { user, isAuthenticated, login, initialize } = useAuthStore();
  
  const [experience, setExperience] = useState<number>(1);
  const [selectedExpertise, setSelectedExpertise] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Protect route
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/become-guide');
    } else if (user && user.role === 'guide') {
      router.push('/guide/dashboard');
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || (user && user.role === 'guide')) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-slate-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent"></div>
      </div>
    );
  }

  const handleExpertiseToggle = (item: string) => {
    setSelectedExpertise((prev) =>
      prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]
    );
  };

  const handleLanguageToggle = (item: string) => {
    setSelectedLanguages((prev) =>
      prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    if (selectedExpertise.length === 0) {
      setError('Please select at least one area of expertise.');
      setIsSubmitting(false);
      return;
    }

    if (selectedLanguages.length === 0) {
      setError('Please select at least one language.');
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await api.post('/guides/become', {
        experience,
        languages: selectedLanguages,
        expertise: selectedExpertise,
        location,
        bio,
      });

      if (res.data.success) {
        // Upgrade auth store user context immediately with new role & token
        login(res.data.user, res.data.token);
        router.push('/guide/dashboard');
      } else {
        setError(res.data.message || 'Failed to upgrade profile.');
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        'An error occurred during submission. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-950/20 via-slate-950 to-slate-950">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-teal-500/10 text-teal-400 mb-4 ring-1 ring-teal-500/20">
            <Award className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
            Become a <span className="bg-gradient-to-r from-teal-400 to-indigo-400 bg-clip-text text-transparent">Local Guide</span>
          </h1>
          <p className="mt-3 text-lg text-slate-400 max-w-xl mx-auto">
            Share your expertise, showcase hidden viewpoints, and help travelers discover the true essence of India.
          </p>
        </div>

        {/* Form Container */}
        <div className="relative rounded-2xl border border-white/10 bg-slate-900/40 p-8 shadow-2xl backdrop-blur-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-indigo-500/5 rounded-2xl pointer-events-none" />

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
            {/* Location & Experience */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="location" className="block text-sm font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-teal-400" />
                  Base Location
                </label>
                <input
                  type="text"
                  id="location"
                  required
                  placeholder="e.g., Manali, Shimla, Jaipur"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-slate-950 px-4 py-2.5 text-slate-200 placeholder-slate-500 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-all text-sm"
                />
              </div>

              <div>
                <label htmlFor="experience" className="block text-sm font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                  <Star className="h-4 w-4 text-teal-400" />
                  Years of Experience
                </label>
                <input
                  type="number"
                  id="experience"
                  required
                  min="0"
                  max="50"
                  value={experience}
                  onChange={(e) => setExperience(parseInt(e.target.value) || 0)}
                  className="w-full rounded-lg border border-white/10 bg-slate-950 px-4 py-2.5 text-slate-200 placeholder-slate-500 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-all text-sm"
                />
              </div>
            </div>

            {/* Languages */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-3 flex items-center gap-1.5">
                <Globe className="h-4 w-4 text-teal-400" />
                Languages Spoken
              </label>
              <div className="flex flex-wrap gap-2">
                {LANGUAGE_OPTIONS.map((lang) => {
                  const isSelected = selectedLanguages.includes(lang);
                  return (
                    <button
                      type="button"
                      key={lang}
                      id={`lang-btn-${lang.toLowerCase()}`}
                      onClick={() => handleLanguageToggle(lang)}
                      className={`inline-flex items-center gap-1 rounded-full px-3.5 py-1.5 text-xs font-semibold border transition-all ${
                        isSelected
                          ? 'bg-teal-500/10 border-teal-500/40 text-teal-300 shadow-md shadow-teal-500/5'
                          : 'bg-slate-950 border-white/5 text-slate-400 hover:border-white/10 hover:text-slate-200'
                      }`}
                    >
                      {isSelected && <Check className="h-3 w-3" />}
                      {lang}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Expertise */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-3 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-teal-400" />
                Expertise Area(s)
              </label>
              <div className="flex flex-wrap gap-2">
                {EXPERTISE_OPTIONS.map((exp) => {
                  const isSelected = selectedExpertise.includes(exp);
                  return (
                    <button
                      type="button"
                      key={exp}
                      id={`exp-btn-${exp.toLowerCase()}`}
                      onClick={() => handleExpertiseToggle(exp)}
                      className={`inline-flex items-center gap-1 rounded-full px-3.5 py-1.5 text-xs font-semibold border transition-all ${
                        isSelected
                          ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-300 shadow-md shadow-indigo-500/5'
                          : 'bg-slate-950 border-white/5 text-slate-400 hover:border-white/10 hover:text-slate-200'
                      }`}
                    >
                      {isSelected && <Check className="h-3 w-3" />}
                      {exp}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bio */}
            <div>
              <label htmlFor="bio" className="block text-sm font-semibold text-slate-300 mb-2">
                Introduce Yourself (Bio)
              </label>
              <textarea
                id="bio"
                rows={4}
                required
                maxLength={1000}
                placeholder="Tell travelers about your style, your story, your knowledge of local areas, and why they should choose you..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-slate-950 px-4 py-3 text-slate-200 placeholder-slate-500 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-all text-sm resize-none"
              />
              <span className="block text-right text-xs text-slate-500 mt-1">
                {bio.length}/1000 characters
              </span>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                id="become-guide-submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-indigo-600 px-4 py-3.5 font-bold text-white shadow-lg shadow-teal-500/15 hover:from-teal-400 hover:to-indigo-500 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                ) : (
                  <>
                    <span>Submit & Upgrade to Guide Profile</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
