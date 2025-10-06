import { Either, left, right } from "@sweet-monads/either";
import { AppError } from "../types/AppError";
import { TokenPayload, TokenValidationResult } from "../types/AuthTypes";

export interface ITokenService {
    getAccessToken(): Either<AppError, string>;
    getRefreshToken(): Either<AppError, string>;
    setTokens(accessToken: string, refreshToken: string): Either<AppError, boolean>;
    isTokenValid(token: string): boolean;
    isTokenExpired(token: string): boolean;
    getTokenPayload(token: string): Either<AppError, TokenPayload>;
    validateToken(token: string): TokenValidationResult;
    shouldRefreshToken(): boolean;
    clearTokens(): void;
    getTokenTimeRemaining(token: string): number;
}

export class TokenService implements ITokenService {
    private static instance: TokenService;
    private readonly ACCESS_TOKEN_KEY = 'access_token';
    private readonly REFRESH_TOKEN_KEY = 'refresh_token';
    
    // Buffer de 5 minutes avant expiration pour refresh automatique
    private readonly REFRESH_BUFFER_MINUTES = 5;

    private constructor() {}

    public static getInstance(): TokenService {
        if (!TokenService.instance) {
            TokenService.instance = new TokenService();
        }
        return TokenService.instance;
    }

    /**
     * Récupère le token d'accès avec validation automatique
     */
    public getAccessToken(): Either<AppError, string> {
        try {
            const token = this.getStoredToken(this.ACCESS_TOKEN_KEY);
            
            if (!token) {
                return left(new AppError("Token d'accès non trouvé", "401", "access_token_not_found"));
            }

            const validation = this.validateToken(token);
            
            if (!validation.isValid) {
                this.clearTokens();
                return left(new AppError(
                    validation.error || "Token d'accès invalide", 
                    "401", 
                    "access_token_invalid"
                ));
            }

            if (validation.isExpired) {
                this.clearTokens();
                return left(new AppError("Token d'accès expiré", "401", "access_token_expired"));
            }

            return right(token);
        } catch (error) {
            return left(new AppError("Erreur lors de la récupération du token", "500", error));
        }
    }

    /**
     * Récupère le token de refresh
     */
    public getRefreshToken(): Either<AppError, string> {
        try {
            const token = this.getStoredToken(this.REFRESH_TOKEN_KEY);
            
            if (!token) {
                return left(new AppError("Token de refresh non trouvé", "401", "refresh_token_not_found"));
            }

            // Validation basique du refresh token
            if (!this.isTokenValid(token)) {
                this.clearTokens();
                return left(new AppError("Token de refresh invalide", "401", "refresh_token_invalid"));
            }

            return right(token);
        } catch (error) {
            return left(new AppError("Erreur lors de la récupération du refresh token", "500", error));
        }
    }

    /**
     * Stocke les tokens avec validation préalable
     */
    public setTokens(accessToken: string, refreshToken: string): Either<AppError, boolean> {
        try {
            // Validation du token d'accès
            const accessValidation = this.validateToken(accessToken);
            if (!accessValidation.isValid) {
                return left(new AppError(
                    "Token d'accès invalide lors du stockage", 
                    "400", 
                    "invalid_access_token_format"
                ));
            }

            // Validation du token de refresh
            if (!this.isTokenValid(refreshToken)) {
                return left(new AppError(
                    "Token de refresh invalide lors du stockage", 
                    "400", 
                    "invalid_refresh_token_format"
                ));
            }

            // Stockage sécurisé
            this.setStoredToken(this.ACCESS_TOKEN_KEY, accessToken);
            this.setStoredToken(this.REFRESH_TOKEN_KEY, refreshToken);
            
            return right(true);
        } catch (error) {
            return left(new AppError("Erreur lors du stockage des tokens", "500", error));
        }
    }

    /**
     * Vérifie si un token est valide (format et signature)
     */
    public isTokenValid(token: string): boolean {
        try {
            const parts = token.split('.');
            if (parts.length !== 3) {
                return false;
            }

            // Validation du format JWT
            const payload = this.decodeJWTPayload(token);
            return payload !== null;
        } catch {
            return false;
        }
    }

    /**
     * Vérifie si un token est expiré
     */
    public isTokenExpired(token: string): boolean {
        try {
            const payload = this.decodeJWTPayload(token);
            if (!payload || !payload.exp) {
                return true;
            }
            
            const currentTime = Math.floor(Date.now() / 1000);
            return payload.exp < currentTime;
        } catch {
            return true;
        }
    }

    /**
     * Récupère le payload décodé d'un token
     */
    public getTokenPayload(token: string): Either<AppError, TokenPayload> {
        try {
            const payload = this.decodeJWTPayload(token);
            if (!payload) {
                return left(new AppError("Token invalide - impossible de décoder", "400", "token_decode_failed"));
            }

            // Validation des champs obligatoires
            if (!payload.userId || !payload.email || !payload.exp || !payload.iat) {
                return left(new AppError("Token invalide - champs manquants", "400", "token_missing_fields"));
            }

            return right(payload);
        } catch (error) {
            return left(new AppError("Erreur lors du décodage du token", "400", error));
        }
    }

    /**
     * Validation complète d'un token
     */
    public validateToken(token: string): TokenValidationResult {
        try {
            if (!this.isTokenValid(token)) {
                return {
                    isValid: false,
                    isExpired: false,
                    payload: null,
                    error: "Format de token invalide"
                };
            }

            const payload = this.decodeJWTPayload(token);
            if (!payload) {
                return {
                    isValid: false,
                    isExpired: false,
                    payload: null,
                    error: "Impossible de décoder le payload"
                };
            }

            const isExpired = this.isTokenExpired(token);
            
            return {
                isValid: true,
                isExpired,
                payload,
                error: isExpired ? "Token expiré" : undefined
            };
        } catch (error) {
            return {
                isValid: false,
                isExpired: false,
                payload: null,
                error: `Erreur de validation: ${error}`
            };
        }
    }

    /**
     * Détermine s'il faut refresh le token (dans les 5 minutes avant expiration)
     */
    public shouldRefreshToken(): boolean {
        try {
            const tokenResult = this.getAccessToken();
            if (tokenResult.isLeft()) {
                return false;
            }

            const token = tokenResult.value;
            const timeRemaining = this.getTokenTimeRemaining(token);
            const refreshBufferSeconds = this.REFRESH_BUFFER_MINUTES * 60;

            // Refresh si il reste moins de 5 minutes et que le token n'est pas encore expiré
            return timeRemaining <= refreshBufferSeconds && timeRemaining > 0;
        } catch {
            return false;
        }
    }

    /**
     * Retourne le temps restant avant expiration en secondes
     */
    public getTokenTimeRemaining(token: string): number {
        try {
            const payload = this.decodeJWTPayload(token);
            if (!payload || !payload.exp) {
                return 0;
            }

            const currentTime = Math.floor(Date.now() / 1000);
            const timeRemaining = payload.exp - currentTime;
            
            return Math.max(0, timeRemaining);
        } catch {
            return 0;
        }
    }

    /**
     * Supprime tous les tokens stockés
     */
    public clearTokens(): void {
        try {
            this.removeStoredToken(this.ACCESS_TOKEN_KEY);
            this.removeStoredToken(this.REFRESH_TOKEN_KEY);
        } catch (error) {
            console.error('Erreur lors de la suppression des tokens:', error);
        }
    }

    /**
     * Décode le payload JWT (partie centrale)
     */
    private decodeJWTPayload(token: string): TokenPayload | null {
        try {
            const parts = token.split('.');
            if (parts.length !== 3) {
                return null;
            }

            const payload = parts[1];
            // Correction du padding base64 si nécessaire
            const correctedPayload = payload.replace(/-/g, '+').replace(/_/g, '/');
            const decoded = atob(correctedPayload);
            
            return JSON.parse(decoded) as TokenPayload;
        } catch {
            return null;
        }
    }

    /**
     * Récupère un token du stockage avec gestion d'erreurs
     */
    private getStoredToken(key: string): string | null {
        try {
            return localStorage.getItem(key);
        } catch (error) {
            console.error(`Erreur lors de la récupération de ${key}:`, error);
            return null;
        }
    }

    /**
     * Stocke un token avec gestion d'erreurs
     */
    private setStoredToken(key: string, value: string): void {
        try {
            localStorage.setItem(key, value);
        } catch (error) {
            console.error(`Erreur lors du stockage de ${key}:`, error);
            throw error;
        }
    }

    /**
     * Supprime un token du stockage avec gestion d'erreurs
     */
    private removeStoredToken(key: string): void {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error(`Erreur lors de la suppression de ${key}:`, error);
        }
    }
}

export default TokenService;