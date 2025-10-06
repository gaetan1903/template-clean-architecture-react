import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Either } from '@sweet-monads/either';
import AuthService from '../services/authService';
import { TokenPayload } from '../types/AuthTypes';
import { AppError } from '../types/AppError';

// Types
interface AuthState {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: TokenPayload | null;
    error: string | null;
}

type AuthAction =
    | { type: 'AUTH_START' }
    | { type: 'AUTH_SUCCESS'; payload: { user: TokenPayload } }
    | { type: 'AUTH_FAILURE'; payload: { error: string } }
    | { type: 'AUTH_LOGOUT' }
    | { type: 'AUTH_CLEAR_ERROR' };

// Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
    switch (action.type) {
        case 'AUTH_START':
            return { ...state, isLoading: true, error: null };
        case 'AUTH_SUCCESS':
            return {
                ...state,
                isLoading: false,
                isAuthenticated: true,
                user: action.payload.user,
                error: null
            };
        case 'AUTH_FAILURE':
            return {
                ...state,
                isLoading: false,
                isAuthenticated: false,
                user: null,
                error: action.payload.error
            };
        case 'AUTH_LOGOUT':
            return {
                ...state,
                isAuthenticated: false,
                user: null,
                error: null
            };
        case 'AUTH_CLEAR_ERROR':
            return { ...state, error: null };
        default:
            return state;
    }
};

// Context
const AuthContext = createContext<{
    state: AuthState;
    dispatch: React.Dispatch<AuthAction>;
    login: (email: string, password: string) => Promise<Either<AppError, boolean>>;
    logout: () => Promise<Either<AppError, boolean>>;
} | null>(null);

// Provider
interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, {
        isAuthenticated: false,
        isLoading: true,
        user: null,
        error: null
    });

    const authService = AuthService.getInstance();

    // Initialisation une seule fois
    useEffect(() => {
        let mounted = true;

        const checkAuth = async () => {
            try {
                const isAuth = authService.isAuthenticated();
                if (isAuth) {
                    const userResult = authService.getCurrentUser();
                    if (userResult.isRight() && mounted) {
                        dispatch({ type: 'AUTH_SUCCESS', payload: { user: userResult.value } });
                    } else if (mounted) {
                        dispatch({ type: 'AUTH_FAILURE', payload: { error: 'Session invalide' } });
                    }
                } else if (mounted) {
                    dispatch({ type: 'AUTH_LOGOUT' });
                }
            } catch (error) {
                if (mounted) {
                    dispatch({ type: 'AUTH_FAILURE', payload: { error: 'Erreur de vérification' } });
                }
            }
        };

        checkAuth();

        return () => {
            mounted = false;
        };
    }, [authService]);

    // Actions
    const login = async (email: string, password: string): Promise<Either<AppError, boolean>> => {
        dispatch({ type: 'AUTH_START' });
        
        const result = await authService.login({ email, password });
        
        if (result.isRight()) {
            const userResult = authService.getCurrentUser();
            if (userResult.isRight()) {
                dispatch({ type: 'AUTH_SUCCESS', payload: { user: userResult.value } });
            }
        } else {
            dispatch({ type: 'AUTH_FAILURE', payload: { error: result.value.message } });
        }
        
        return result.mapRight(() => true);
    };

    const logout = async (): Promise<Either<AppError, boolean>> => {
        const result = await authService.logout();
        dispatch({ type: 'AUTH_LOGOUT' });
        return result;
    };

    return (
        <AuthContext.Provider value={{ state, dispatch, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// Hook optimisé
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth doit être utilisé dans un AuthProvider');
    }
    return context;
};

export default useAuth;