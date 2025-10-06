import { InternalAxiosRequestConfig, AxiosError } from "axios";
import AuthService from "./authService";
import AxiosService from "./axiosService";

interface QueueItem {
    resolve: (value: any) => void;
    reject: (error: any) => void;
}

export class AxiosInterceptor {
    private static instance: AxiosInterceptor;
    private authService = AuthService.getInstance();
    private axiosService = AxiosService.getInstance();
    private isRefreshing = false;
    private failedQueue: QueueItem[] = [];
    private isInitialized = false;

    private constructor() {}

    public static getInstance(): AxiosInterceptor {
        if (!AxiosInterceptor.instance) {
            AxiosInterceptor.instance = new AxiosInterceptor();
        }
        return AxiosInterceptor.instance;
    }

    /**
     * Initialise les intercepteurs Axios pour la gestion automatique des tokens
     */
    public initialize(): void {
        if (this.isInitialized) {
            return;
        }

        const axiosInstance = this.axiosService.getAxiosInstance();

        // Intercepteur de requête : ajouter le token automatiquement
        axiosInstance.interceptors.request.use(
            async (config: InternalAxiosRequestConfig) => {
                // Exclure les routes d'authentification
                if (this.isAuthRoute(config.url || '')) {
                    return config;
                }

                try {
                    const tokenResult = await this.authService.getValidToken();
                    
                    if (tokenResult.isRight()) {
                        config.headers = config.headers || {};
                        config.headers.Authorization = `Bearer ${tokenResult.value}`;
                    }
                } catch (error) {
                    console.warn('Impossible de récupérer un token valide pour la requête:', error);
                }
                
                return config;
            },
            (error: AxiosError) => {
                return Promise.reject(error);
            }
        );

        // Intercepteur de réponse : gérer les erreurs 401 avec retry automatique
        axiosInstance.interceptors.response.use(
            (response) => response,
            async (error: AxiosError) => {
                const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

                // Ne pas traiter les erreurs qui ne sont pas 401
                if (error.response?.status !== 401) {
                    return Promise.reject(error);
                }

                // Ne pas traiter les routes d'auth pour éviter les boucles infinies
                if (this.isAuthRoute(originalRequest?.url || '')) {
                    return Promise.reject(error);
                }

                // Ne pas retry une requête déjà retryée
                if (originalRequest._retry) {
                    // Si c'est déjà un retry qui échoue, déconnecter l'utilisateur
                    await this.handleAuthenticationFailure();
                    return Promise.reject(error);
                }

                // Si un refresh est en cours, mettre la requête en queue
                if (this.isRefreshing) {
                    return new Promise((resolve, reject) => {
                        this.failedQueue.push({ resolve, reject });
                    }).then((token) => {
                        if (originalRequest.headers) {
                            originalRequest.headers.Authorization = `Bearer ${token}`;
                        }
                        return axiosInstance(originalRequest);
                    }).catch(err => {
                        return Promise.reject(err);
                    });
                }

                // Marquer comme retry et commencer le processus de refresh
                originalRequest._retry = true;
                this.isRefreshing = true;

                try {
                    const refreshResult = await this.authService.refreshToken();
                    
                    if (refreshResult.isRight()) {
                        const newToken = refreshResult.value.accessToken;
                        
                        // Traiter la queue des requêtes en attente
                        this.processQueue(null, newToken);
                        
                        // Retry la requête originale avec le nouveau token
                        if (originalRequest.headers) {
                            originalRequest.headers.Authorization = `Bearer ${newToken}`;
                        }
                        
                        return axiosInstance(originalRequest);
                    } else {
                        // Le refresh a échoué
                        this.processQueue(refreshResult.value, null);
                        await this.handleAuthenticationFailure();
                        return Promise.reject(refreshResult.value);
                    }
                } catch (refreshError) {
                    // Erreur lors du refresh
                    this.processQueue(refreshError, null);
                    await this.handleAuthenticationFailure();
                    return Promise.reject(refreshError);
                } finally {
                    this.isRefreshing = false;
                }
            }
        );

        this.isInitialized = true;
        console.debug('AxiosInterceptor initialisé avec succès');
    }

    /**
     * Traite la queue des requêtes en attente après un refresh
     */
    private processQueue(error: any, token: string | null): void {
        this.failedQueue.forEach(({ resolve, reject }) => {
            if (error) {
                reject(error);
            } else {
                resolve(token);
            }
        });
        
        this.failedQueue = [];
    }

    /**
     * Vérifie si l'URL est une route d'authentification
     */
    private isAuthRoute(url: string): boolean {
        const authRoutes = ['/auth/login', '/auth/refresh', '/auth/logout', '/auth/register'];
        return authRoutes.some(route => url.includes(route));
    }

    /**
     * Gère l'échec d'authentification (déconnexion et redirection)
     */
    private async handleAuthenticationFailure(): Promise<void> {
        try {
            // Déconnecter l'utilisateur
            await this.authService.logout();
            
            // Redirection vers la page de login
            // Éviter la redirection si on est déjà sur la page de login
            if (!window.location.pathname.includes('/login')) {
                const currentPath = window.location.pathname + window.location.search;
                const redirectUrl = encodeURIComponent(currentPath);
                window.location.href = `/login?redirect=${redirectUrl}`;
            }
        } catch (error) {
            console.error('Erreur lors de la gestion de l\'échec d\'authentification:', error);
            // En cas d'erreur, forcer la redirection vers login
            window.location.href = '/login';
        }
    }

    /**
     * Nettoyage des intercepteurs
     */
    public destroy(): void {
        const axiosInstance = this.axiosService.getAxiosInstance();
        
        // Supprimer tous les intercepteurs
        axiosInstance.interceptors.request.clear();
        axiosInstance.interceptors.response.clear();
        
        // Reset des états
        this.isRefreshing = false;
        this.failedQueue = [];
        this.isInitialized = false;
        
        console.debug('AxiosInterceptor détruit');
    }

    /**
     * Obtient des statistiques sur l'état de l'intercepteur
     */
    public getStats(): { isRefreshing: boolean; queueLength: number; isInitialized: boolean } {
        return {
            isRefreshing: this.isRefreshing,
            queueLength: this.failedQueue.length,
            isInitialized: this.isInitialized
        };
    }
}

export default AxiosInterceptor;