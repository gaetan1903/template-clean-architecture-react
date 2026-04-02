import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { UsersUseCase } from '../../domain/usecases/UsersUseCase';
import { UsersRepository } from '../../data/repositories/UsersRepository';
import { UsersDataSource } from '../../data/datasources/UsersDataSource';
import { UserEntity } from '../../domain/entities/UserEntity';
import { PaginatedArray } from '../../../../core/types/PaginatedArray';
import {
    GetUsersFiltersParams,
    CreateUserDataParams,
    UpdateUserDataParams,
    GetUserByIdParams,
    DeleteUserParams
} from '../../domain/types/UsersDomainTypes';

// Initialisation de la chaîne de dépendances Clean Architecture
const dataSource = new UsersDataSource();
const repository = new UsersRepository(dataSource);
const useCase = new UsersUseCase(repository);

// Définition du state
interface UsersState {
    // State
    loading: boolean;
    error: string | null;
    success: string | null;
    users: PaginatedArray<UserEntity> | null;
    currentUser: UserEntity | null;

    // Actions
    getUsers: (filters: GetUsersFiltersParams) => Promise<void>;
    getUserById: (params: GetUserByIdParams) => Promise<void>;
    createUser: (data: CreateUserDataParams) => Promise<void>;
    updateUser: (id: string, data: UpdateUserDataParams) => Promise<void>;
    deleteUser: (params: DeleteUserParams) => Promise<void>;

    // Actions synchrones
    clearSuccess: () => void;
    clearError: () => void;
    clearCurrentUser: () => void;
    resetUsersState: () => void;
}

// État initial (pour le reset)
const initialState = {
    loading: false,
    error: null as string | null,
    success: null as string | null,
    users: null as PaginatedArray<UserEntity> | null,
    currentUser: null as UserEntity | null,
};

export const useUsersStore = create<UsersState>()(
    devtools(
        (set) => ({
            ...initialState,

            // Récupérer les utilisateurs
            getUsers: async (filters) => {
                set({ loading: true, error: null }, false, 'users/getUsers/pending');
                const result = await useCase.getUsers(filters);

                if (result.isLeft()) {
                    set({ loading: false, error: result.value.message }, false, 'users/getUsers/rejected');
                } else {
                    set({ loading: false, users: result.value }, false, 'users/getUsers/fulfilled');
                }
            },

            // Récupérer un utilisateur par ID
            getUserById: async (params) => {
                set({ loading: true, error: null }, false, 'users/getUserById/pending');
                const result = await useCase.getUserById(params);

                if (result.isLeft()) {
                    set({ loading: false, error: result.value.message }, false, 'users/getUserById/rejected');
                } else {
                    set({ loading: false, currentUser: result.value }, false, 'users/getUserById/fulfilled');
                }
            },

            // Créer un utilisateur
            createUser: async (data) => {
                set({ loading: true, error: null }, false, 'users/createUser/pending');
                const result = await useCase.createUser(data);

                if (result.isLeft()) {
                    set({ loading: false, error: result.value.message }, false, 'users/createUser/rejected');
                } else {
                    set({
                        loading: false,
                        success: "Utilisateur créé avec succès !",
                        users: null, // Invalider la liste pour forcer un rechargement
                    }, false, 'users/createUser/fulfilled');
                }
            },

            // Mettre à jour un utilisateur
            updateUser: async (id, data) => {
                set({ loading: true, error: null }, false, 'users/updateUser/pending');
                const result = await useCase.updateUser(id, data);

                if (result.isLeft()) {
                    set({ loading: false, error: result.value.message }, false, 'users/updateUser/rejected');
                } else {
                    set({
                        loading: false,
                        success: "Utilisateur mis à jour avec succès !",
                        users: null,
                    }, false, 'users/updateUser/fulfilled');
                }
            },

            // Supprimer un utilisateur
            deleteUser: async (params) => {
                set({ loading: true, error: null }, false, 'users/deleteUser/pending');
                const result = await useCase.deleteUser(params);

                if (result.isLeft()) {
                    set({ loading: false, error: result.value.message }, false, 'users/deleteUser/rejected');
                } else {
                    set({
                        loading: false,
                        success: "Utilisateur supprimé avec succès !",
                        users: null,
                    }, false, 'users/deleteUser/fulfilled');
                }
            },

            // Actions synchrones
            clearSuccess: () => set({ success: null }, false, 'users/clearSuccess'),
            clearError: () => set({ error: null }, false, 'users/clearError'),
            clearCurrentUser: () => set({ currentUser: null }, false, 'users/clearCurrentUser'),
            resetUsersState: () => set(initialState, false, 'users/reset'),
        }),
        { name: 'UsersStore' }
    )
);
