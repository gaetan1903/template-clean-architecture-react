import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// Augmentation du type de configuration Axios pour ajouter des champs de debug
declare module 'axios' {
    export interface InternalAxiosRequestConfig {
        requestId?: string;
        startTime?: number;
    }
}

export interface IAxiosService {
    get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
    post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
    put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
    patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
    delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
    getAxiosInstance(): AxiosInstance;
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
     * Configuration des intercepteurs de base
     */
    private setupBasicInterceptors(): void {
        // Intercepteur de requete basique
        this.axiosInstance.interceptors.request.use(
            (config: InternalAxiosRequestConfig) => {
                // Ajout d'un ID de requete pour le debugging
                config.requestId = Math.random().toString(36).slice(2, 11);
                config.startTime = Date.now();

                return config;
            },
            (error) => {
                console.error('Erreur dans l\'intercepteur de requete:', error);
                return Promise.reject(error);
            }
        );

        // Intercepteur de reponse basique
        this.axiosInstance.interceptors.response.use(
            (response) => response,
            (error) => {
                // Log des erreurs pour debugging
                const config = error.config as InternalAxiosRequestConfig | undefined;
                const duration = Date.now() - (config?.startTime ?? 0);
                console.error(`Erreur requete ${config?.requestId} apres ${duration}ms:`, {
                    status: error.response?.status,
                    message: error.response?.data?.message || error.message,
                    url: config?.url,
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
