import { Either } from "@sweet-monads/either";
import { AppError } from "../../../../core/types/AppError";
import { UserEntity } from "../entities/UserEntity";
import { PaginatedArray } from "../../../../core/types/PaginatedArray";
import { 
    GetUsersFiltersParams, 
    CreateUserDataParams, 
    UpdateUserDataParams, 
    GetUserByIdParams, 
    DeleteUserParams 
} from "../types/UsersDomainTypes";

export interface IUsersRepository {
    getUsers(filters: GetUsersFiltersParams): Promise<Either<AppError, PaginatedArray<UserEntity>>>;
    getUserById(params: GetUserByIdParams): Promise<Either<AppError, UserEntity>>;
    createUser(data: CreateUserDataParams): Promise<Either<AppError, boolean>>;
    updateUser(id: string, data: UpdateUserDataParams): Promise<Either<AppError, boolean>>;
    deleteUser(params: DeleteUserParams): Promise<Either<AppError, boolean>>;
}
