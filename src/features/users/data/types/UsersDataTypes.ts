/**
 * Types pour les paramètres des méthodes du DataSource Users
 * Évite l'utilisation de types inline ou any
 */

/**
 * Filtres pour la récupération des utilisateurs
 */
export interface GetUsersFiltersParams {
    page?: number;
    search?: string;
    status?: string;
    role?: string;
}

/**
 * Données pour créer un utilisateur
 */
export interface CreateUserDataParams {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role?: string;
    phoneNumber?: string;
    status?: string;
}

/**
 * Données pour mettre à jour un utilisateur
 */
export interface UpdateUserDataParams {
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    role?: string;
    phoneNumber?: string;
    status?: string;
}

/**
 * Paramètres pour la recherche d'utilisateur par ID
 */
export interface GetUserByIdParams {
    id: string;
}

/**
 * Paramètres pour la suppression d'utilisateur
 */
export interface DeleteUserParams {
    id: string;
}