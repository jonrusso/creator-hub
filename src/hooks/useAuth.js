import { useAuth } from '../context';

/**
 * Custom hook for authentication methods
 * Wraps useAuth with additional utility functions
 */
export const useAuthMethods = () => {
    const { login, logout, isAuthenticated, userRole, user } = useAuth();

    const isAdmin = userRole === 'admin';
    const isEditor = userRole === 'editor';
    const isDesigner = userRole === 'designer';

    return {
        login,
        logout,
        isAuthenticated,
        userRole,
        user,
        isAdmin,
        isEditor,
        isDesigner
    };
};

export default useAuthMethods;
