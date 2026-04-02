/**
 * Utilitaires de validation partagés
 * Utilisé par les UseCases et les Services pour éviter la duplication
 */

/**
 * Valide le format d'un email
 */
export const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Vérifie qu'une chaîne n'est pas vide (après trim)
 */
export const isNotEmpty = (value: string | null | undefined): boolean => {
    return value !== null && value !== undefined && value.trim().length > 0;
};
