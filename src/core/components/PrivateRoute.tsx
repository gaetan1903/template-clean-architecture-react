import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Spinner } from '@heroui/react';

interface PrivateRouteProps {
    children: React.ReactNode;
}

/**
 * Composant guard pour les routes protegees.
 * Redirige vers /login si l'utilisateur n'est pas authentifie.
 * Preserve l'URL de destination pour rediriger apres login.
 */
const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
    // Selecteurs individuels pour eviter les re-renders inutiles
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const isLoading = useAuthStore((s) => s.isLoading);
    const location = useLocation();

    // Afficher un loader pendant la verification d'auth au demarrage
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center page-bg">
                <Spinner size="lg" />
            </div>
        );
    }

    if (!isAuthenticated) {
        // Preserver l'URL pour rediriger apres login
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};

export default PrivateRoute;
