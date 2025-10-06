import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

export interface IAxiosService {
    get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
    post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
    put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
    patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
    delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
    getAxiosInstance(): AxiosInstance;
    setAuthToken(token: string): void;
    clearAuthToken(): void;
}

class AxiosService implements IAxiosService {
    private static instance: AxiosService;
    private axiosInstance: AxiosInstance;

    private constructor() {
        this.axiosInstance = axios.create({
            baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Les intercepteurs seront configurés par AxiosInterceptor
        this.setupBasicInterceptors();
    }

    public static getInstance(): AxiosService {
        if (!AxiosService.instance) {
            AxiosService.instance = new AxiosService();
        }
        return AxiosService.instance;
    }

    /**
     * Retourne l'instance Axios pour configuration d'intercepteurs
     */
    public getAxiosInstance(): AxiosInstance {
        return this.axiosInstance;
    }

    /**
     * Définit le token d'authentification pour toutes les requêtes
     */
    public setAuthToken(token: string): void {
        this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    /**
     * Supprime le token d'authentification
     */
    public clearAuthToken(): void {
        delete this.axiosInstance.defaults.headers.common['Authorization'];
    }

    /**
     * Configuration des intercepteurs de base
     */
    private setupBasicInterceptors(): void {
        // Intercepteur de requête basique
        this.axiosInstance.interceptors.request.use(
            (config) => {
                // Ajout d'un ID de requête pour le debugging  
                (config as any).requestId = Math.random().toString(36).substr(2, 9);
                (config as any).startTime = Date.now();
                
                return config;
            },
            (error) => {
                console.error('Erreur dans l\'intercepteur de requête:', error);
                return Promise.reject(error);
            }
        );

        // Intercepteur de réponse basique
        this.axiosInstance.interceptors.response.use(
            (response) => {
                // Log du temps de réponse pour monitoring
                const duration = Date.now() - ((response.config as any).startTime || 0);
                console.debug(`Requête ${(response.config as any).requestId} terminée en ${duration}ms`);
                
                return response;
            },
            (error) => {
                // Log des erreurs pour debugging
                const duration = Date.now() - ((error.config as any)?.startTime || 0);
                console.error(`Erreur requête ${(error.config as any)?.requestId} après ${duration}ms:`, {
                    status: error.response?.status,
                    message: error.response?.data?.message || error.message,
                    url: error.config?.url
                });
                
                return Promise.reject(error);
            }
        );
    }

    public async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
        return this.axiosInstance.get<T>(url, config);
    }

    public async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
        return this.axiosInstance.post<T>(url, data, config);
    }

    public async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
        return this.axiosInstance.put<T>(url, data, config);
    }

    public async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
        return this.axiosInstance.patch<T>(url, data, config);
    }

    public async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
        return this.axiosInstance.delete<T>(url, config);
    }
}

export default AxiosService;
