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

            // Appel direct au DataSource (mapping identique pour l'instant)
            const users = await this.dataSource.getUsers(tokenResult.value, filters);

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

            // Appel direct au DataSource (mapping identique)
            const user = await this.dataSource.getUserById(tokenResult.value, params);
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

            // Appel direct au DataSource (mapping identique)
            const result = await this.dataSource.createUser(tokenResult.value, data);
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

            // Appel direct au DataSource (mapping identique)
            const result = await this.dataSource.updateUser(tokenResult.value, id, data);
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

            // Appel direct au DataSource (mapping identique)
            const result = await this.dataSource.deleteUser(tokenResult.value, params);
            return right(result);
        } catch (error) {
            if (error instanceof AppError) {
                return left(error);
            }
            return left(new AppError("Une erreur s'est produite", "000", error));
        }
    }
}
