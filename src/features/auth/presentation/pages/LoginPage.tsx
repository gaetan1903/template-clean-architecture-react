import React, { useState } from 'react';
import { Button, Card, CardContent, CardHeader, InputGroup, Spinner } from '@heroui/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../../core/hooks/useAuth';

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, isLoading, error: authError, clearError } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [localError, setLocalError] = useState<string | null>(null);

    // URL de redirection après login (préservée par PrivateRoute)
    const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError(null);
        clearError();

        if (!email.trim() || !password.trim()) {
            setLocalError('Email et mot de passe requis');
            return;
        }

        const result = await login(email, password);

        if (result.isRight()) {
            navigate(from, { replace: true });
        }
        // Les erreurs sont gérées par le store via authError
    };

    const displayError = localError || authError;

    return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-50">
            <Card className="w-full max-w-sm shadow-lg">
                <CardHeader className="flex flex-col items-center pt-8 pb-2">
                    <h1 className="text-2xl font-bold">Connexion</h1>
                </CardHeader>
                <CardContent className="flex flex-col gap-4 pb-8">
                    {displayError && (
                        <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg px-4 py-3 text-sm">
                            {displayError}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium" htmlFor="email">Email</label>
                            <InputGroup variant="primary" fullWidth>
                                <InputGroup.Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    autoComplete="email"
                                    autoFocus
                                    disabled={isLoading}
                                />
                            </InputGroup>
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium" htmlFor="password">Mot de passe</label>
                            <InputGroup variant="primary" fullWidth>
                                <InputGroup.Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    autoComplete="current-password"
                                    disabled={isLoading}
                                />
                            </InputGroup>
                        </div>

                        <Button
                            type="submit"
                            variant="primary"
                            fullWidth
                            isDisabled={isLoading}
                        >
                            {isLoading ? <Spinner size="sm" /> : 'Se connecter'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default LoginPage;
