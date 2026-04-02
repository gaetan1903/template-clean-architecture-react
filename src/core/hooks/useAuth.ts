import { useCallback, useMemo } from 'react';
import { useAuthStore } from '../store/authStore';
import { LoginCredentials } from '../types/AuthTypes';
import { Either, left, right } from '@sweet-monads/either';
import { AppError } from '../types/AppError';

/**
 * Hook useAuth qui utilise Zustand pour la gestion de l'authentification.
 * Fournit un accès simplifié au state et aux actions d'authentification.
 */
export const useAuth = () => {
    const authState = useAuthStore();

    // Actions wrappées avec Either pour compatibilité avec l'architecture
    const login = useCallback(async (email: string, password: string): Promise<Either<AppError, boolean>> => {
        try {
            const credentials: LoginCredentials = { email, password };
            await authState.login(credentials);

            // Vérifier le state après l'action
            const { isAuthenticated, error } = useAuthStore.getState();
            if (isAuthenticated) {
                return right(true);
            } else {
                return left(new AppError(error || 'Erreur de connexion', '401', 'login_failed'));
            }
        } catch (error) {
            return left(new AppError('Erreur de connexion', '500', error));
        }
    }, [authState]);

    const logout = useCallback(async (): Promise<Either<AppError, boolean>> => {
        try {
            await authState.logout();
            return right(true);
        } catch (error) {
            return left(new AppError('Erreur de déconnexion', '500', error));
        }
    }, [authState]);

    const checkAuth = useCallback((): void => {
        authState.checkAuth();
    }, [authState]);

    const clearError = useCallback(() => {
        authState.clearError();
    }, [authState]);

    // Valeurs memoized pour éviter les re-renders inutiles
    const memoizedValues = useMemo(() => ({
        isAuthenticated: authState.isAuthenticated,
        isLoading: authState.isLoading,
        user: authState.user,
        error: authState.error,
    }), [authState.isAuthenticated, authState.isLoading, authState.user, authState.error]);

    return {
        ...memoizedValues,
        login,
        logout,
        checkAuth,
        refreshUser: checkAuth,
        clearError
    };
};

export default useAuth;