import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AuthService from '../services/authService';
import { TokenPayload, LoginCredentials } from '../types/AuthTypes';

// Types du state
interface AuthState {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: TokenPayload | null;
    error: string | null;
    tokenTimeRemaining: number;
}

// État initial
const initialState: AuthState = {
    isAuthenticated: false,
    isLoading: true,
    user: null,
    error: null,
    tokenTimeRemaining: 0
};

// AsyncThunk pour login
export const loginProvider = createAsyncThunk(
    'auth/login',
    async (credentials: LoginCredentials, { rejectWithValue }) => {
        const authService = AuthService.getInstance();
        const result = await authService.login(credentials);
        
        if (result.isRight()) {
            const userResult = authService.getCurrentUser();
            if (userResult.isRight()) {
                return userResult.value;
            }
            return rejectWithValue('Impossible de récupérer les données utilisateur');
        }
        
        return rejectWithValue(result.value.message);
    }
);

// AsyncThunk pour logout
export const logoutProvider = createAsyncThunk(
    'auth/logout',
    async (_, { rejectWithValue }) => {
        const authService = AuthService.getInstance();
        const result = await authService.logout();
        
        if (result.isLeft()) {
            return rejectWithValue(result.value.message);
        }
        
        return true;
    }
);

// AsyncThunk pour vérifier l'auth
export const checkAuthProvider = createAsyncThunk(
    'auth/checkAuth',
    async (_, { rejectWithValue }) => {
        const authService = AuthService.getInstance();
        
        try {
            const isAuth = authService.isAuthenticated();
            if (isAuth) {
                const userResult = authService.getCurrentUser();
                if (userResult.isRight()) {
                    return userResult.value;
                }
            }
            return null;
        } catch (error) {
            return rejectWithValue('Erreur de vérification');
        }
    }
);

// Slice
const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        updateTokenTime: (state, action) => {
            state.tokenTimeRemaining = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            // Login
            .addCase(loginProvider.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(loginProvider.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = true;
                state.user = action.payload;
            })
            .addCase(loginProvider.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
                state.isAuthenticated = false;
                state.user = null;
            })
            
            // Logout
            .addCase(logoutProvider.fulfilled, (state) => {
                state.isAuthenticated = false;
                state.user = null;
                state.error = null;
            })
            
            // Check auth
            .addCase(checkAuthProvider.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(checkAuthProvider.fulfilled, (state, action) => {
                state.isLoading = false;
                if (action.payload) {
                    state.isAuthenticated = true;
                    state.user = action.payload;
                } else {
                    state.isAuthenticated = false;
                    state.user = null;
                }
            })
            .addCase(checkAuthProvider.rejected, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = false;
                state.user = null;
                state.error = action.payload as string;
            });
    }
});

export const { clearError, updateTokenTime } = authSlice.actions;
export const authReducer = authSlice.reducer;