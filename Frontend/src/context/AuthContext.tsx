import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as firebaseSignOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export interface User {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'management' | 'staff';
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
    isAdmin: () => boolean;
    isManagement: () => boolean;
    hasRole: (role: string) => boolean;
    hasAnyRole: (roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                // Get token
                const token = await firebaseUser.getIdToken();
                setToken(token);
                
                // Fetch role from Firestore
                const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
                if (userDoc.exists()) {
                    setUser(userDoc.data() as User);
                } else {
                    // Fallback default role based on email if doc doesn't exist
                    let defaultRole: 'admin' | 'management' | 'staff' = 'staff';
                    if (firebaseUser.email === 'admin@schoolguard.com') defaultRole = 'admin';
                    else if (firebaseUser.email?.includes('management')) defaultRole = 'management';
                    
                    const newUser: User = {
                        id: firebaseUser.uid,
                        name: firebaseUser.email?.split('@')[0] || 'User',
                        email: firebaseUser.email || '',
                        role: defaultRole
                    };
                    setUser(newUser);
                    // Save to firestore
                    await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
                }
            } else {
                setUser(null);
                setToken(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const login = async (email: string, password: string) => {
        try {
            // Try to login
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error: any) {
            // If user not found, auto-register for demo purposes
            if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
                console.log("User not found, attempting auto-register for demo...");
                try {
                    await createUserWithEmailAndPassword(auth, email, password);
                } catch (registerError) {
                    throw registerError;
                }
            } else {
                throw error;
            }
        }
    };

    const logout = async () => {
        await firebaseSignOut(auth);
    };

    const isAdmin = () => user?.role === 'admin';
    const isManagement = () => user?.role === 'management';
    const hasRole = (role: string) => user?.role === role;
    const hasAnyRole = (roles: string[]) => user ? roles.includes(user.role) : false;

    const value = {
        user,
        token,
        login,
        logout,
        isAuthenticated: !!user,
        isAdmin,
        isManagement,
        hasRole,
        hasAnyRole,
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">Memuat Autentikasi...</div>;
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
