import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabase/client';

// Create Auth Context
const AuthContext = createContext(null);

/**
 * Auth Provider - Manages authentication state globally
 * Supports both Supabase (production) and mock (development) modes
 */
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Determine if using Supabase or mock
    const useSupabase = isSupabaseConfigured();

    // Fetch user profile from Supabase
    const fetchProfile = useCallback(async (userId) => {
        if (!supabase) return null;

        const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            console.error('Error fetching profile:', error);
            return null;
        }
        return data;
    }, []);

    // Initialize auth state
    useEffect(() => {
        const initAuth = async () => {
            if (useSupabase) {
                // SUPABASE MODE
                const { data: { session } } = await supabase.auth.getSession();

                if (session?.user) {
                    setUser(session.user);
                    const profileData = await fetchProfile(session.user.id);
                    setProfile(profileData);
                    setUserRole(profileData?.role || 'creator');
                    setIsAuthenticated(true);
                }
                setLoading(false);

                // Listen for auth changes
                const { data: { subscription } } = supabase.auth.onAuthStateChange(
                    async (_event, session) => {
                        if (session?.user) {
                            setUser(session.user);
                            const profileData = await fetchProfile(session.user.id);
                            setProfile(profileData);
                            setUserRole(profileData?.role || 'creator');
                            setIsAuthenticated(true);
                        } else {
                            setUser(null);
                            setProfile(null);
                            setUserRole(null);
                            setIsAuthenticated(false);
                        }
                    }
                );

                return () => subscription.unsubscribe();
            } else {
                // MOCK MODE - Use localStorage
                const storedUser = localStorage.getItem('creator_hub_user');
                const storedRole = localStorage.getItem('creator_hub_role');

                if (storedUser && storedRole) {
                    setUser(JSON.parse(storedUser));
                    setUserRole(storedRole);
                    setIsAuthenticated(true);
                }
                setLoading(false);
            }
        };

        initAuth();
    }, [useSupabase, fetchProfile]);

    // Login function - works with both Supabase and mock
    const login = async (roleOrEmail, password = null) => {
        setError(null);
        setLoading(true);

        if (useSupabase && password) {
            // SUPABASE LOGIN
            const { data, error: signInError } = await supabase.auth.signInWithPassword({
                email: roleOrEmail,
                password
            });

            if (signInError) {
                setError(signInError.message);
                setLoading(false);
                return { success: false, error: signInError.message };
            }

            // Profile will be set by onAuthStateChange
            setLoading(false);
            return { success: true };
        } else {
            // MOCK LOGIN (for development)
            const userData = { email: 'user@creatorhub.com', role: roleOrEmail };
            setUser(userData);
            setUserRole(roleOrEmail);
            setIsAuthenticated(true);

            localStorage.setItem('creator_hub_user', JSON.stringify(userData));
            localStorage.setItem('creator_hub_role', roleOrEmail);

            setLoading(false);
            return { success: true };
        }
    };

    // Sign up function (Supabase only)
    const signUp = async (email, password, metadata = {}) => {
        if (!useSupabase) {
            return { success: false, error: 'Sign up requires Supabase' };
        }

        setError(null);
        setLoading(true);

        const { data, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: metadata.fullName || '',
                    role: metadata.role || 'creator'
                }
            }
        });

        if (signUpError) {
            setError(signUpError.message);
            setLoading(false);
            return { success: false, error: signUpError.message };
        }

        setLoading(false);
        return { success: true, data };
    };

    // Logout function
    const logout = async () => {
        setLoading(true);

        if (useSupabase) {
            await supabase.auth.signOut();
        }

        setUser(null);
        setProfile(null);
        setUserRole(null);
        setIsAuthenticated(false);

        localStorage.removeItem('creator_hub_user');
        localStorage.removeItem('creator_hub_role');

        setLoading(false);
    };

    // Role helpers
    const isAdmin = userRole === 'admin';
    const isCreator = userRole === 'creator' || userRole === 'editor' || userRole === 'designer';

    const value = {
        user,
        profile,
        userRole,
        isAuthenticated,
        loading,
        error,
        isAdmin,
        isCreator,
        useSupabase,
        login,
        signUp,
        logout
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-cyan-blue flex items-center justify-center">
                <div className="text-white-smoke">Loading...</div>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

/**
 * useAuth hook - Access auth state and methods anywhere
 */
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export default AuthContext;
