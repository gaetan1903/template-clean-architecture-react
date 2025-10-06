import { Either, left, right } from "@sweet-monads/either";
import { AppError } from "../types/AppError";
import { AuthTokens, LoginCredentials, TokenPayload } from "../types/AuthTypes";
import TokenService, { ITokenService } from "./tokenService";
import AxiosService from "./axiosService";

export interface IAuthService {
    login(credentials: LoginCredentials): Promise<Either<AppError, AuthTokens>>;
    logout(): Promise<Either<AppError, boolean>>;
    refreshToken(): Promise<Either<AppError, AuthTokens>>;
    getValidToken(): Promise<Either<AppError, string>>;
    isAuthenticated(): boolean;
    getCurrentUser(): Either<AppError, TokenPayload>;
    checkTokenExpiration(): Promise<Either<AppError, boolean>>;
}

export class AuthService implements IAuthService {
    private static instance: AuthService;
    private tokenService: ITokenService = TokenService.getInstance();
    private axiosService = AxiosService.getInstance();
    
    // Prévenir les appels multiples simultanés de refresh
    private refreshPromise: Promise<Either<AppError, AuthTokens>> | null = null;
    
    // Cache pour éviter les vérifications trop fréquentes
    private lastTokenCheck: number = 0;
    private readonly TOKEN_CHECK_INTERVAL = 30000; // 30 secondes

    private constructor() {}

    public static getInstance(): AuthService {
        if (!AuthService.instance) {
            AuthService.instance = new AuthService();
        }
        return AuthService.instance;
    }

    /**
     * Authentifie un utilisateur avec email/password
     */
    public async login(credentials: LoginCredentials): Promise<Either<AppError, AuthTokens>> {
        try {
            // Validation des credentials
            if (!credentials.email || !credentials.password) {
                return left(new AppError("Email et mot de passe requis", "400", "missing_credentials"));
            }

            // Validation du format email
            if (!this.isValidEmail(credentials.email)) {
                return left(new AppError("Format d'email invalide", "400", "invalid_email_format"));
            }

            // Appel API de login
            const response = await this.axiosService.post('/auth/login', {
                email: credentials.email.trim().toLowerCase(),
                password: credentials.password
            });
            
            if (!response.data || !response.data.accessToken || !response.data.refreshToken) {
                return left(new AppError(
                    "Réponse d'authentification invalide", 
                    "400", 
                    "invalid_auth_response"
                ));
            }

            const tokens: AuthTokens = {
                accessToken: response.data.accessToken,
                refreshToken: response.data.refreshToken
            };

            // Stockage des tokens avec validation
            const setResult = this.tokenService.setTokens(tokens.accessToken, tokens.refreshToken);
            if (setResult.isLeft()) {
                return left(setResult.value);
            }

            // Reset du cache de vérification
            this.lastTokenCheck = Date.now();

            return right(tokens);
        } catch (error: any) {
            if (error.response?.status === 401) {
                return left(new AppError("Email ou mot de passe incorrect", "401", "invalid_credentials"));
            }
            if (error.response?.status === 429) {
                return left(new AppError("Trop de tentatives, réessayez plus tard", "429", "too_many_attempts"));
            }
            return left(new AppError("Erreur de connexion", "500", error));
        }
    }

    /**
     * Déconnecte l'utilisateur (côté client et serveur)
     */
    public async logout(): Promise<Either<AppError, boolean>> {
        try {
            // Récupération du refresh token pour l'invalidation côté serveur
            const refreshTokenResult = this.tokenService.getRefreshToken();
            
            if (refreshTokenResult.isRight()) {
                try {
                    // Tentative d'invalidation côté serveur
                    await this.axiosService.post('/auth/logout', {
                        refreshToken: refreshTokenResult.value
                    });
                } catch (error) {
                    // On continue même si l'invalidation serveur échoue
                    console.warn('Erreur lors de l\'invalidation côté serveur:', error);
                }
            }

            // Nettoyage local obligatoire
            this.tokenService.clearTokens();
            this.refreshPromise = null;
            this.lastTokenCheck = 0;

            return right(true);
        } catch (error) {
            // En cas d'erreur, on fait quand même le nettoyage local
            this.tokenService.clearTokens();
            this.refreshPromise = null;
            this.lastTokenCheck = 0;
            
            return left(new AppError("Erreur lors de la déconnexion", "500", error));
        }
    }

    /**
     * Renouvelle le token d'accès avec le refresh token
     */
    public async refreshToken(): Promise<Either<AppError, AuthTokens>> {
        // Éviter les appels multiples simultanés
        if (this.refreshPromise) {
            return this.refreshPromise;
        }

        this.refreshPromise = this.performRefresh();
        const result = await this.refreshPromise;
        this.refreshPromise = null;
        
        return result;
    }

    /**
     * Effectue le refresh du token
     */
    private async performRefresh(): Promise<Either<AppError, AuthTokens>> {
        try {
            const refreshTokenResult = this.tokenService.getRefreshToken();
            if (refreshTokenResult.isLeft()) {
                return left(refreshTokenResult.value);
            }

            const refreshToken = refreshTokenResult.value;

            // Appel API de refresh
            const response = await this.axiosService.post('/auth/refresh', { 
                refreshToken 
            });

            if (!response.data || !response.data.accessToken) {
                this.tokenService.clearTokens();
                return left(new AppError("Échec du renouvellement du token", "401", "refresh_failed"));
            }

            const tokens: AuthTokens = {
                accessToken: response.data.accessToken,
                refreshToken: response.data.refreshToken || refreshToken // Garder l'ancien si pas de nouveau
            };

            // Stockage des nouveaux tokens
            const setResult = this.tokenService.setTokens(tokens.accessToken, tokens.refreshToken);
            if (setResult.isLeft()) {
                this.tokenService.clearTokens();
                return left(setResult.value);
            }

            // Reset du cache
            this.lastTokenCheck = Date.now();

            return right(tokens);
        } catch (error: any) {
            // En cas d'erreur, nettoyer les tokens
            this.tokenService.clearTokens();
            
            if (error.response?.status === 401) {
                return left(new AppError("Session expirée, veuillez vous reconnecter", "401", "refresh_expired"));
            }
            
            return left(new AppError("Erreur lors du renouvellement du token", "500", error));
        }
    }

    /**
     * Récupère un token valide (avec refresh automatique si nécessaire)
     */
    public async getValidToken(): Promise<Either<AppError, string>> {
        // 1. Vérification du cache récent
        const now = Date.now();
        if (now - this.lastTokenCheck < this.TOKEN_CHECK_INTERVAL) {
            const tokenResult = this.tokenService.getAccessToken();
            if (tokenResult.isRight()) {
                return tokenResult;
            }
        }

        // 2. Vérification complète du token
        const tokenResult = this.tokenService.getAccessToken();
        if (tokenResult.isRight()) {
            this.lastTokenCheck = now;
            return tokenResult;
        }

        // 3. Le token est invalide/expiré, essayer le refresh si possible
        if (this.tokenService.shouldRefreshToken()) {
            const refreshResult = await this.refreshToken();
            
            if (refreshResult.isRight()) {
                return right(refreshResult.value.accessToken);
            }
        }

        // 4. Tout a échoué, l'utilisateur doit se reconnecter
        return left(new AppError("Authentification requise", "401", "authentication_required"));
    }

    /**
     * Vérifie si l'utilisateur est authentifié
     */
    public isAuthenticated(): boolean {
        const tokenResult = this.tokenService.getAccessToken();
        return tokenResult.isRight();
    }

    /**
     * Récupère les informations de l'utilisateur actuel depuis le token
     */
    public getCurrentUser(): Either<AppError, TokenPayload> {
        const tokenResult = this.tokenService.getAccessToken();
        if (tokenResult.isLeft()) {
            return left(tokenResult.value);
        }

        return this.tokenService.getTokenPayload(tokenResult.value);
    }

    /**
     * Vérifie l'expiration du token et effectue un refresh si nécessaire
     */
    public async checkTokenExpiration(): Promise<Either<AppError, boolean>> {
        try {
            // Vérifier si un refresh est nécessaire
            if (this.tokenService.shouldRefreshToken()) {
                const refreshResult = await this.refreshToken();
                if (refreshResult.isLeft()) {
                    return left(refreshResult.value);
                }
                return right(true); // Token renouvelé
            }

            // Vérifier si le token est encore valide
            if (this.isAuthenticated()) {
                return right(false); // Token valide, pas de refresh nécessaire
            }

            // Token invalide
            return left(new AppError("Token invalide", "401", "token_invalid"));
        } catch (error) {
            return left(new AppError("Erreur lors de la vérification du token", "500", error));
        }
    }

    /**
     * Validation du format email
     */
    private isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
}

export default AuthService;