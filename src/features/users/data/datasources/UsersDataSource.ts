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

export interface IUsersDataSource {
    getUsers(token: string, filters: GetUsersFiltersParams): Promise<PaginatedArray<UserEntity>>;
    getUserById(token: string, params: GetUserByIdParams): Promise<UserEntity>;
    createUser(token: string, data: CreateUserDataParams): Promise<boolean>;
    updateUser(token: string, id: string, data: UpdateUserDataParams): Promise<boolean>;
    deleteUser(token: string, params: DeleteUserParams): Promise<boolean>;
}

export class UsersDataSource implements IUsersDataSource {
    private axiosService = AxiosService.getInstance();

    async getUsers(token: string, filters: GetUsersFiltersParams): Promise<PaginatedArray<UserEntity>> {
        // Construction de l'URL avec query params
        const endpoint = '/api/users'
            + `?page=${filters.page || 1}`
            + (filters.search ? `&search=${encodeURIComponent(filters.search)}` : '')
            + (filters.status ? `&status=${encodeURIComponent(filters.status)}` : '')
            + (filters.role ? `&role=${encodeURIComponent(filters.role)}` : '');

        try {
            const response = await this.axiosService.get(endpoint, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (!response.data) {
                throw new AppError('Empty response', "001", 'users data is empty');
            }

            // Mapping des données API vers Entités
            return new PaginatedArray(
                response.data.data.map((item: any) => UserModel.fromJson(item)),
                response.data.meta.totalPages,
                response.data.meta.currentPage,
                response.data.meta.totalItems
            );
        } catch (error) {
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

    async getUserById(token: string, params: GetUserByIdParams): Promise<UserEntity> {
        try {
            const response = await this.axiosService.get(`/api/users/${params.id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (!response.data) {
                throw new AppError('Empty response', "001", 'user data is empty');
            }

            return UserModel.fromJson(response.data);
        } catch (error) {
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

    async createUser(token: string, data: CreateUserDataParams): Promise<boolean> {
        try {
            const response = await this.axiosService.post('/api/users', data, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response && response.status === 201;
        } catch (error) {
            let _error = error as any;
            if (_error instanceof Object && _error.name === 'AxiosError') {
                throw new AppError(
                    _error.response?.data?.message || 'Erreur lors de la création',
                    "001",
                    _error.response?.data
                );
            }
            throw new AppError('Error', "000", error);
        }
    }

    async updateUser(token: string, id: string, data: UpdateUserDataParams): Promise<boolean> {
        try {
            const response = await this.axiosService.put(`/api/users/${id}`, data, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response && response.status === 200;
        } catch (error) {
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

    async deleteUser(token: string, params: DeleteUserParams): Promise<boolean> {
        try {
            const response = await this.axiosService.delete(`/api/users/${params.id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
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
