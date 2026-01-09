import React, { useState, useEffect } from 'react';
import {
    Users, UserPlus, Shield, Edit2,
    Check, X, Mail, MoreVertical,
    ChevronDown, AlertCircle
} from 'lucide-react';
import { GlassCard, Button, Input } from './common';
import { useAuth } from '../context';
import { teamService } from '../services/supabase';
import { isSupabaseConfigured } from '../services/supabase/client';

// Mock data for development
const MOCK_TEAM = [
    { id: '1', email: 'admin@keanuvisuals.com', full_name: 'Keanu', role: 'admin', created_at: '2026-01-07' },
    { id: '2', email: 'designer@keanuvisuals.com', full_name: 'Designer User', role: 'designer', created_at: '2026-01-08' },
];

/**
 * TeamModule - Admin user management panel
 */
const TeamModule = ({ userRole }) => {
    // Directly use userRole prop (mock auth) - AuthContext not used with mock system
    const isAdmin = userRole === 'admin';
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [editingMember, setEditingMember] = useState(null);

    // Fetch team members
    useEffect(() => {
        fetchMembers();
    }, []);

    const fetchMembers = async () => {
        setLoading(true);
        setError(null);
        try {
            if (isSupabaseConfigured()) {
                const data = await teamService.getAll();
                setMembers(data || []);
            } else {
                // Use mock data in development
                setMembers(MOCK_TEAM);
            }
        } catch (err) {
            console.error('Error fetching team:', err);
            setError(err.message);
            // Fallback to mock
            setMembers(MOCK_TEAM);
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (memberId, newRole) => {
        try {
            if (isSupabaseConfigured()) {
                await teamService.updateRole(memberId, newRole);
            }
            // Update local state
            setMembers(prev => prev.map(m =>
                m.id === memberId ? { ...m, role: newRole } : m
            ));
            setEditingMember(null);
        } catch (err) {
            console.error('Error updating role:', err);
            setError(err.message);
        }
    };

    const handleInvite = async (email, role, fullName) => {
        try {
            if (isSupabaseConfigured()) {
                await teamService.invite(email, role, fullName);
            }
            // Refresh the list
            await fetchMembers();
            setShowInviteModal(false);
        } catch (err) {
            console.error('Error inviting member:', err);
            throw err;
        }
    };

    const handleDeactivate = async (memberId) => {
        if (!confirm('Are you sure you want to deactivate this member?')) return;

        try {
            if (isSupabaseConfigured()) {
                await teamService.deactivate(memberId);
            }
            setMembers(prev => prev.map(m =>
                m.id === memberId ? { ...m, role: null } : m
            ));
        } catch (err) {
            console.error('Error deactivating member:', err);
            setError(err.message);
        }
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Users className="w-6 h-6 text-sunset-orange" />
                    <h2 className="text-2xl font-bold text-white-smoke">Team</h2>
                    <span className="text-sm text-white-smoke/50">
                        {members.length} member{members.length !== 1 ? 's' : ''}
                    </span>
                </div>

                {isAdmin && (
                    <Button
                        onClick={() => setShowInviteModal(true)}
                        className="flex items-center gap-2 bg-sunset-orange hover:bg-sunset-orange/90"
                    >
                        <UserPlus className="w-4 h-4" />
                        Invite Member
                    </Button>
                )}
            </div>

            {/* Error message */}
            {error && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                </div>
            )}

            {/* Team Members List */}
            <GlassCard className="overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-white-smoke/50">
                        Loading team members...
                    </div>
                ) : members.length === 0 ? (
                    <div className="p-8 text-center text-white-smoke/50">
                        No team members yet. Invite your first member!
                    </div>
                ) : (
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/10">
                                <th className="text-left p-4 text-xs font-medium text-white-smoke/50 uppercase tracking-wider">
                                    Member
                                </th>
                                <th className="text-left p-4 text-xs font-medium text-white-smoke/50 uppercase tracking-wider">
                                    Role
                                </th>
                                <th className="text-left p-4 text-xs font-medium text-white-smoke/50 uppercase tracking-wider">
                                    Joined
                                </th>
                                {isAdmin && (
                                    <th className="text-right p-4 text-xs font-medium text-white-smoke/50 uppercase tracking-wider">
                                        Actions
                                    </th>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {members.map((member) => (
                                <MemberRow
                                    key={member.id}
                                    member={member}
                                    isAdmin={isAdmin}
                                    isEditing={editingMember === member.id}
                                    onEdit={() => setEditingMember(member.id)}
                                    onCancelEdit={() => setEditingMember(null)}
                                    onRoleChange={handleRoleChange}
                                    onDeactivate={handleDeactivate}
                                />
                            ))}
                        </tbody>
                    </table>
                )}
            </GlassCard>

            {/* Invite Modal */}
            {showInviteModal && (
                <InviteModal
                    onClose={() => setShowInviteModal(false)}
                    onInvite={handleInvite}
                />
            )}
        </div>
    );
};

/**
 * Member Row Component
 */
const MemberRow = ({
    member,
    isAdmin,
    isEditing,
    onEdit,
    onCancelEdit,
    onRoleChange,
    onDeactivate
}) => {
    const [selectedRole, setSelectedRole] = useState(member.role);
    const isDeactivated = !member.role;

    const handleSaveRole = () => {
        onRoleChange(member.id, selectedRole);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <tr className={`border-b border-white/5 hover:bg-white/5 transition-colors ${isDeactivated ? 'opacity-50' : ''}`}>
            {/* Member info */}
            <td className="p-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sunset-orange to-amethyst-purple flex items-center justify-center text-white font-semibold">
                        {member.full_name?.[0]?.toUpperCase() || member.email[0].toUpperCase()}
                    </div>
                    <div>
                        <p className="text-white-smoke font-medium">
                            {member.full_name || 'No name'}
                        </p>
                        <p className="text-sm text-white-smoke/50">{member.email}</p>
                    </div>
                </div>
            </td>

            {/* Role */}
            <td className="p-4">
                {isEditing ? (
                    <div className="flex items-center gap-2">
                        <select
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                            className="bg-charcoal border border-white/10 rounded-lg px-3 py-1.5 text-white-smoke text-sm focus:outline-none focus:border-sunset-orange"
                        >
                            <option value="admin">Admin</option>
                            <option value="editor">Editor</option>
                            <option value="designer">Designer</option>
                        </select>
                        <button
                            onClick={handleSaveRole}
                            className="p-1.5 hover:bg-green-500/20 rounded-lg text-green-400"
                        >
                            <Check className="w-4 h-4" />
                        </button>
                        <button
                            onClick={onCancelEdit}
                            className="p-1.5 hover:bg-red-500/20 rounded-lg text-red-400"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${member.role === 'admin'
                        ? 'bg-amethyst-purple/20 text-amethyst-purple border border-amethyst-purple/30'
                        : member.role === 'editor'
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            : member.role === 'designer'
                                ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30'
                                : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                        }`}>
                        {member.role === 'admin' && <Shield className="w-3 h-3" />}
                        {member.role || 'Deactivated'}
                    </span>
                )}
            </td>

            {/* Joined date */}
            <td className="p-4 text-sm text-white-smoke/50">
                {formatDate(member.created_at)}
            </td>

            {/* Actions */}
            {isAdmin && (
                <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                        {!isDeactivated && (
                            <button
                                onClick={onEdit}
                                className="p-2 hover:bg-white/10 rounded-lg text-white-smoke/70 hover:text-white-smoke transition-colors"
                                title="Edit role"
                            >
                                <Edit2 className="w-4 h-4" />
                            </button>
                        )}
                        <button
                            onClick={() => onDeactivate(member.id)}
                            className="p-2 hover:bg-red-500/10 rounded-lg text-white-smoke/70 hover:text-red-400 transition-colors"
                            title={isDeactivated ? "Already deactivated" : "Deactivate member"}
                            disabled={isDeactivated}
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </td>
            )}
        </tr>
    );
};

/**
 * Invite Modal Component
 */
const InviteModal = ({ onClose, onInvite }) => {
    const [email, setEmail] = useState('');
    const [fullName, setFullName] = useState('');
    const [role, setRole] = useState('editor');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email) {
            setError('Email is required');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await onInvite(email, role, fullName);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <GlassCard className="w-full max-w-md m-4">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-sunset-orange/20 rounded-lg">
                                <UserPlus className="w-5 h-5 text-sunset-orange" />
                            </div>
                            <h3 className="text-xl font-semibold text-white-smoke">
                                Invite Team Member
                            </h3>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/10 rounded-lg text-white-smoke/70"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-white-smoke/70 mb-1.5">
                                Email Address *
                            </label>
                            <Input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="teammate@keanuvisuals.com"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-white-smoke/70 mb-1.5">
                                Full Name
                            </label>
                            <Input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="John Doe"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-white-smoke/70 mb-1.5">
                                Role
                            </label>
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="w-full bg-charcoal border border-white/10 rounded-lg px-4 py-2.5 text-white-smoke focus:outline-none focus:border-sunset-orange appearance-none cursor-pointer"
                                style={{
                                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23F5F5F5' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
                                    backgroundRepeat: 'no-repeat',
                                    backgroundPosition: 'right 12px center',
                                    backgroundSize: '16px'
                                }}
                            >
                                <option value="editor" className="bg-charcoal text-white-smoke py-2">Editor</option>
                                <option value="designer" className="bg-charcoal text-white-smoke py-2">Designer</option>
                                <option value="admin" className="bg-charcoal text-white-smoke py-2">Admin</option>
                            </select>
                            <p className="mt-1.5 text-xs text-white-smoke/50">
                                {role === 'admin'
                                    ? 'Full access to all features and team management'
                                    : role === 'editor'
                                        ? 'Can edit workflows and manage production boards'
                                        : role === 'designer'
                                            ? 'Can manage inspiration boards and visual assets'
                                            : 'General content creation access'}
                            </p>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Button
                                type="button"
                                onClick={onClose}
                                className="flex-1 bg-white/10 hover:bg-white/20"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="flex-1 bg-sunset-orange hover:bg-sunset-orange/90 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <Mail className="w-4 h-4" />
                                        Send Invite
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </GlassCard>
        </div>
    );
};

export default TeamModule;
