import { Either, left, right } from "@sweet-monads/either";
import { AppError } from "../../../../core/types/AppError";
import { IUsersDataSource } from "../datasources/UsersDataSource";
import { IUsersRepository } from "../../domain/repositories/IUsersRepository";
import AuthService from "../../../../core/services/authService";
import { UserEntity } from "../../domain/entities/UserEntity";
import { PaginatedArray } from "../../../../core/types/PaginatedArray";
import { 
    GetUsersFiltersParams, 
    CreateUserDataParams, 
    UpdateUserDataParams, 
    GetUserByIdParams, 
    DeleteUserParams 
} from "../../domain/types/UsersDomainTypes";
import { 
    GetUsersFiltersParams as DataGetUsersFiltersParams,
    CreateUserDataParams as DataCreateUserDataParams,
    UpdateUserDataParams as DataUpdateUserDataParams,
    GetUserByIdParams as DataGetUserByIdParams,
    DeleteUserParams as DataDeleteUserParams
} from "../types/UsersDataTypes";

export class UsersRepository implements IUsersRepository {
    private dataSource: IUsersDataSource;
    private authService = AuthService.getInstance();

    constructor(dataSource: IUsersDataSource) {
        this.dataSource = dataSource;
    }

    async getUsers(filters: GetUsersFiltersParams): Promise<Either<AppError, PaginatedArray<UserEntity>>> {
        try {
            // Récupération du token via AuthService
            const tokenResult = await this.authService.getValidToken();
            if (tokenResult.isLeft()) {
                return left(tokenResult.value);
            }

            // Mapping des filtres domain vers data layer
            const dataFilters: DataGetUsersFiltersParams = {
                page: filters.page,
                search: filters.search,
                status: filters.status,
                role: filters.role
            };

            // Appel au DataSource
            const users = await this.dataSource.getUsers(tokenResult.value, dataFilters);

            // Succès: retourne Right
            return right(users);
        } catch (error) {
            // Erreur: retourne Left
            if (error instanceof AppError) {
                return left(error);
            }
            return left(new AppError("Une erreur s'est produite", "000", error));
        }
    }

    async getUserById(params: GetUserByIdParams): Promise<Either<AppError, UserEntity>> {
        try {
            const tokenResult = await this.authService.getValidToken();
            if (tokenResult.isLeft()) {
                return left(tokenResult.value);
            }

            const dataParams: DataGetUserByIdParams = { id: params.id };
            const user = await this.dataSource.getUserById(tokenResult.value, dataParams);
            return right(user);
        } catch (error) {
            if (error instanceof AppError) {
                return left(error);
            }
            return left(new AppError("Une erreur s'est produite", "000", error));
        }
    }

    async createUser(data: CreateUserDataParams): Promise<Either<AppError, boolean>> {
        try {
            const tokenResult = await this.authService.getValidToken();
            if (tokenResult.isLeft()) {
                return left(tokenResult.value);
            }

            // Mapping des données domain vers data layer
            const dataCreate: DataCreateUserDataParams = {
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                password: data.password,
                role: data.role,
                phoneNumber: data.phoneNumber,
                status: data.status
            };

            const result = await this.dataSource.createUser(tokenResult.value, dataCreate);
            return right(result);
        } catch (error) {
            if (error instanceof AppError) {
                return left(error);
            }
            return left(new AppError("Une erreur s'est produite", "000", error));
        }
    }

    async updateUser(id: string, data: UpdateUserDataParams): Promise<Either<AppError, boolean>> {
        try {
            const tokenResult = await this.authService.getValidToken();
            if (tokenResult.isLeft()) {
                return left(tokenResult.value);
            }

            // Mapping des données domain vers data layer
            const dataUpdate: DataUpdateUserDataParams = {
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                password: data.password,
                role: data.role,
                phoneNumber: data.phoneNumber,
                status: data.status
            };

            const result = await this.dataSource.updateUser(tokenResult.value, id, dataUpdate);
            return right(result);
        } catch (error) {
            if (error instanceof AppError) {
                return left(error);
            }
            return left(new AppError("Une erreur s'est produite", "000", error));
        }
    }

    async deleteUser(params: DeleteUserParams): Promise<Either<AppError, boolean>> {
        try {
            const tokenResult = await this.authService.getValidToken();
            if (tokenResult.isLeft()) {
                return left(tokenResult.value);
            }

            const dataParams: DataDeleteUserParams = { id: params.id };
            const result = await this.dataSource.deleteUser(tokenResult.value, dataParams);
            return right(result);
        } catch (error) {
            if (error instanceof AppError) {
                return left(error);
            }
            return left(new AppError("Une erreur s'est produite", "000", error));
        }
    }
}
