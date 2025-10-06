import AxiosInterceptor from './services/axiosInterceptor';
import { store } from './store';
import { checkAuthProvider } from './redux/authSlice';

/**
 * Initialise les services de base de l'application
 * À appeler au démarrage de l'application
 */
export const initializeApp = (): void => {
    try {
        // Initialiser les intercepteurs Axios pour la gestion automatique des tokens
        const axiosInterceptor = AxiosInterceptor.getInstance();
        axiosInterceptor.initialize();
        
        // Vérifier l'authentification au démarrage
        store.dispatch(checkAuthProvider());
        
        console.info('✅ Services de base initialisés avec succès');
        console.info('   - Intercepteurs Axios configurés');
        console.info('   - Gestion automatique des tokens activée');
        console.info('   - Vérification d\'authentification démarrée');
    } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation des services:', error);
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
        
        console.info('✅ Nettoyage des services terminé');
    } catch (error) {
        console.error('❌ Erreur lors du nettoyage des services:', error);
    }
};

export default {
    initializeApp,
    cleanupApp
};