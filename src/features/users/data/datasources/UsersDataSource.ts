import AxiosService from "../../../../core/services/axiosService";
import { AppError } from "../../../../core/types/AppError";
import { UserEntity } from "../../domain/entities/UserEntity";
import { UserModel } from "../DTO/UserModel";
import { PaginatedArray } from "../../../../core/types/PaginatedArray";
import {
    GetUsersFiltersParams,
    CreateUserDataParams,
    UpdateUserDataParams,
    GetUserByIdParams,
    DeleteUserParams
} from "../../domain/types/UsersDomainTypes";

/**
 * Interface du DataSource Users.
 * Note : Le token Bearer est géré automatiquement par AxiosInterceptor,
 * il n'est donc pas nécessaire de le passer en paramètre.
 */
export interface IUsersDataSource {
    getUsers(filters: GetUsersFiltersParams): Promise<PaginatedArray<UserEntity>>;
    getUserById(params: GetUserByIdParams): Promise<UserEntity>;
    createUser(data: CreateUserDataParams): Promise<boolean>;
    updateUser(id: string, data: UpdateUserDataParams): Promise<boolean>;
    deleteUser(params: DeleteUserParams): Promise<boolean>;
}

export class UsersDataSource implements IUsersDataSource {
    private axiosService = AxiosService.getInstance();

    async getUsers(filters: GetUsersFiltersParams): Promise<PaginatedArray<UserEntity>> {
        // Construction de l'URL avec query params
        const endpoint = '/api/users'
            + `?page=${filters.page || 1}`
            + (filters.search ? `&search=${encodeURIComponent(filters.search)}` : '')
            + (filters.status ? `&status=${encodeURIComponent(filters.status)}` : '')
            + (filters.role ? `&role=${encodeURIComponent(filters.role)}` : '');

        try {
            const response = await this.axiosService.get(endpoint);

            if (!response.data) {
                throw new AppError('Empty response', "001", 'users data is empty');
            }

            // Mapping des données API vers Entités avec validation Zod automatique
            return new PaginatedArray(
                response.data.data.map((item: any) => UserModel.fromJson(item)),
                response.data.meta.totalPages,
                response.data.meta.currentPage,
                response.data.meta.totalItems
            );
        } catch (error) {
            // Gestion spécifique des erreurs de validation Zod
            if (error instanceof AppError && error.code === "VALIDATION_ERROR") {
                throw error; // Re-throw les erreurs de validation
            }

            let _error = error as any;
            if (_error instanceof Object && _error.name === 'AxiosError') {
                throw new AppError(
                    _error.response?.data?.message || 'Erreur lors de la récupération des utilisateurs',
                    "001",
                    _error.response?.data
                );
            }
            throw new AppError('Error', "000", error);
        }
    }

    async getUserById(params: GetUserByIdParams): Promise<UserEntity> {
        try {
            const response = await this.axiosService.get(`/api/users/${params.id}`);

            if (!response.data) {
                throw new AppError('Empty response', "001", 'user data is empty');
            }

            // Validation automatique avec Zod dans UserModel.fromJson
            return UserModel.fromJson(response.data);
        } catch (error) {
            // Gestion spécifique des erreurs de validation Zod
            if (error instanceof AppError && error.code === "VALIDATION_ERROR") {
                throw error; // Re-throw les erreurs de validation
            }

            let _error = error as any;
            if (_error instanceof Object && _error.name === 'AxiosError') {
                throw new AppError(
                    _error.response?.data?.message || 'Utilisateur non trouvé',
                    "001",
                    _error.response?.data
                );
            }
            throw new AppError('Error', "000", error);
        }
    }

    async createUser(data: CreateUserDataParams): Promise<boolean> {
        try {
            const response = await this.axiosService.post('/api/users', data);
            return response && response.status === 201;
        } catch (error) {
            // Gestion spécifique des erreurs de validation Zod
            if (error instanceof AppError && error.code === "VALIDATION_ERROR") {
                throw error; // Re-throw les erreurs de validation
            }

            let _error = error as any;
            if (_error instanceof Object && _error.name === 'AxiosError') {
                throw new AppError(
                    _error.response?.data?.message || 'Erreur lors de la création de l\'utilisateur',
                    "001",
                    _error.response?.data
                );
            }
            throw new AppError('Error', "000", error);
        }
    }

    async updateUser(id: string, data: UpdateUserDataParams): Promise<boolean> {
        try {
            const response = await this.axiosService.put(`/api/users/${id}`, data);
            return response && response.status === 200;
        } catch (error) {
            // Gestion spécifique des erreurs de validation Zod
            if (error instanceof AppError && error.code === "VALIDATION_ERROR") {
                throw error; // Re-throw les erreurs de validation
            }

            let _error = error as any;
            if (_error instanceof Object && _error.name === 'AxiosError') {
                throw new AppError(
                    _error.response?.data?.message || 'Erreur lors de la mise à jour',
                    "001",
                    _error.response?.data
                );
            }
            throw new AppError('Error', "000", error);
        }
    }

    async deleteUser(params: DeleteUserParams): Promise<boolean> {
        try {
            const response = await this.axiosService.delete(`/api/users/${params.id}`);
            return response && response.status === 204;
        } catch (error) {
            let _error = error as any;
            if (_error instanceof Object && _error.name === 'AxiosError') {
                throw new AppError(
                    _error.response?.data?.message || 'Erreur lors de la suppression',
                    "001",
                    _error.response?.data
                );
            }
            throw new AppError('Error', "000", error);
        }
    }
}
