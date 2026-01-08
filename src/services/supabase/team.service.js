import { supabase, isSupabaseConfigured } from './client';

/**
 * Team Service - User management for admins
 */
export const teamService = {
    /**
     * Get all team members (admins see all, creators see limited info)
     */
    getAll: async () => {
        if (!isSupabaseConfigured()) {
            throw new Error('Supabase not configured');
        }

        const { data, error } = await supabase
            .from('user_profiles')
            .select('id, email, full_name, role, avatar_url, created_at')
            .order('created_at', { ascending: true });

        if (error) throw error;
        return data;
    },

    /**
     * Get single team member by ID
     */
    getById: async (id) => {
        if (!isSupabaseConfigured()) {
            throw new Error('Supabase not configured');
        }

        const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Update team member role (admin only)
     */
    updateRole: async (userId, newRole) => {
        if (!isSupabaseConfigured()) {
            throw new Error('Supabase not configured');
        }

        if (!['admin', 'creator', 'editor', 'designer'].includes(newRole)) {
            throw new Error('Invalid role. Must be "admin", "editor", "designer", or "creator"');
        }

        const { data, error } = await supabase
            .from('user_profiles')
            .update({ role: newRole })
            .eq('id', userId)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Update team member profile
     */
    updateProfile: async (userId, updates) => {
        if (!isSupabaseConfigured()) {
            throw new Error('Supabase not configured');
        }

        const { data, error } = await supabase
            .from('user_profiles')
            .update({
                full_name: updates.full_name,
                avatar_url: updates.avatar_url
            })
            .eq('id', userId)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Invite new team member
     * Uses magic link email - new member clicks link to set password
     */
    invite: async (email, role, fullName = '') => {
        if (!isSupabaseConfigured()) {
            throw new Error('Supabase not configured');
        }

        // Get the base URL for redirect
        const siteUrl = window.location.origin;

        // Try to get session (may be null with mock auth)
        const { data: { session } } = await supabase.auth.getSession();

        // Try Edge Function first if we have a session
        if (session) {
            try {
                const response = await fetch(
                    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/invite-user`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${session.access_token}`,
                            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
                        },
                        body: JSON.stringify({ email, role, fullName })
                    }
                );

                if (response.ok) {
                    const result = await response.json();
                    if (result.success) {
                        return result;
                    }
                }
            } catch (e) {
                console.log('Edge function not available, using magic link fallback');
            }
        }

        // Use magic link (OTP) invitation
        // This sends an email directly - no session needed!
        const { data, error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                shouldCreateUser: true,
                data: {
                    full_name: fullName,
                    role: role,
                    invited_by: session?.user?.id || 'admin'
                },
                emailRedirectTo: `${siteUrl}/`
            }
        });

        if (error) {
            throw new Error(error.message);
        }

        return {
            success: true,
            message: `Invitation email sent to ${email}`,
            data: { email, role }
        };
    },

    /**
     * Deactivate team member (soft delete - just remove role)
     * The user remains in auth but loses app access
     */
    deactivate: async (userId) => {
        if (!isSupabaseConfigured()) {
            throw new Error('Supabase not configured');
        }

        const { data, error } = await supabase
            .from('user_profiles')
            .update({ role: null })
            .eq('id', userId)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Reactivate team member
     */
    reactivate: async (userId, role = 'creator') => {
        if (!isSupabaseConfigured()) {
            throw new Error('Supabase not configured');
        }

        const { data, error } = await supabase
            .from('user_profiles')
            .update({ role })
            .eq('id', userId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }
};

export default teamService;
