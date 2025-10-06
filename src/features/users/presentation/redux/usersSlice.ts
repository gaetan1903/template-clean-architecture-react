import { createSlice } from "@reduxjs/toolkit";
import { UserEntity } from "../../domain/entities/UserEntity";
import { PaginatedArray } from "../../../../core/types/PaginatedArray";
import {
    getUsersProvider,
    getUserByIdProvider,
    createUserProvider,
    updateUserProvider,
    deleteUserProvider
} from "./usersProvider";

// Définition du state
interface UsersState {
    loading: boolean;
    error: string | null;
    success: string | null;
    users: PaginatedArray<UserEntity> | null;
    currentUser: UserEntity | null;
}

// État initial
const initialState: UsersState = {
    loading: false,
    error: null,
    success: null,
    users: null,
    currentUser: null,
};

// Création du slice
const usersSlice = createSlice({
    name: 'users',
    initialState,
    reducers: {
        // Reducers synchrones
        clearSuccess: (state) => {
            state.success = null;
        },
        clearError: (state) => {
            state.error = null;
        },
        clearCurrentUser: (state) => {
            state.currentUser = null;
        },
        resetUsersState: (state) => {
            Object.assign(state, initialState);
        }
    },
    extraReducers: (builder) => {
        // Gestion du provider getUsers
        builder
            .addCase(getUsersProvider.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getUsersProvider.fulfilled, (state, action) => {
                state.loading = false;
                state.users = action.payload;
            })
            .addCase(getUsersProvider.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Une erreur est survenue';
            })

            // Gestion du provider getUserById
            .addCase(getUserByIdProvider.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getUserByIdProvider.fulfilled, (state, action) => {
                state.loading = false;
                state.currentUser = action.payload;
            })
            .addCase(getUserByIdProvider.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Utilisateur non trouvé';
            })

            // Gestion du provider createUser
            .addCase(createUserProvider.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createUserProvider.fulfilled, (state) => {
                state.loading = false;
                state.success = "Utilisateur créé avec succès !";
                // Invalider la liste pour forcer un rechargement
                state.users = null;
            })
            .addCase(createUserProvider.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Erreur lors de la création';
            })

            // Gestion du provider updateUser
            .addCase(updateUserProvider.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateUserProvider.fulfilled, (state) => {
                state.loading = false;
                state.success = "Utilisateur mis à jour avec succès !";
                state.users = null;
            })
            .addCase(updateUserProvider.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Erreur lors de la mise à jour';
            })

            // Gestion du provider deleteUser
            .addCase(deleteUserProvider.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteUserProvider.fulfilled, (state) => {
                state.loading = false;
                state.success = "Utilisateur supprimé avec succès !";
                state.users = null;
            })
            .addCase(deleteUserProvider.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Erreur lors de la suppression';
            });
    }
});

// Export des actions et reducer
export const { clearSuccess, clearError, clearCurrentUser, resetUsersState } = usersSlice.actions;
export const usersReducer = usersSlice.reducer;
