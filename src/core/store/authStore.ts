import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import AuthService from '../services/authService';
import { TokenPayload, LoginCredentials } from '../types/AuthTypes';

// Définition du state
interface AuthState {
    // State
    isAuthenticated: boolean;
    isLoading: boolean;
    user: TokenPayload | null;
    error: string | null;

    // Actions
    login: (credentials: LoginCredentials) => Promise<void>;
    logout: () => Promise<void>;
    checkAuth: () => void;
    clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
    devtools(
        (set) => ({
            isAuthenticated: false,
            isLoading: true,
            user: null,
            error: null,

            // Login
            login: async (credentials) => {
                set({ isLoading: true, error: null }, false, 'auth/login/pending');
                const authService = AuthService.getInstance();
                const result = await authService.login(credentials);

                if (result.isRight()) {
                    const userResult = authService.getCurrentUser();
                    if (userResult.isRight()) {
                        set({
                            isLoading: false,
                            isAuthenticated: true,
                            user: userResult.value,
                        }, false, 'auth/login/fulfilled');
                    } else {
                        set({
                            isLoading: false,
                            error: 'Impossible de récupérer les données utilisateur',
                            isAuthenticated: false,
                            user: null,
                        }, false, 'auth/login/rejected');
                    }
                } else {
                    set({
                        isLoading: false,
                        error: result.value.message,
                        isAuthenticated: false,
                        user: null,
                    }, false, 'auth/login/rejected');
                }
            },

            // Logout
            logout: async () => {
                const authService = AuthService.getInstance();
                await authService.logout();
                set({
                    isAuthenticated: false,
                    user: null,
                    error: null,
                }, false, 'auth/logout');
            },

            // Vérifier l'authentification
            checkAuth: () => {
                const authService = AuthService.getInstance();
                try {
                    const isAuth = authService.isAuthenticated();
                    if (isAuth) {
                        const userResult = authService.getCurrentUser();
                        if (userResult.isRight()) {
                            set({
                                isLoading: false,
                                isAuthenticated: true,
                                user: userResult.value,
                            }, false, 'auth/checkAuth/fulfilled');
                            return;
                        }
                    }
                    set({
                        isLoading: false,
                        isAuthenticated: false,
                        user: null,
                    }, false, 'auth/checkAuth/noAuth');
                } catch {
                    set({
                        isLoading: false,
                        isAuthenticated: false,
                        user: null,
                        error: 'Erreur de vérification',
                    }, false, 'auth/checkAuth/rejected');
                }
            },

            // Actions synchrones
            clearError: () => set({ error: null }, false, 'auth/clearError'),
        }),
        { name: 'AuthStore' }
    )
);
