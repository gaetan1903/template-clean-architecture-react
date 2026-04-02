/**
 * Entité métier User — interface (compatible Zustand serialization)
 */
export interface UserEntity {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    role: string;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Retourne le nom complet d'un utilisateur
 */
export const getFullName = (user: UserEntity): string => {
    return `${user.firstName} ${user.lastName}`;
};
