'use client';

/**
 * admin/users/page.tsx
 *
 * Admin view to monitor all platform users (Travelers, Guides, Admins).
 * Provides interactive search, filter by roles/status, toggle active state,
 * and change user roles dynamically.
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import {
  Users,
  Search,
  Shield,
  ShieldAlert,
  UserCheck,
  UserMinus,
  RefreshCw,
  Clock,
  MapPin,
  AlertCircle,
  Mail,
  UserCog,
  Check,
  X,
} from 'lucide-react';

interface UserDetail {
  _id: string;
  name: string;
  email: string;
  role: 'traveler' | 'guide' | 'admin';
  avatar?: string;
  bio?: string;
  location?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

const ROLE_CONFIG = {
  traveler: {
    label: 'Traveler',
    badgeClass: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20',
  },
  guide: {
    label: 'Guide',
    badgeClass: 'bg-teal-500/10 text-teal-300 border-teal-500/20',
  },
  admin: {
    label: 'Admin',
    badgeClass: 'bg-rose-500/10 text-rose-300 border-rose-500/20',
  },
};

export default function AdminUsersPage() {
  const router = useRouter();
  const { user: currentUser, isAuthenticated, initialize } = useAuthStore();

  const [users, setUsers] = useState<UserDetail[]>([]);
  const [filtered, setFiltered] = useState<UserDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'traveler' | 'guide' | 'admin'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'deactivated'>('all');
  
  // Modals / Dropdowns state
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/admin/users');
      return;
    }
    if (currentUser && currentUser.role !== 'admin') {
      router.push('/destinations');
      return;
    }
    if (currentUser?.role === 'admin') {
      fetchUsers();
    }
  }, [isAuthenticated, currentUser, router]);

  useEffect(() => {
    let result = users;

    // Apply role filter
    if (roleFilter !== 'all') {
      result = result.filter((u) => u.role === roleFilter);
    }

    // Apply active/inactive filter
    if (statusFilter !== 'all') {
      const activeVal = statusFilter === 'active';
      result = result.filter((u) => u.isActive === activeVal);
    }

    // Apply search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          (u.location && u.location.toLowerCase().includes(q))
      );
    }

    setFiltered(result);
  }, [users, searchQuery, roleFilter, statusFilter]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await api.get('/users');
      if (res.data.success) {
        setUsers(res.data.users || []);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch users list.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusToggle = async (targetUser: UserDetail) => {
    if (targetUser._id === currentUser?._id) {
      setError('You cannot deactivate your own account.');
      return;
    }

    try {
      setError(null);
      setSuccessMsg(null);
      setUpdatingUserId(targetUser._id);
      const nextStatus = !targetUser.isActive;
      
      const res = await api.patch(`/users/${targetUser._id}/status`, {
        isActive: nextStatus,
      });

      if (res.data.success) {
        setUsers((prev) =>
          prev.map((u) => (u._id === targetUser._id ? { ...u, isActive: nextStatus } : u))
        );
        setSuccessMsg(`Successfully ${nextStatus ? 'activated' : 'deactivated'} ${targetUser.name}.`);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update user status.');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleRoleChange = async (targetUser: UserDetail, newRole: 'traveler' | 'guide' | 'admin') => {
    if (targetUser._id === currentUser?._id) {
      setError('You cannot change your own role.');
      return;
    }

    try {
      setError(null);
      setSuccessMsg(null);
      setUpdatingUserId(targetUser._id);

      const res = await api.patch(`/users/${targetUser._id}/role`, {
        role: newRole,
      });

      if (res.data.success) {
        setUsers((prev) =>
          prev.map((u) => (u._id === targetUser._id ? { ...u, role: newRole } : u))
        );
        setSuccessMsg(`Successfully updated role of ${targetUser.name} to ${ROLE_CONFIG[newRole].label}.`);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update user role.');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const formatLastLogin = (dateString?: string) => {
    if (!dateString) return 'Never logged in';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // Stats derived from all users
  const stats = {
    total: users.length,
    active: users.filter((u) => u.isActive).length,
    deactivated: users.filter((u) => !u.isActive).length,
    travelers: users.filter((u) => u.role === 'traveler').length,
    guides: users.filter((u) => u.role === 'guide').length,
    admins: users.filter((u) => u.role === 'admin').length,
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-rose-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 py-8 px-4 sm:px-6 lg:px-8 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-950/10 via-slate-950 to-slate-950">
      <div className="mx-auto max-w-6xl">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="rounded-lg p-1.5 bg-rose-500/10 text-rose-400">
                <Users className="h-4 w-4" />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-rose-400">Admin Control</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Platform Users</h1>
            <p className="mt-1 text-sm text-slate-400">
              Manage platform users, update authorization roles, toggle active access, and review activity details.
            </p>
          </div>
          <button
            onClick={fetchUsers}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors self-start sm:self-center"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </button>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {[
            { label: 'Total Users', value: stats.total, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
            { label: 'Active Users', value: stats.active, color: 'text-teal-400', bg: 'bg-teal-500/10' },
            { label: 'Deactivated', value: stats.deactivated, color: 'text-rose-400', bg: 'bg-rose-500/10' },
            { label: 'Travelers', value: stats.travelers, color: 'text-blue-400', bg: 'bg-blue-500/10' },
            { label: 'Guides', value: stats.guides, color: 'text-amber-400', bg: 'bg-amber-500/10' },
            { label: 'Admins', value: stats.admins, color: 'text-rose-400', bg: 'bg-rose-500/10' },
          ].map((stat, i) => (
            <div
              key={i}
              className="rounded-xl border border-white/5 bg-slate-900/40 p-4 backdrop-blur-sm hover:border-white/10 transition-all"
            >
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">{stat.label}</div>
              <div className="flex items-center justify-between">
                <span className="text-xl font-extrabold text-white">{stat.value}</span>
                <span className={`h-2 w-2 rounded-full ${stat.color} ${stat.bg} ring-4 ring-white/5`} />
              </div>
            </div>
          ))}
        </div>

        {/* Filters Panel */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, or location..."
              className="w-full rounded-xl border border-white/10 bg-slate-900/60 pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-colors"
            />
          </div>

          {/* Role Filter */}
          <div className="flex gap-2">
            <span className="inline-flex items-center text-xs font-semibold text-slate-400 pl-1">Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/50"
            >
              <option value="all">All Roles</option>
              <option value="traveler">Travelers Only</option>
              <option value="guide">Guides Only</option>
              <option value="admin">Admins Only</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex gap-2">
            <span className="inline-flex items-center text-xs font-semibold text-slate-400 pl-1">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/50"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="deactivated">Deactivated Only</option>
            </select>
          </div>
        </div>

        {/* Message banners */}
        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 text-sm text-rose-400">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-teal-500/20 bg-teal-500/5 p-4 text-sm text-teal-400">
            <UserCheck className="h-5 w-5 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Users Table */}
        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur-sm">
          <table className="w-full border-collapse text-left text-sm text-slate-200">
            <thead>
              <tr className="border-b border-white/10 bg-slate-950/60 font-semibold text-slate-300">
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Last Login</th>
                <th className="px-6 py-4">Joined Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    No users found matching the filter criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((u) => {
                  const roleConfig = ROLE_CONFIG[u.role];
                  const isSelf = u._id === currentUser?._id;
                  const isUpdating = updatingUserId === u._id;

                  return (
                    <tr
                      key={u._id}
                      className={`hover:bg-white/5 transition-colors ${
                        !u.isActive ? 'opacity-65 hover:opacity-100' : ''
                      }`}
                    >
                      {/* User Info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-sm">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-white flex items-center gap-1.5">
                              {u.name}
                              {isSelf && (
                                <span className="inline-flex rounded bg-rose-500/10 border border-rose-500/20 px-1 py-0.5 text-[9px] font-bold text-rose-400 uppercase tracking-widest">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-400 flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {u.email}
                            </div>
                            {u.location && (
                              <div className="text-[10px] text-slate-500 flex items-center gap-0.5 mt-0.5">
                                <MapPin className="h-2.5 w-2.5" />
                                {u.location}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="px-6 py-4">
                        {isSelf ? (
                          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${roleConfig.badgeClass}`}>
                            {roleConfig.label}
                          </span>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <select
                              value={u.role}
                              disabled={isUpdating}
                              onChange={(e) => handleRoleChange(u, e.target.value as any)}
                              className="rounded-lg border border-white/10 bg-slate-900 py-1 px-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-rose-500/50 cursor-pointer disabled:opacity-50"
                            >
                              <option value="traveler">Traveler</option>
                              <option value="guide">Guide</option>
                              <option value="admin">Admin</option>
                            </select>
                          </div>
                        )}
                      </td>

                      {/* Active Status */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          u.isActive
                            ? 'bg-teal-500/10 text-teal-300 border border-teal-500/20'
                            : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${u.isActive ? 'bg-teal-400' : 'bg-rose-400'}`} />
                          {u.isActive ? 'Active' : 'Disabled'}
                        </span>
                      </td>

                      {/* Last Login */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <Clock className="h-3.5 w-3.5 text-slate-500" />
                          <span className="text-xs">{formatLastLogin(u.lastLogin)}</span>
                        </div>
                      </td>

                      {/* Joined Date */}
                      <td className="px-6 py-4 text-xs text-slate-400">
                        {new Date(u.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        {isSelf ? (
                          <span className="text-xs text-slate-600 font-medium">No actions</span>
                        ) : (
                          <button
                            onClick={() => handleStatusToggle(u)}
                            disabled={isUpdating}
                            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition-all border ${
                              u.isActive
                                ? 'bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/20'
                                : 'bg-teal-500/10 border-teal-500/20 text-teal-400 hover:bg-teal-500/20'
                            } disabled:opacity-50`}
                          >
                            {u.isActive ? (
                              <>
                                <UserMinus className="h-3.5 w-3.5" />
                                <span>Deactivate</span>
                              </>
                            ) : (
                              <>
                                <UserCheck className="h-3.5 w-3.5" />
                                <span>Activate</span>
                              </>
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        {filtered.length > 0 && (
          <p className="mt-4 text-center text-xs text-slate-600">
            Showing {filtered.length} of {users.length} registered users
          </p>
        )}
        
      </div>
    </div>
  );
}
