'use client';

/**
 * page.tsx — Trip Details Screen
 *
 * Displays details of a single trip, group members (if group trip),
 * and links to the budget tracker. Allows owners to invite/remove members
 * and edit or delete the trip.
 */

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import {
  Calendar,
  User,
  Users,
  Plus,
  Loader2,
  MapPin,
  ArrowLeft,
  DollarSign,
  Trash2,
  Edit,
  UserMinus,
  AlertCircle,
  TrendingUp,
  Settings,
  X,
  Check
} from 'lucide-react';

interface Member {
  _id: string;
  role: 'owner' | 'member';
  userId: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
}

interface Trip {
  _id: string;
  title: string;
  tripType: 'solo' | 'group';
  startDate: string;
  endDate: string;
  budget: number;
  status: 'planning' | 'ongoing' | 'completed' | 'cancelled';
  ownerId: string;
  destinationId?: {
    _id: string;
    name: string;
    country: string;
    state?: string;
  };
}

export default function TripDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = params.id as string;

  const { isAuthenticated, user, initialize } = useAuthStore();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Invite member state
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState(false);

  // Edit trip modal/form state
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editBudget, setEditBudget] = useState(0);
  const [editStartDate, setEditStartDate] = useState('');
  const [editEndDate, setEditEndDate] = useState('');
  const [editStatus, setEditStatus] = useState<Trip['status']>('planning');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  // Delete state
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const fetchTripDetails = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const response = await api.get(`/trips/${tripId}`);
      if (response.data.success) {
        setTrip(response.data.trip);
        setMembers(response.data.members || []);
        
        // Populate edit form states
        const t = response.data.trip;
        setEditTitle(t.title);
        setEditBudget(t.budget);
        setEditStartDate(new Date(t.startDate).toISOString().split('T')[0]);
        setEditEndDate(new Date(t.endDate).toISOString().split('T')[0]);
        setEditStatus(t.status);
      }
    } catch (err: any) {
      console.error('Error fetching trip details:', err);
      if (err.response?.status === 401) {
        router.push('/login');
        return;
      }
      if (err.response?.status === 403) {
        setErrorMsg('Access denied: You are not a member of this trip.');
        return;
      }
      setErrorMsg('Could not load trip details. It may have been deleted.');
    } finally {
      setIsLoading(false);
    }
  }, [tripId, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchTripDetails();
    } else if (!isLoading) {
      router.push('/login');
    }
  }, [isAuthenticated, fetchTripDetails, router, isLoading]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setIsInviting(true);
    setInviteError(null);
    setInviteSuccess(false);

    try {
      const res = await api.post(`/trips/${tripId}/members`, { email: inviteEmail.trim() });
      if (res.data.success) {
        setInviteSuccess(true);
        setInviteEmail('');
        // Refresh details to show new member
        await fetchTripDetails();
      }
    } catch (err: any) {
      console.error('Error inviting member:', err);
      setInviteError(err.response?.data?.message || 'Failed to invite user. Make sure they are registered.');
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemoveMember = async (targetUserId: string) => {
    if (!confirm('Are you sure you want to remove this member from the trip?')) return;
    try {
      const res = await api.delete(`/trips/${tripId}/members/${targetUserId}`);
      if (res.data.success) {
        setMembers(members.filter((m) => m.userId._id !== targetUserId));
      }
    } catch (err: any) {
      console.error('Error removing member:', err);
      alert(err.response?.data?.message || 'Failed to remove member.');
    }
  };

  const handleUpdateTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle.trim()) {
      setUpdateError('Title is required');
      return;
    }
    if (new Date(editStartDate) > new Date(editEndDate)) {
      setUpdateError('End date must be after start date');
      return;
    }

    setIsUpdating(true);
    setUpdateError(null);
    try {
      const res = await api.put(`/trips/${tripId}`, {
        title: editTitle,
        startDate: editStartDate,
        endDate: editEndDate,
        budget: Number(editBudget),
        status: editStatus,
      });

      if (res.data.success) {
        setTrip(res.data.trip);
        setIsEditing(false);
      }
    } catch (err: any) {
      console.error('Error updating trip:', err);
      setUpdateError(err.response?.data?.message || 'Failed to update trip details.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteTrip = async () => {
    if (!confirm('WARNING: Are you sure you want to delete this trip? This will permanently erase the itinerary, all invited members, and all budget expenses. This action cannot be undone!')) {
      return;
    }
    setIsDeleting(true);
    try {
      const res = await api.delete(`/trips/${tripId}`);
      if (res.data.success) {
        router.push('/trips');
      }
    } catch (err: any) {
      console.error('Error deleting trip:', err);
      alert(err.response?.data?.message || 'Failed to delete trip.');
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'planning':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/25';
      case 'ongoing':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25';
      case 'completed':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/25';
      case 'cancelled':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/25';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/25';
    }
  };

  if (isLoading) {
    return (
      <div className="flex-grow flex flex-col justify-center items-center py-20 bg-slate-950">
        <Loader2 className="h-10 w-10 text-teal-500 animate-spin" />
        <p className="mt-4 text-sm text-slate-500">Loading trip details...</p>
      </div>
    );
  }

  if (errorMsg || !trip) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-rose-500" />
        <h3 className="mt-4 text-lg font-bold text-white">Error Loading Trip</h3>
        <p className="mt-2 text-sm text-slate-400">{errorMsg || 'Trip details could not be retrieved.'}</p>
        <div className="mt-6">
          <Link
            href="/trips"
            className="inline-flex items-center space-x-2 rounded-lg bg-slate-900 border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Trips</span>
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = user?._id === trip.ownerId;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 w-full flex-grow flex flex-col justify-start">
      {/* Back link */}
      <div className="mb-6">
        <Link
          href="/trips"
          className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-teal-400 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Trips</span>
        </Link>
      </div>

      {/* Main Grid: Trip Summary Details & Members Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left 2 Cols: Trip Info card & quick stats */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-6 sm:p-8 shadow-2xl backdrop-blur-md relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />

            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-4 sm:space-y-0">
              <div>
                <div className="flex items-center space-x-3">
                  <span className={`rounded-md border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${getStatusStyle(trip.status)}`}>
                    {trip.status}
                  </span>
                  <span className="flex items-center space-x-1 text-xs font-semibold text-slate-400">
                    {trip.tripType === 'group' ? (
                      <>
                        <Users className="h-3.5 w-3.5 text-indigo-400" />
                        <span>Group Trip</span>
                      </>
                    ) : (
                      <>
                        <User className="h-3.5 w-3.5 text-teal-400" />
                        <span>Solo Trip</span>
                      </>
                    )}
                  </span>
                </div>

                <h1 className="mt-4 text-3xl font-extrabold text-white sm:text-4xl">
                  {trip.title}
                </h1>

                {trip.destinationId && (
                  <div className="mt-3 flex items-center space-x-1.5 text-base text-slate-300">
                    <MapPin className="h-4 w-4 text-teal-400" />
                    <span>
                      {trip.destinationId.name}, {trip.destinationId.country}
                      {trip.destinationId.state ? ` (${trip.destinationId.state})` : ''}
                    </span>
                  </div>
                )}
              </div>

              {/* Owner actions */}
              {isOwner && (
                <div className="flex space-x-2 self-start sm:self-auto">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
                  >
                    <Edit className="h-3.5 w-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={handleDeleteTrip}
                    disabled={isDeleting}
                    className="flex items-center space-x-1.5 rounded-lg border border-rose-500/20 bg-rose-500/10 px-3.5 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/20 transition-colors disabled:opacity-50"
                  >
                    {isDeleting ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>

            {/* Travel Specs (Dates & Budget) */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-white/5 pt-6">
              <div className="flex items-start space-x-3">
                <div className="rounded-lg bg-teal-500/10 p-2.5 text-teal-400">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Duration</span>
                  <span className="text-sm font-semibold text-slate-200">
                    {formatDate(trip.startDate)}
                  </span>
                  <span className="text-xs text-slate-400 block mt-0.5">
                    to {formatDate(trip.endDate)}
                  </span>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="rounded-lg bg-indigo-500/10 p-2.5 text-indigo-400">
                  <DollarSign className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Total Planned Budget</span>
                  <span className="text-lg font-bold text-white">
                    ₹{trip.budget.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs text-slate-400 block mt-0.5">
                    Allocated fund pool
                  </span>
                </div>
              </div>
            </div>

            {/* Link to Budget Tracker Action Card */}
            <div className="mt-8 rounded-xl bg-gradient-to-r from-teal-500/10 to-indigo-500/10 border border-white/5 p-6 flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="rounded-lg bg-teal-400/10 p-3 text-teal-400">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div className="text-center sm:text-left">
                  <h4 className="font-bold text-white text-base">Expense & Budget Tracker</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Log vacation expenses, view progressive reports, and track remaining balance.
                  </p>
                </div>
              </div>
              <Link
                href={`/trips/${trip._id}/budget`}
                className="w-full sm:w-auto text-center rounded-lg bg-gradient-to-r from-teal-500 to-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md hover:from-teal-400 hover:to-indigo-500 transition-all hover:scale-[1.02]"
              >
                Open Budget Tracker
              </Link>
            </div>
          </div>
        </div>

        {/* Right Col: Group Members Panel */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-6 shadow-2xl backdrop-blur-md">
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <Users className="h-5 w-5 text-indigo-400" />
              <span>Group Members</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1.5">
              {trip.tripType === 'group'
                ? 'Only members invited by the owner can access trip logs.'
                : 'This is a private solo trip. Members option disabled.'}
            </p>

            {trip.tripType === 'group' && (
              <div className="mt-6 space-y-4">
                {/* Members list */}
                <div className="divide-y divide-white/5 max-h-60 overflow-y-auto pr-1">
                  {members.map((member) => (
                    <div key={member._id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center border border-white/10 text-xs font-bold text-indigo-400">
                          {member.userId.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-200">{member.userId.name}</p>
                          <p className="text-[10px] text-slate-500">{member.userId.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          member.role === 'owner' ? 'bg-teal-500/10 text-teal-400' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {member.role}
                        </span>

                        {/* Remove Member button (if current user is owner, and this user is not the owner) */}
                        {isOwner && member.userId._id !== trip.ownerId && (
                          <button
                            onClick={() => handleRemoveMember(member.userId._id)}
                            className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                            title="Remove member"
                          >
                            <UserMinus className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Invite panel (Only for group trips & trip owner) */}
                {isOwner && (
                  <div className="mt-6 border-t border-white/5 pt-6">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Invite Traveler</h4>
                    <form onSubmit={handleInvite} className="mt-3 flex space-x-2">
                      <input
                        type="email"
                        placeholder="traveler@email.com"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        className="flex-grow rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-teal-500 transition-colors"
                        required
                      />
                      <button
                        type="submit"
                        disabled={isInviting || !inviteEmail}
                        className="rounded-lg bg-teal-500 px-3.5 py-2 text-xs font-bold text-slate-950 hover:bg-teal-400 transition-colors disabled:opacity-50"
                      >
                        {isInviting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Invite'}
                      </button>
                    </form>

                    {inviteSuccess && (
                      <p className="mt-2 text-[10px] font-semibold text-emerald-400 flex items-center space-x-1">
                        <Check className="h-3 w-3" />
                        <span>Invitation sent successfully!</span>
                      </p>
                    )}

                    {inviteError && (
                      <p className="mt-2 text-[10px] font-semibold text-rose-400 flex items-center space-x-1">
                        <AlertCircle className="h-3 w-3" />
                        <span>{inviteError}</span>
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Inline Modal dialog for Editing Details */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <h3 className="text-lg font-bold text-white">Edit Trip Details</h3>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setUpdateError(null);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateTrip} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Trip Title
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2 text-sm text-white placeholder-slate-600 outline-none focus:border-teal-500 transition-colors"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={editStartDate}
                    onChange={(e) => setEditStartDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2 text-sm text-white outline-none focus:border-teal-500 transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={editEndDate}
                    onChange={(e) => setEditEndDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2 text-sm text-white outline-none focus:border-teal-500 transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Planned Budget (INR)
                </label>
                <input
                  type="number"
                  min={0}
                  value={editBudget}
                  onChange={(e) => setEditBudget(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2 text-sm text-white outline-none focus:border-teal-500 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Trip Status
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as Trip['status'])}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2 text-sm text-white outline-none focus:border-teal-500 transition-colors"
                >
                  <option value="planning">Planning</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {updateError && (
                <div className="flex items-center space-x-1.5 text-xs text-rose-400 font-semibold bg-rose-500/10 border border-rose-500/20 rounded-lg p-3">
                  <AlertCircle className="h-4 w-4" />
                  <span>{updateError}</span>
                </div>
              )}

              <div className="flex space-x-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setUpdateError(null);
                  }}
                  className="w-1/2 rounded-lg border border-slate-700 bg-slate-950 py-2.5 text-xs font-bold text-slate-300 hover:bg-slate-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="w-1/2 rounded-lg bg-teal-500 py-2.5 text-xs font-bold text-slate-950 hover:bg-teal-400 transition-colors disabled:opacity-50 flex items-center justify-center space-x-1.5"
                >
                  {isUpdating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
