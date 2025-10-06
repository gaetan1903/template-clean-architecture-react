import { createAsyncThunk } from "@reduxjs/toolkit";
import { UsersUseCase } from "../../domain/usecases/UsersUseCase";
import { UsersRepository } from "../../data/repositories/UsersRepository";
import { UsersDataSource } from "../../data/datasources/UsersDataSource";
import { 
    GetUsersFiltersParams, 
    CreateUserDataParams, 
    UpdateUserDataParams, 
    GetUserByIdParams, 
    DeleteUserParams 
} from "../../domain/types/UsersDomainTypes";

// Initialisation de la chaîne de dépendances (plus besoin de LocalStorageService)
const dataSource = new UsersDataSource();
const repository = new UsersRepository(dataSource);
const useCase = new UsersUseCase(repository);

// AsyncThunk pour récupérer les utilisateurs
export const getUsersProvider = createAsyncThunk(
    'users/getUsers',
    async (filters: GetUsersFiltersParams, { rejectWithValue }) => {
        const result = await useCase.getUsers(filters);

        return result.mapRight(data => data)
            .mapLeft(error => rejectWithValue(error.message))
            .value;
    }
);

// AsyncThunk pour récupérer un utilisateur par ID
export const getUserByIdProvider = createAsyncThunk(
    'users/getUserById',
    async (params: GetUserByIdParams, { rejectWithValue }) => {
        const result = await useCase.getUserById(params);

        return result.mapRight(data => data)
            .mapLeft(error => rejectWithValue(error.message))
            .value;
    }
);

// AsyncThunk pour créer un utilisateur
export const createUserProvider = createAsyncThunk(
    'users/createUser',
    async (data: CreateUserDataParams, { rejectWithValue }) => {
        const result = await useCase.createUser(data);

        return result.mapRight(success => success)
            .mapLeft(error => rejectWithValue(error.message))
            .value;
    }
);

// AsyncThunk pour mettre à jour un utilisateur
export const updateUserProvider = createAsyncThunk(
    'users/updateUser',
    async ({ id, data }: { id: string; data: UpdateUserDataParams }, { rejectWithValue }) => {
        const result = await useCase.updateUser(id, data);

        return result.mapRight(success => success)
            .mapLeft(error => rejectWithValue(error.message))
            .value;
    }
);

// AsyncThunk pour supprimer un utilisateur
export const deleteUserProvider = createAsyncThunk(
    'users/deleteUser',
    async (params: DeleteUserParams, { rejectWithValue }) => {
        const result = await useCase.deleteUser(params);

        return result.mapRight(success => success)
            .mapLeft(error => rejectWithValue(error.message))
            .value;
    }
);
