import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { CircularProgress, Box } from '@mui/material';

interface PrivateRouteProps {
    children: React.ReactNode;
}

/**
 * Composant guard pour les routes protégées.
 * Redirige vers /login si l'utilisateur n'est pas authentifié.
 * Préserve l'URL de destination pour rediriger après login.
 */
const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuthStore();
    const location = useLocation();

    // Afficher un loader pendant la vérification d'auth au démarrage
    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!isAuthenticated) {
        // Préserver l'URL pour rediriger après login
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};

export default PrivateRoute;
