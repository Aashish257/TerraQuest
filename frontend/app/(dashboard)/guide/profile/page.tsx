'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import { User, MapPin, Star, Globe, Sparkles, Award, Check, Save } from 'lucide-react';

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

export default function GuideProfileEditPage() {
  const router = useRouter();
  const { user, isAuthenticated, initialize, updateUser } = useAuthStore();
  
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [experience, setExperience] = useState<number>(0);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedExpertise, setSelectedExpertise] = useState<string[]>([]);
  const [bio, setBio] = useState('');
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/guide/profile');
      return;
    }
    
    if (user && user.role !== 'guide') {
      router.push('/become-guide');
      return;
    }

    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        // Try fetching by user ID (works for both guideProfile._id and userId lookup)
        const res = await api.get(`/guides/${user?._id}`);
        if (res.data.success && res.data.guide) {
          const profile = res.data.guide;
          setName(profile.userId?.name || user?.name || '');
          setLocation(profile.location || '');
          setExperience(profile.experience || 0);
          setSelectedLanguages(profile.languages || []);
          setSelectedExpertise(profile.expertise || []);
          setBio(profile.bio || '');
        }
      } catch (err: any) {
        // 404 means no profile yet — that's fine, guide will create one by saving
        if (err.response?.status !== 404) {
          setError(err.response?.data?.message || 'Failed to fetch guide profile.');
        }
        // Pre-fill name from auth store
        setName(user?.name || '');
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [isAuthenticated, user, router]);

  const handleLanguageToggle = (lang: string) => {
    setSelectedLanguages((prev) =>
      prev.includes(lang) ? prev.filter((x) => x !== lang) : [...prev, lang]
    );
  };

  const handleExpertiseToggle = (exp: string) => {
    setSelectedExpertise((prev) =>
      prev.includes(exp) ? prev.filter((x) => x !== exp) : [...prev, exp]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setIsSaving(true);

    if (selectedExpertise.length === 0) {
      setError('Please select at least one area of expertise.');
      setIsSaving(false);
      return;
    }

    if (selectedLanguages.length === 0) {
      setError('Please select at least one language.');
      setIsSaving(false);
      return;
    }

    try {
      const res = await api.put('/guides/profile/me', {
        name,
        location,
        experience,
        languages: selectedLanguages,
        expertise: selectedExpertise,
        bio,
      });

      if (res.data.success) {
        setSuccessMsg('Profile updated successfully!');
        
        // Update local memory auth store user object with updated fields
        if (res.data.data?.user) {
          updateUser(res.data.data.user);
        }
        
        setTimeout(() => {
          router.push('/guide/dashboard');
        }, 1500);
      } else {
        setError(res.data.message || 'Failed to update profile.');
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        'An error occurred while updating profile.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-slate-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/15 via-slate-950 to-slate-950">
      <div className="mx-auto max-w-3xl">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <Award className="h-7 w-7 text-teal-400" />
              <span>Guide Profile</span>
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Update your public-facing local guide profile.
            </p>
          </div>
        </div>

        {/* First-time setup banner */}
        {!bio && !location && (
          <div className="mb-6 p-4 rounded-xl border border-teal-500/30 bg-teal-500/5 flex items-start gap-3">
            <div className="flex-shrink-0 rounded-lg bg-teal-500/10 p-2 text-teal-400">
              <Award className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-teal-300">Complete your guide profile</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Fill in your details below to activate your public profile. Travelers won&apos;t be able to find or request you until your profile is saved.
              </p>
            </div>
          </div>
        )}

        {/* Form Box */}
        <div className="relative rounded-2xl border border-white/10 bg-slate-900/40 p-8 shadow-2xl backdrop-blur-xl">
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="mb-6 p-4 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-300 text-sm flex items-center gap-2 font-semibold">
              <Check className="h-5 w-5" />
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Display Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                <User className="h-4 w-4 text-teal-400" />
                Display Name
              </label>
              <input
                type="text"
                id="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-slate-950 px-4 py-2.5 text-slate-200 placeholder-slate-500 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-all text-sm"
              />
            </div>

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
                  placeholder="e.g., Manali"
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
                          ? 'bg-teal-500/10 border-teal-500/40 text-teal-300'
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
                          ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-300'
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
                Bio Description
              </label>
              <textarea
                id="bio"
                rows={4}
                required
                maxLength={1000}
                placeholder="Introduce yourself to potential travelers..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-slate-950 px-4 py-3 text-slate-200 placeholder-slate-500 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-all text-sm resize-none"
              />
              <span className="block text-right text-xs text-slate-500 mt-1">
                {bio.length}/1000 characters
              </span>
            </div>

            {/* Submit */}
            <div className="pt-4 flex gap-4">
              <button
                type="button"
                onClick={() => router.push('/guide/dashboard')}
                className="w-1/3 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-bold text-slate-300 hover:bg-slate-800 transition-all text-center"
              >
                Cancel
              </button>
              <button
                type="submit"
                id="guide-profile-save"
                disabled={isSaving}
                className="w-2/3 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-indigo-600 px-4 py-3 font-bold text-white shadow-lg shadow-teal-500/15 hover:from-teal-400 hover:to-indigo-500 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
              >
                {isSaving ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Save Profile Changes</span>
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
