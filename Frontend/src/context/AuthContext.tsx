import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'management' | 'staff'; // Added role
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (userId: string, password: string) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
    // Role helper methods
    isAdmin: () => boolean;
    isManagement: () => boolean;
    hasRole: (role: string) => boolean;
    hasAnyRole: (roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);

    // Load token from localStorage on mount
    useEffect(() => {
        const storedToken = localStorage.getItem('auth_token');
        const storedUser = localStorage.getItem('auth_user');

        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
            // Set axios default header
            axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        }
    }, []);

    const login = async (userId: string, password: string) => {
        try {
            const response = await axios.post('http://127.0.0.1:8000/api/login', {
                user_id: parseInt(userId),
                password: password,
            });

            const { token: authToken, user: userData } = response.data;

            setToken(authToken);
            setUser(userData);

            // Store in localStorage
            localStorage.setItem('auth_token', authToken);
            localStorage.setItem('auth_user', JSON.stringify(userData));

            // Set axios default header for future requests
            axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
        } catch (error: any) {
            console.error('Login failed:', error);
            throw error; // Re-throw to be handled by Login component
        }
    };

    const logout = () => {
        // Call logout API
        if (token) {
            axios.post('http://127.0.0.1:8000/api/logout')
                .catch(err => console.error('Logout API call failed:', err));
        }

        // Clear state
        setToken(null);
        setUser(null);

        // Clear localStorage
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');

        // Remove axios header
        delete axios.defaults.headers.common['Authorization'];
    };

    // Role helper methods
    const isAdmin = () => user?.role === 'admin';
    const isManagement = () => user?.role === 'management';
    const hasRole = (role: string) => user?.role === role;
    const hasAnyRole = (roles: string[]) => user ? roles.includes(user.role) : false;

    const value = {
        user,
        token,
        login,
        logout,
        isAuthenticated: !!token && !!user,
        isAdmin,
        isManagement,
        hasRole,
        hasAnyRole,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
