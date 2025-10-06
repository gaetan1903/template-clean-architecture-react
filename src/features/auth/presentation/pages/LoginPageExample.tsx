import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    TextField,
    Button,
    Typography,
    Alert,
    CircularProgress,
    Container
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../../../../core/hooks/useAuth';

interface LocationState {
    from?: {
        pathname: string;
    };
}

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, isLoading, error, clearError } = useAuth();
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [validationErrors, setValidationErrors] = useState<{
        email?: string;
        password?: string;
    }>({});

    // Récupérer la route de redirection depuis le state
    const from = (location.state as LocationState)?.from?.pathname || '/dashboard';

    // Nettoyer l'erreur Redux quand on quitte la page
    useEffect(() => {
        return () => {
            if (error) {
                clearError();
            }
        };
    }, [error, clearError]);

    const validateForm = (): boolean => {
        const errors: { email?: string; password?: string } = {};

        if (!email.trim()) {
            errors.email = 'L\'email est requis';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.email = 'Format d\'email invalide';
        }

        if (!password) {
            errors.password = 'Le mot de passe est requis';
        } else if (password.length < 6) {
            errors.password = 'Le mot de passe doit contenir au moins 6 caractères';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Nettoyer l'erreur Redux si elle existe
        if (error) {
            clearError();
        }

        if (!validateForm()) {
            return;
        }

        const result = await login(email.trim(), password);

        if (result.isRight()) {
            // Connexion réussie
            console.log('Connexion réussie, redirection vers:', from);
            navigate(from, { replace: true });
        }
        // L'erreur est automatiquement gérée par Redux et affichée via le state error
    };

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
        if (validationErrors.email) {
            setValidationErrors(prev => ({ ...prev, email: undefined }));
        }
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
        if (validationErrors.password) {
            setValidationErrors(prev => ({ ...prev, password: undefined }));
        }
    };

    return (
        <Container component="main" maxWidth="sm">
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Paper
                    elevation={3}
                    sx={{
                        padding: 4,
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <Typography component="h1" variant="h4" gutterBottom>
                        Connexion
                    </Typography>

                    <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
                        Connectez-vous à votre compte pour accéder à l'application
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            label="Adresse email"
                            name="email"
                            autoComplete="email"
                            autoFocus
                            value={email}
                            onChange={handleEmailChange}
                            error={!!validationErrors.email}
                            helperText={validationErrors.email}
                            disabled={isLoading}
                        />
                        
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Mot de passe"
                            type="password"
                            id="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={handlePasswordChange}
                            error={!!validationErrors.password}
                            helperText={validationErrors.password}
                            disabled={isLoading}
                        />
                        
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                            disabled={isLoading}
                            startIcon={isLoading ? <CircularProgress size={20} /> : null}
                        >
                            {isLoading ? 'Connexion...' : 'Se connecter'}
                        </Button>
                    </Box>

                    <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
                        Template Clean Architecture React
                    </Typography>
                </Paper>
            </Box>
        </Container>
    );
};

export default LoginPage;