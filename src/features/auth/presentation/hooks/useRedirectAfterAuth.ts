import { useLocation, useNavigate } from 'react-router-dom';

/**
 * Hook de presentation -- gere la redirection apres une authentification reussie.
 * Recupere l'URL de destination preservee par PrivateRoute via le location state.
 *
 * Usage :
 *   const { redirectAfterLogin } = useRedirectAfterAuth();
 *   await login(...);
 *   redirectAfterLogin();
 */
export const useRedirectAfterAuth = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // PrivateRoute preserve l'URL d'origine dans location.state.from
    const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

    const redirectAfterLogin = () => {
        navigate(from, { replace: true });
    };

    return { redirectAfterLogin, from };
};
