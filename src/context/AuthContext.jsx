import React, { createContext, useContext, useState, useEffect } from 'react';

// Create Auth Context
const AuthContext = createContext(null);

/**
 * Auth Provider - Manages authentication state globally
 */
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);

    // Initialize from localStorage on mount
    useEffect(() => {
        const storedUser = localStorage.getItem('creator_hub_user');
        const storedRole = localStorage.getItem('creator_hub_role');

        if (storedUser && storedRole) {
            setUser(JSON.parse(storedUser));
            setUserRole(storedRole);
            setIsAuthenticated(true);
        }
        setLoading(false);
    }, []);

    const login = (role, email = 'user@creatorhub.com') => {
        const userData = { email, role };
        setUser(userData);
        setUserRole(role);
        setIsAuthenticated(true);

        // Persist to localStorage
        localStorage.setItem('creator_hub_user', JSON.stringify(userData));
        localStorage.setItem('creator_hub_role', role);
    };

    const logout = () => {
        setUser(null);
        setUserRole(null);
        setIsAuthenticated(false);

        // Clear localStorage
        localStorage.removeItem('creator_hub_user');
        localStorage.removeItem('creator_hub_role');
    };

    const value = {
        user,
        userRole,
        isAuthenticated,
        loading,
        login,
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
