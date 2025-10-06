import { Either, left } from "@sweet-monads/either";
import { AppError } from "../../../../core/types/AppError";
import { IUsersRepository } from "../repositories/IUsersRepository";
import { IUsersUseCase } from "./IUsersUseCase";
import { UserEntity } from "../entities/UserEntity";
import { PaginatedArray } from "../../../../core/types/PaginatedArray";
import { 
    GetUsersFiltersParams, 
    CreateUserDataParams, 
    UpdateUserDataParams, 
    GetUserByIdParams, 
    DeleteUserParams 
} from "../types/UsersDomainTypes";

export class UsersUseCase implements IUsersUseCase {
    private repository: IUsersRepository;

    constructor(repository: IUsersRepository) {
        this.repository = repository;
    }

    async getUsers(filters: GetUsersFiltersParams): Promise<Either<AppError, PaginatedArray<UserEntity>>> {
        // Logique métier : validation des filtres
        if (filters.page && filters.page < 1) {
            return left(new AppError("Le numéro de page doit être supérieur à 0", "400", "validation_error"));
        }

        // Validation additionnelle pour les nouveaux filtres
        if (filters.status && !['ACTIVE', 'INACTIVE', 'SUSPENDED'].includes(filters.status)) {
            return left(new AppError("Statut invalide", "400", "validation_error"));
        }

        return await this.repository.getUsers(filters);
    }

    async getUserById(params: GetUserByIdParams): Promise<Either<AppError, UserEntity>> {
        // Logique métier : validation de l'ID
        if (!params.id || params.id.trim() === '') {
            return left(new AppError("L'ID utilisateur est requis", "400", "validation_error"));
        }

        return await this.repository.getUserById(params);
    }

    async createUser(data: CreateUserDataParams): Promise<Either<AppError, boolean>> {
        // Logique métier : validation des données
        if (!data.firstName || data.firstName.trim() === '') {
            return left(new AppError("Le prénom est requis", "400", "validation_error"));
        }

        if (!data.lastName || data.lastName.trim() === '') {
            return left(new AppError("Le nom est requis", "400", "validation_error"));
        }

        if (!data.email || !this.isValidEmail(data.email)) {
            return left(new AppError("L'email est invalide", "400", "validation_error"));
        }

        if (!data.password || data.password.length < 6) {
            return left(new AppError("Le mot de passe doit contenir au moins 6 caractères", "400", "validation_error"));
        }

        return await this.repository.createUser(data);
    }

    async updateUser(id: string, data: UpdateUserDataParams): Promise<Either<AppError, boolean>> {
        // Logique métier : validation
        if (!id || id.trim() === '') {
            return left(new AppError("L'ID utilisateur est requis", "400", "validation_error"));
        }

        if (data.email && !this.isValidEmail(data.email)) {
            return left(new AppError("L'email est invalide", "400", "validation_error"));
        }

        if (data.password && data.password.length < 6) {
            return left(new AppError("Le mot de passe doit contenir au moins 6 caractères", "400", "validation_error"));
        }

        return await this.repository.updateUser(id, data);
    }

    async deleteUser(params: DeleteUserParams): Promise<Either<AppError, boolean>> {
        // Logique métier : validation
        if (!params.id || params.id.trim() === '') {
            return left(new AppError("L'ID utilisateur est requis", "400", "validation_error"));
        }

        return await this.repository.deleteUser(params);
    }

    private isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
}
