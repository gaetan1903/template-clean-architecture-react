import AxiosInterceptor from './services/axiosInterceptor';
import { useAuthStore } from './store/authStore';

/**
 * Initialise les services de base de l'application
 * À appeler au démarrage de l'application
 */
export const initializeApp = (): void => {
    try {
        // Initialiser les intercepteurs Axios pour la gestion automatique des tokens
        const axiosInterceptor = AxiosInterceptor.getInstance();
        axiosInterceptor.initialize();

        // Vérifier l'authentification au démarrage (accès direct au store Zustand)
        useAuthStore.getState().checkAuth();

        console.info('Services de base initialises avec succes');
        console.info('   - Intercepteurs Axios configures');
        console.info('   - Gestion automatique des tokens activee');
        console.info('   - Verification d\'authentification demarree');
    } catch (error) {
        console.error('Erreur lors de l\'initialisation des services:', error);
        throw error;
    }
};

/**
 * Nettoie les services lors de la fermeture de l'application
 */
export const cleanupApp = (): void => {
    try {
        const axiosInterceptor = AxiosInterceptor.getInstance();
        axiosInterceptor.destroy();

        console.info('Nettoyage des services termine');
    } catch (error) {
        console.error('Erreur lors du nettoyage des services:', error);
    }
};

export default {
    initializeApp,
    cleanupApp
};