import { Either, left, right } from "@sweet-monads/either";
import { AppError } from "../../../../core/types/AppError";
import { IUsersDataSource } from "../datasources/UsersDataSource";
import { IUsersRepository } from "../../domain/repositories/IUsersRepository";
import { UserEntity } from "../../domain/entities/UserEntity";
import { PaginatedArray } from "../../../../core/types/PaginatedArray";
import {
    GetUsersFiltersParams,
    CreateUserDataParams,
    UpdateUserDataParams,
    GetUserByIdParams,
    DeleteUserParams
} from "../../domain/types/UsersDomainTypes";

/**
 * Implémentation du repository Users.
 * Note : L'authentification (token Bearer) est gérée automatiquement
 * par AxiosInterceptor. Le repository n'a pas à s'en soucier.
 */
export class UsersRepository implements IUsersRepository {
    private dataSource: IUsersDataSource;

    constructor(dataSource: IUsersDataSource) {
        this.dataSource = dataSource;
    }

    async getUsers(filters: GetUsersFiltersParams): Promise<Either<AppError, PaginatedArray<UserEntity>>> {
        try {
            const users = await this.dataSource.getUsers(filters);
            return right(users);
        } catch (error) {
            if (error instanceof AppError) {
                return left(error);
            }
            return left(new AppError("Une erreur s'est produite", "000", error));
        }
    }

    async getUserById(params: GetUserByIdParams): Promise<Either<AppError, UserEntity>> {
        try {
            const user = await this.dataSource.getUserById(params);
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
            const result = await this.dataSource.createUser(data);
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
            const result = await this.dataSource.updateUser(id, data);
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
            const result = await this.dataSource.deleteUser(params);
            return right(result);
        } catch (error) {
            if (error instanceof AppError) {
                return left(error);
            }
            return left(new AppError("Une erreur s'est produite", "000", error));
        }
    }
}
