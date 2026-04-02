import { Component, ErrorInfo, ReactNode } from 'react';
import { Container, Typography, Button, Box, Alert } from '@mui/material';

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

/**
 * ErrorBoundary — Capture les erreurs React runtime et affiche un fallback.
 * Empêche le crash complet de l'application.
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    handleReset = (): void => {
        this.setState({ hasError: false, error: null });
    };

    render(): ReactNode {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <Container maxWidth="sm">
                    <Box sx={{
                        minHeight: '100vh',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        textAlign: 'center',
                    }}>
                        <Typography variant="h4" gutterBottom>
                            Une erreur est survenue
                        </Typography>
                        <Alert severity="error" sx={{ mb: 3, width: '100%' }}>
                            {this.state.error?.message || 'Erreur inattendue'}
                        </Alert>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Button variant="contained" onClick={this.handleReset}>
                                Réessayer
                            </Button>
                            <Button variant="outlined" onClick={() => window.location.href = '/'}>
                                Retour à l'accueil
                            </Button>
                        </Box>
                    </Box>
                </Container>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
