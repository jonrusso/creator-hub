import React, { useState, useEffect } from 'react';
import { Settings, FileText, Image as ImageIcon, Loader2, AlertCircle, Mail } from 'lucide-react';
import { Logo, Input, Button } from '../common';
import { supabase, isSupabaseConfigured } from '../../services/supabase/client';

/**
 * Authentication layer with Supabase integration
 * Supports email/password login, signup, and magic link for invited users
 * @param {function} onLogin - Callback when user successfully logs in with role
 */
const AuthenticationLayer = ({ onLogin }) => {
    const [view, setView] = useState('login'); // login | signup | admin | magic-link
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [checkingSession, setCheckingSession] = useState(true);

    // Check for existing session on mount
    useEffect(() => {
        checkSession();

        // Listen for auth state changes (for magic link redirects)
        const { data: { subscription } } = supabase?.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session) {
                await handleSessionLogin(session);
            }
        }) || { data: { subscription: null } };

        return () => subscription?.unsubscribe();
    }, []);

    const checkSession = async () => {
        if (!isSupabaseConfigured()) {
            setCheckingSession(false);
            return;
        }

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                await handleSessionLogin(session);
            }
        } catch (err) {
            console.error('Session check failed:', err);
        } finally {
            setCheckingSession(false);
        }
    };

    const handleSessionLogin = async (session) => {
        // Fetch user profile to get role
        try {
            const { data: profile, error: profileError } = await supabase
                .from('user_profiles')
                .select('role, full_name')
                .eq('id', session.user.id)
                .single();

            if (profileError) {
                // Profile might not exist yet for new users
                // Create one with default role from user metadata
                const metadata = session.user.user_metadata;
                const defaultRole = metadata?.role || 'creator';

                const { error: insertError } = await supabase
                    .from('user_profiles')
                    .upsert({
                        id: session.user.id,
                        email: session.user.email,
                        full_name: metadata?.full_name || '',
                        role: defaultRole
                    });

                if (insertError) {
                    console.error('Failed to create profile:', insertError);
                }

                onLogin(defaultRole);
            } else {
                onLogin(profile.role || 'creator');
            }
        } catch (err) {
            console.error('Profile fetch failed:', err);
            onLogin('creator'); // Fallback
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        // Mock auth fallback for development
        if (!isSupabaseConfigured()) {
            if (view === 'admin') {
                if (password === 'admin123') {
                    onLogin('admin');
                } else {
                    setError('Invalid admin password');
                }
            } else {
                onLogin('editor');
            }
            return;
        }

        setLoading(true);

        try {
            if (view === 'signup') {
                // Sign up new user
                if (password !== confirmPassword) {
                    throw new Error('Passwords do not match');
                }

                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            role: 'creator'
                        }
                    }
                });

                if (error) throw error;

                if (data.user && !data.session) {
                    setMessage('Check your email for a confirmation link!');
                    setView('login');
                }
            } else if (view === 'admin') {
                // Admin login via Supabase
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password
                });

                if (error) throw error;

                // Check if user is admin
                const { data: profile } = await supabase
                    .from('user_profiles')
                    .select('role')
                    .eq('id', data.user.id)
                    .single();

                if (profile?.role !== 'admin') {
                    await supabase.auth.signOut();
                    throw new Error('Access denied. Admin privileges required.');
                }

                onLogin('admin');
            } else {
                // Regular login
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password
                });

                if (error) throw error;

                await handleSessionLogin(data.session);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        if (!email) {
            setError('Please enter your email first');
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/`
            });
            if (error) throw error;
            setMessage('Password reset email sent!');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Show loading while checking session
    if (checkingSession) {
        return (
            <div className="min-h-screen bg-cyan-blue flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-orange-brand animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-cyan-blue flex items-center justify-center p-4 relative">
            {/* Vignette Gradient */}
            <div className="fixed inset-0 pointer-events-none" style={{
                background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.6) 0%, transparent 40%, transparent 60%, rgba(0, 0, 0, 0.3) 100%)'
            }}></div>

            <div className="w-full max-w-md relative z-10">
                <Logo variant="primary" className="mb-12" />

                <div className="relative z-10" style={{
                    background: 'rgba(15, 15, 15, 0.4)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 155, 76, 0.3)',
                    borderRadius: '24px',
                    boxShadow: '0 0 60px rgba(255, 155, 76, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
                    padding: '32px'
                }}>
                    {/* Admin Toggle (Hidden Corner) */}
                    <button
                        onClick={() => setView(view === 'admin' ? 'login' : 'admin')}
                        className="absolute top-2 right-2 p-2 text-white-smoke/10 hover:text-white-smoke/40"
                        title="Admin Login"
                    >
                        <Settings className="w-4 h-4" />
                    </button>

                    <h2 className="text-white-smoke font-heading text-2xl font-semibold mb-2">
                        {view === 'signup' ? 'Join the Club' : view === 'admin' ? 'Admin Access' : 'Welcome Back'}
                    </h2>
                    <p className="text-white-smoke/60 font-body text-sm mb-6">
                        {view === 'signup'
                            ? 'Create your account'
                            : view === 'admin'
                                ? 'Sign in with admin credentials'
                                : 'Sign in to access Creator Hub'}
                    </p>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2 text-red-400 text-sm">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    {/* Success Message */}
                    {message && (
                        <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center gap-2 text-emerald-400 text-sm">
                            <Mail className="w-4 h-4 flex-shrink-0" />
                            {message}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-4">
                        <Input
                            type="email"
                            label="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="name@keanuvisuals.com"
                            required
                        />
                        <Input
                            type="password"
                            label="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />

                        {view === 'signup' && (
                            <Input
                                type="password"
                                label="Confirm Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                        )}

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                            ) : (
                                view === 'signup' ? 'Sign Up' : 'Continue'
                            )}
                        </Button>
                    </form>

                    {/* Forgot Password */}
                    {view === 'login' && isSupabaseConfigured() && (
                        <button
                            onClick={handleForgotPassword}
                            className="w-full mt-4 text-white-smoke/40 text-sm hover:text-white-smoke transition-colors"
                        >
                            Forgot your password?
                        </button>
                    )}

                    {/* View Toggle */}
                    {view !== 'admin' ? (
                        <div className="mt-6 text-center">
                            <button
                                onClick={() => {
                                    setView(view === 'login' ? 'signup' : 'login');
                                    setError('');
                                    setMessage('');
                                }}
                                className="text-white-smoke/40 text-sm hover:text-white-smoke transition-colors"
                            >
                                {view === 'login' ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
                            </button>
                        </div>
                    ) : (
                        <div className="mt-6 text-center">
                            <button
                                onClick={() => {
                                    setView('login');
                                    setError('');
                                }}
                                className="text-white-smoke/40 text-sm hover:text-white-smoke transition-colors"
                            >
                                ← Back to Login
                            </button>
                        </div>
                    )}

                    {/* Dev Mode Indicator */}
                    {!isSupabaseConfigured() && (
                        <div className="mt-6 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-yellow-400 text-xs text-center">
                            Development Mode: Supabase not configured
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthenticationLayer;
