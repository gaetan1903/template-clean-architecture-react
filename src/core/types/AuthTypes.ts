/**
 * Types pour la gestion des tokens JWT
 */

export interface TokenPayload {
    exp: number;          // Expiration timestamp
    iat: number;          // Issued at timestamp
    userId: string;       // ID de l'utilisateur
    role: string;         // Rôle de l'utilisateur
    email: string;        // Email de l'utilisateur
    permissions?: string[]; // Permissions optionnelles
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface TokenValidationResult {
    isValid: boolean;
    isExpired: boolean;
    payload: TokenPayload | null;
    error?: string;
}