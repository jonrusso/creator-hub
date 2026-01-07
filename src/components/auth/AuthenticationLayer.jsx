import React, { useState } from 'react';
import { Settings, FileText, Image as ImageIcon } from 'lucide-react';
import { Logo, Input, Button } from '../common';

/**
 * Authentication layer with role-based login (Editor/Designer/Admin)
 * @param {function} onLogin - Callback when user successfully logs in with role
 */
const AuthenticationLayer = ({ onLogin }) => {
    const [view, setView] = useState('login'); // login | signup | admin
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('editor'); // Default selection

    const handleLogin = (e) => {
        e.preventDefault();
        // Mock Auth Logic
        if (view === 'admin') {
            if (password === 'admin123') onLogin('admin');
            else alert('Invalid Admin Password (hint: admin123)');
        } else {
            onLogin(role); // 'editor' or 'designer'
        }
    };

    return (
        <div className="min-h-screen bg-cyan-blue flex items-center justify-center p-4 relative">
            {/* Vignette Gradient - Darker Top to Lighter Bottom */}
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
                        onClick={() => setView('admin')}
                        className="absolute top-2 right-2 p-2 text-white-smoke/10 hover:text-white-smoke/40"
                        title="Admin Login"
                    >
                        <Settings className="w-4 h-4" />
                    </button>

                    <h2 className="text-white-smoke font-heading text-2xl font-semibold mb-2">
                        {view === 'signup' ? 'Join the Club' : view === 'admin' ? 'Admin Access' : 'Welcome Back'}
                    </h2>
                    <p className="text-white-smoke/60 font-body text-sm mb-8">
                        {view === 'signup' ? 'Create your account' : 'Sign in to access Creator Hub'}
                    </p>

                    <form onSubmit={handleLogin} className="space-y-6">
                        {view !== 'admin' && (
                            <div className="grid grid-cols-2 gap-3 mb-6">
                                <button
                                    type="button"
                                    onClick={() => setRole('editor')}
                                    className={`p-3 rounded-xl border-2 transition-all ${role === 'editor'
                                            ? 'border-orange-brand bg-orange-brand/10 text-white-smoke'
                                            : 'border-white-smoke/10 bg-white-smoke/5 text-white-smoke/60'
                                        }`}
                                >
                                    <FileText className="w-5 h-5 mx-auto mb-2" />
                                    <span className="text-sm font-medium">Editor</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setRole('designer')}
                                    className={`p-3 rounded-xl border-2 transition-all ${role === 'designer'
                                            ? 'border-orange-brand bg-orange-brand/10 text-white-smoke'
                                            : 'border-white-smoke/10 bg-white-smoke/5 text-white-smoke/60'
                                        }`}
                                >
                                    <ImageIcon className="w-5 h-5 mx-auto mb-2" />
                                    <span className="text-sm font-medium">Designer</span>
                                </button>
                            </div>
                        )}

                        <div className="space-y-4">
                            <Input
                                type="email"
                                label="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@keanuvisuals.com"
                            />
                            <Input
                                type="password"
                                label="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                            />
                        </div>

                        <Button type="submit" className="w-full">
                            {view === 'signup' ? 'Sign Up' : 'Continue'}
                        </Button>
                    </form>

                    {view !== 'admin' && (
                        <div className="mt-6 text-center">
                            <button
                                onClick={() => setView(view === 'login' ? 'signup' : 'login')}
                                className="text-white-smoke/40 text-sm hover:text-white-smoke transition-colors"
                            >
                                {view === 'login' ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
                            </button>
                        </div>
                    )}
                    {view === 'admin' && (
                        <div className="mt-6 text-center">
                            <button
                                onClick={() => setView('login')}
                                className="text-white-smoke/40 text-sm hover:text-white-smoke transition-colors"
                            >
                                ← Back to Login
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthenticationLayer;
