import { useAuthStore } from '../store/authStore';
import { Either, left, right } from '@sweet-monads/either';
import { AppError } from '../types/AppError';
import { LoginCredentials } from '../types/AuthTypes';

/**
 * Hook useAuth qui utilise Zustand pour la gestion de l'authentification.
 * Fournit un acces simplifie au state et aux actions d'authentification.
 * Les actions Zustand sont stables (reference identique entre renders) — pas besoin de useCallback.
 */
export const useAuth = () => {
    // Selectionner les valeurs et actions individuellement
    // pour eviter les re-renders inutiles
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const isLoading = useAuthStore((s) => s.isLoading);
    const user = useAuthStore((s) => s.user);
    const error = useAuthStore((s) => s.error);
    const storeLogin = useAuthStore((s) => s.login);
    const storeLogout = useAuthStore((s) => s.logout);
    const storeCheckAuth = useAuthStore((s) => s.checkAuth);
    const storeClearError = useAuthStore((s) => s.clearError);

    // Wrapper login pour retourner Either (compatibilite architecture)
    const login = async (email: string, password: string): Promise<Either<AppError, boolean>> => {
        try {
            const credentials: LoginCredentials = { email, password };
            await storeLogin(credentials);

            const { isAuthenticated: isAuth, error: err } = useAuthStore.getState();
            if (isAuth) {
                return right(true);
            }
            return left(new AppError(err || 'Erreur de connexion', '401', 'login_failed'));
        } catch (err) {
            return left(new AppError('Erreur de connexion', '500', err));
        }
    };

    // Wrapper logout pour retourner Either (compatibilite architecture)
    const logout = async (): Promise<Either<AppError, boolean>> => {
        try {
            await storeLogout();
            return right(true);
        } catch (err) {
            return left(new AppError('Erreur de deconnexion', '500', err));
        }
    };

    return {
        isAuthenticated,
        isLoading,
        user,
        error,
        login,
        logout,
        checkAuth: storeCheckAuth,
        refreshUser: storeCheckAuth,
        clearError: storeClearError,
    };
};

export default useAuth;