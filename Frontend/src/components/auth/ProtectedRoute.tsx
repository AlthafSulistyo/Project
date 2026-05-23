import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
    children: ReactNode;
    requireRole?: string | string[];
}

const ProtectedRoute = ({ children, requireRole }: ProtectedRouteProps) => {
    const { isAuthenticated, hasRole, hasAnyRole } = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        // Redirect unauthenticated users to login page
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (requireRole) {
        let authorized = false;
        if (Array.isArray(requireRole)) {
             authorized = hasAnyRole(requireRole);
        } else {
             authorized = hasRole(requireRole);
        }

        if (!authorized) {
            // Redirect authenticated but unauthorized users
            return <Navigate to="/" replace />;
        }
    }

    return <>{children}</>;
};

export default ProtectedRoute;
