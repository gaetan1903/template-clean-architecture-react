import { z } from 'zod';
import { UserEntity } from "../../domain/entities/UserEntity";
import { AppError } from '../../../../core/types/AppError';

// Schéma Zod pour valider les données d'API
const UserApiSchema = z.object({
    id: z.string().uuid("ID utilisateur doit être un UUID valide"),
    first_name: z.string().min(1, "Le prénom est requis").max(100, "Prénom trop long"),
    last_name: z.string().min(1, "Le nom est requis").max(100, "Nom trop long"),
    email: z.string().email("Format d'email invalide"),
    phone: z.string().nullable().optional(),
    role: z.enum(['ADMIN', 'USER', 'MODERATOR']),
    created_at: z.string().datetime("Date de création invalide"),
    updated_at: z.string().datetime("Date de mise à jour invalide")
});

// Schéma pour la création d'utilisateur (sans id, dates auto-générées)
const CreateUserApiSchema = z.object({
    first_name: z.string().min(1, "Le prénom est requis").max(100, "Prénom trop long"),
    last_name: z.string().min(1, "Le nom est requis").max(100, "Nom trop long"),
    email: z.string().email("Format d'email invalide"),
    phone: z.string().nullable().optional(),
    role: z.enum(['ADMIN', 'USER', 'MODERATOR']),
    password: z.string().min(6, "Mot de passe doit contenir au moins 6 caractères")
});

// Types TypeScript dérivés des schémas Zod
export type UserApiType = z.infer<typeof UserApiSchema>;
export type CreateUserApiType = z.infer<typeof CreateUserApiSchema>;

export class UserModel {
    /**
     * Convertit les données JSON de l'API vers une entité UserEntity
     * Avec validation Zod automatique
     */
    static fromJson(json: unknown): UserEntity {
        try {
            // Validation avec Zod
            const validatedData = UserApiSchema.parse(json);
            
            // Conversion vers Entity
            return new UserEntity(
                validatedData.id,
                validatedData.first_name,
                validatedData.last_name,
                validatedData.email,
                validatedData.phone ?? null,
                validatedData.role,
                new Date(validatedData.created_at),
                new Date(validatedData.updated_at)
            );
        } catch (error) {
            if (error instanceof z.ZodError) {
                // Formatting des erreurs Zod en AppError
                const errorMessage = error.issues.map((err: z.ZodIssue) => 
                    `${err.path.join('.')}: ${err.message}`
                ).join(', ');
                
                throw new AppError(
                    `Données utilisateur invalides: ${errorMessage}`,
                    "VALIDATION_ERROR",
                    { zodErrors: error.issues, receivedData: json }
                );
            }
            throw error;
        }
    }

    /**
     * Convertit une entité UserEntity vers le format JSON pour l'API
     */
    static toJson(entity: UserEntity): UserApiType {
        const apiData = {
            id: entity.id,
            first_name: entity.firstName,
            last_name: entity.lastName,
            email: entity.email,
            phone: entity.phone,
            role: entity.role as 'ADMIN' | 'USER' | 'MODERATOR',
            created_at: entity.createdAt.toISOString(),
            updated_at: entity.updatedAt.toISOString(),
        };

        // Validation du format de sortie (optionnel mais recommandé)
        return UserApiSchema.parse(apiData);
    }

    /**
     * Valide les données pour la création d'un utilisateur
     */
    static validateCreateData(data: unknown): CreateUserApiType {
        try {
            return CreateUserApiSchema.parse(data);
        } catch (error) {
            if (error instanceof z.ZodError) {
                const errorMessage = error.issues.map((err: z.ZodIssue) => 
                    `${err.path.join('.')}: ${err.message}`
                ).join(', ');
                
                throw new AppError(
                    `Données de création invalides: ${errorMessage}`,
                    "VALIDATION_ERROR",
                    { zodErrors: error.issues, receivedData: data }
                );
            }
            throw error;
        }
    }

    /**
     * Validation partielle pour les mises à jour (tous les champs optionnels)
     */
    static validateUpdateData(data: unknown): Partial<CreateUserApiType> {
        const UpdateUserApiSchema = CreateUserApiSchema.partial();
        
        try {
            return UpdateUserApiSchema.parse(data);
        } catch (error) {
            if (error instanceof z.ZodError) {
                const errorMessage = error.issues.map((err: z.ZodIssue) => 
                    `${err.path.join('.')}: ${err.message}`
                ).join(', ');
                
                throw new AppError(
                    `Données de mise à jour invalides: ${errorMessage}`,
                    "VALIDATION_ERROR",
                    { zodErrors: error.issues, receivedData: data }
                );
            }
            throw error;
        }
    }
}
