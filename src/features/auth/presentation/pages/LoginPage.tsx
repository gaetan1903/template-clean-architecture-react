import { Button, Card, CardContent, CardHeader, InputGroup, Spinner } from '@heroui/react';
import { useLoginForm } from '../hooks/useLoginForm';
import { useRedirectAfterAuth } from '../hooks/useRedirectAfterAuth';

const LoginPage = () => {
    const { email, password, error, isLoading, setEmail, setPassword, submit } = useLoginForm();
    const { redirectAfterLogin } = useRedirectAfterAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const success = await submit();
        if (success) {
            redirectAfterLogin();
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center page-bg">
            <Card className="w-full max-w-sm shadow-lg">
                <CardHeader className="flex flex-col items-center pt-8 pb-2">
                    <h1 className="text-2xl font-bold">Connexion</h1>
                </CardHeader>
                <CardContent className="flex flex-col gap-4 pb-8">
                    {error && (
                        <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg px-4 py-3 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium" htmlFor="email">Email</label>
                            <InputGroup fullWidth>
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
                            <InputGroup fullWidth>
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
