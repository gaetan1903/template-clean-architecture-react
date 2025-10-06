/**
 * Types pour les paramètres des méthodes du Domain Users
 * Évite l'utilisation de types inline ou any dans les repositories et use cases
 */

/**
 * Filtres pour la récupération des utilisateurs au niveau domain
 */
export interface GetUsersFiltersParams {
    page?: number;
    search?: string;
    status?: string;
    role?: string;
}

/**
 * Données pour créer un utilisateur au niveau domain
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
 * Données pour mettre à jour un utilisateur au niveau domain
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