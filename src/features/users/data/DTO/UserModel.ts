import { UserEntity } from "../../domain/entities/UserEntity";

export class UserModel {
    static fromJson(json: any): UserEntity {
        return new UserEntity(
            json.id,
            json.first_name,
            json.last_name,
            json.email,
            json.phone ?? null,
            json.role,
            new Date(json.created_at),
            new Date(json.updated_at)
        );
    }

    static toJson(entity: UserEntity): any {
        return {
            id: entity.id,
            first_name: entity.firstName,
            last_name: entity.lastName,
            email: entity.email,
            phone: entity.phone,
            role: entity.role,
            created_at: entity.createdAt.toISOString(),
            updated_at: entity.updatedAt.toISOString(),
        };
    }
}
