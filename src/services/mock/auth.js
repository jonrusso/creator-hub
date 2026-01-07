// Mock Auth Service
export const authService = {
    login: (email, password, role) => {
        // Mock authentication
        if (role === 'admin' && password === 'admin123') {
            return Promise.resolve({ user: { email, role: 'admin' }, token: 'mock-admin-token' });
        }
        return Promise.resolve({ user: { email, role }, token: `mock-${role}-token` });
    },
    logout: () => Promise.resolve({ success: true }),
    getCurrentUser: () => Promise.resolve({ email: 'user@example.com', role: 'editor' })
};
