import { useSelector, useDispatch } from 'react-redux';
import { useCallback, useMemo } from 'react';
import { RootState, AppDispatch } from '../store';
import { loginProvider, logoutProvider, checkAuthProvider, clearError } from '../redux/authSlice';
import { LoginCredentials } from '../types/AuthTypes';
import { Either } from '@sweet-monads/either';
import { AppError } from '../types/AppError';

/**
 * Hook useAuth optimisé qui utilise Redux au lieu d'état local
 * Respecte l'architecture Clean et évite les problèmes de performance
 */
export const useAuth = () => {
    const dispatch = useDispatch<AppDispatch>();
    const authState = useSelector((state: RootState) => state.auth);

    // Actions memoized pour éviter les re-renders
    const login = useCallback(async (email: string, password: string): Promise<Either<AppError, boolean>> => {
        try {
            const credentials: LoginCredentials = { email, password };
            const result = await dispatch(loginProvider(credentials));
            
            if (loginProvider.fulfilled.match(result)) {
                return { isLeft: () => false, isRight: () => true, value: true } as Either<AppError, boolean>;
            } else {
                const error = new AppError(result.payload as string || 'Erreur de connexion', '401', 'login_failed');
                return { isLeft: () => true, isRight: () => false, value: error } as Either<AppError, boolean>;
            }
        } catch (error) {
            const appError = new AppError('Erreur de connexion', '500', error);
            return { isLeft: () => true, isRight: () => false, value: appError } as Either<AppError, boolean>;
        }
    }, [dispatch]);

    const logout = useCallback(async (): Promise<Either<AppError, boolean>> => {
        try {
            const result = await dispatch(logoutProvider());
            
            if (logoutProvider.fulfilled.match(result)) {
                return { isLeft: () => false, isRight: () => true, value: true } as Either<AppError, boolean>;
            } else {
                const error = new AppError(result.payload as string || 'Erreur de déconnexion', '500', 'logout_failed');
                return { isLeft: () => true, isRight: () => false, value: error } as Either<AppError, boolean>;
            }
        } catch (error) {
            const appError = new AppError('Erreur de déconnexion', '500', error);
            return { isLeft: () => true, isRight: () => false, value: appError } as Either<AppError, boolean>;
        }
    }, [dispatch]);

    const checkAuth = useCallback(async (): Promise<void> => {
        dispatch(checkAuthProvider());
    }, [dispatch]);

    const clearAuthError = useCallback(() => {
        dispatch(clearError());
    }, [dispatch]);

    // Valeurs memoized pour éviter les re-renders inutiles
    const memoizedValues = useMemo(() => ({
        isAuthenticated: authState.isAuthenticated,
        isLoading: authState.isLoading,
        user: authState.user,
        error: authState.error,
        tokenTimeRemaining: authState.tokenTimeRemaining,
        shouldRefreshSoon: authState.tokenTimeRemaining > 0 && authState.tokenTimeRemaining <= 300 // 5 minutes
    }), [authState]);

    return {
        ...memoizedValues,
        login,
        logout,
        checkAuth,
        refreshUser: checkAuth, // Alias pour compatibilité
        clearError: clearAuthError
    };
};

export default useAuth;