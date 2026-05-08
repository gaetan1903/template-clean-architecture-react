import { useState } from 'react';
import { useAuth } from '../../../../core/hooks/useAuth';
import { isValidEmail } from '../../../../core/utils/validators';

interface LoginFormState {
    email: string;
    password: string;
    localError: string | null;
}

interface UseLoginFormReturn {
    email: string;
    password: string;
    error: string | null;
    isLoading: boolean;
    setEmail: (value: string) => void;
    setPassword: (value: string) => void;
    submit: () => Promise<boolean>;
    reset: () => void;
}

/**
 * Hook de presentation -- encapsule la logique du formulaire de login.
 * Gere la validation locale, l'appel au store d'auth, et l'aggregation des erreurs.
 *
 * Retourne `true` si le login a reussi, `false` sinon.
 *
 * Usage :
 *   const { email, password, error, isLoading, setEmail, setPassword, submit } = useLoginForm();
 */
export const useLoginForm = (): UseLoginFormReturn => {
    const { login, isLoading, error: authError, clearError } = useAuth();

    const [form, setForm] = useState<LoginFormState>({
        email: '',
        password: '',
        localError: null,
    });

    const setEmail = (value: string) => {
        setForm((prev) => ({ ...prev, email: value, localError: null }));
        if (authError) clearError();
    };

    const setPassword = (value: string) => {
        setForm((prev) => ({ ...prev, password: value, localError: null }));
        if (authError) clearError();
    };

    const submit = async (): Promise<boolean> => {
        // Validation locale avant appel au store
        if (!form.email.trim() || !form.password.trim()) {
            setForm((prev) => ({ ...prev, localError: 'Email et mot de passe requis' }));
            return false;
        }

        if (!isValidEmail(form.email)) {
            setForm((prev) => ({ ...prev, localError: "Format d'email invalide" }));
            return false;
        }

        const result = await login(form.email, form.password);
        return result.isRight();
    };

    const reset = () => {
        setForm({ email: '', password: '', localError: null });
        clearError();
    };

    // Priorite : erreur locale > erreur store
    const error = form.localError || authError;

    return {
        email: form.email,
        password: form.password,
        error,
        isLoading,
        setEmail,
        setPassword,
        submit,
        reset,
    };
};
