export interface ILocalStorageService {
    getAccessToken(): string | null;
    setAccessToken(token: string): void;
    getRefreshToken(): string | null;
    setRefreshToken(token: string): void;
    removeTokens(): void;
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
    removeItem(key: string): void;
    clear(): void;
}

class LocalStorageService implements ILocalStorageService {
    private static instance: LocalStorageService;
    private readonly ACCESS_TOKEN_KEY = 'access_token';
    private readonly REFRESH_TOKEN_KEY = 'refresh_token';

    private constructor() {}

    public static getInstance(): LocalStorageService {
        if (!LocalStorageService.instance) {
            LocalStorageService.instance = new LocalStorageService();
        }
        return LocalStorageService.instance;
    }

    public getAccessToken(): string | null {
        return this.getItem(this.ACCESS_TOKEN_KEY);
    }

    public setAccessToken(token: string): void {
        this.setItem(this.ACCESS_TOKEN_KEY, token);
    }

    public getRefreshToken(): string | null {
        return this.getItem(this.REFRESH_TOKEN_KEY);
    }

    public setRefreshToken(token: string): void {
        this.setItem(this.REFRESH_TOKEN_KEY, token);
    }

    public removeTokens(): void {
        this.removeItem(this.ACCESS_TOKEN_KEY);
        this.removeItem(this.REFRESH_TOKEN_KEY);
    }

    public getItem(key: string): string | null {
        try {
            return localStorage.getItem(key);
        } catch (error) {
            console.error(`Error getting item ${key} from localStorage:`, error);
            return null;
        }
    }

    public setItem(key: string, value: string): void {
        try {
            localStorage.setItem(key, value);
        } catch (error) {
            console.error(`Error setting item ${key} in localStorage:`, error);
        }
    }

    public removeItem(key: string): void {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error(`Error removing item ${key} from localStorage:`, error);
        }
    }

    public clear(): void {
        try {
            localStorage.clear();
        } catch (error) {
            console.error('Error clearing localStorage:', error);
        }
    }
}

export default LocalStorageService;
